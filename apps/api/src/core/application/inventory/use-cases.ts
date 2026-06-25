import type {
  DashboardSummary,
  InventoryBalance,
  ProductionOrderInput,
  PurchaseReceiptInput,
  SaleInput,
  WasteInput
} from "@inventory-management/shared";
import { inventoryBalanceSchema, purchaseReceiptSchema, productionOrderSchema, saleSchema, wasteSchema } from "@inventory-management/shared";
import {
  buildDashboardSummary,
  buildLedgerEntry,
  buildNextBalance,
  type StockMovement
} from "../../domain/inventory/index.js";
import type { DashboardCache, InventoryBalanceRepository, InventoryTransactionManager } from "./ports.js";

async function applyStockMovement(
  balances: InventoryBalanceRepository,
  ledger: { insert(entry: ReturnType<typeof buildLedgerEntry>): Promise<void> },
  movement: StockMovement
) {
  const existing = await balances.findByKey({
    branchId: movement.branchId,
    itemId: movement.itemId,
    batchNumber: movement.batchNumber
  });

  const nextBalance = inventoryBalanceSchema.parse(buildNextBalance(existing, movement));
  await balances.upsert(nextBalance);
  await ledger.insert(buildLedgerEntry(movement));
}

export class ReceiveGoodsUseCase {
  constructor(
    private readonly tx: InventoryTransactionManager,
    private readonly cache: DashboardCache
  ) {}

  async execute(input: PurchaseReceiptInput, userId: string) {
    const receipt = purchaseReceiptSchema.parse(input);

    const id = await this.tx.run(async (scope) => {
      const createdId = await scope.receipts.create(receipt);

      for (const line of receipt.lines) {
        await applyStockMovement(scope.balances, scope.ledger, {
          branchId: receipt.branchId,
          itemId: line.itemId,
          batchNumber: line.batchNumber,
          quantityDelta: line.quantity,
          unitCost: line.costPerUnit,
          movementKind: "purchase_receipt",
          referenceId: createdId,
          occurredAt: receipt.receivedAt,
          userId,
          expiryDate: line.expiryDate
        });
      }

      return createdId;
    });

    await this.cache.invalidateBranch(receipt.branchId);
    return { id };
  }
}

export class CompleteProductionOrderUseCase {
  constructor(
    private readonly tx: InventoryTransactionManager,
    private readonly cache: DashboardCache
  ) {}

  async execute(input: ProductionOrderInput, userId: string) {
    const order = productionOrderSchema.parse(input);

    const id = await this.tx.run(async (scope) => {
      const createdId = await scope.productionOrders.create({ ...order, status: "completed" });

      for (const ingredient of order.recipe.ingredients) {
        await applyStockMovement(scope.balances, scope.ledger, {
          branchId: order.branchId,
          itemId: ingredient.itemId,
          quantityDelta: -(ingredient.quantity * order.quantity) / order.recipe.outputQuantity,
          movementKind: "production_consume",
          referenceId: createdId,
          occurredAt: new Date().toISOString(),
          userId
        });
      }

      await applyStockMovement(scope.balances, scope.ledger, {
        branchId: order.branchId,
        itemId: order.productId,
        batchNumber: order.batchNumber,
        quantityDelta: order.quantity,
        movementKind: "production_output",
        referenceId: createdId,
        occurredAt: new Date().toISOString(),
        userId,
        expiryDate: order.expiryDate
      });

      return createdId;
    });

    await this.cache.invalidateBranch(order.branchId);
    return { id };
  }
}

export class RecordSaleUseCase {
  constructor(
    private readonly tx: InventoryTransactionManager,
    private readonly cache: DashboardCache
  ) {}

  async execute(input: SaleInput, userId: string) {
    const sale = saleSchema.parse(input);

    const id = await this.tx.run(async (scope) => {
      const createdId = await scope.sales.create(sale);

      for (const line of sale.lines) {
        await applyStockMovement(scope.balances, scope.ledger, {
          branchId: sale.branchId,
          itemId: line.productId,
          batchNumber: line.batchNumber,
          quantityDelta: -line.quantity,
          movementKind: "sale",
          referenceId: createdId,
          occurredAt: sale.soldAt,
          userId
        });
      }

      return createdId;
    });

    await this.cache.invalidateBranch(sale.branchId);
    return { id };
  }
}

export class RecordWasteUseCase {
  constructor(
    private readonly tx: InventoryTransactionManager,
    private readonly cache: DashboardCache
  ) {}

  async execute(input: WasteInput, userId: string) {
    const waste = wasteSchema.parse(input);

    const id = await this.tx.run(async (scope) => {
      const createdId = await scope.waste.create(waste);

      await applyStockMovement(scope.balances, scope.ledger, {
        branchId: waste.branchId,
        itemId: waste.itemId,
        batchNumber: waste.batchNumber,
        quantityDelta: -waste.quantity,
        movementKind: "waste",
        referenceId: createdId,
        occurredAt: new Date().toISOString(),
        userId
      });

      return createdId;
    });

    await this.cache.invalidateBranch(waste.branchId);
    return { id };
  }
}

export class GetInventoryBalancesUseCase {
  constructor(private readonly balances: InventoryBalanceRepository) {}

  async execute(branchId: string): Promise<InventoryBalance[]> {
    return this.balances.listByBranch(branchId);
  }
}

export class GetDashboardSummaryUseCase {
  constructor(
    private readonly balances: InventoryBalanceRepository,
    private readonly cache: DashboardCache
  ) {}

  async execute(branchId: string): Promise<DashboardSummary> {
    const cached = await this.cache.get(branchId);
    if (cached) {
      return cached;
    }

    const balances = await this.balances.listByBranch(branchId);
    const summary = buildDashboardSummary(branchId, balances);
    await this.cache.set(summary);
    return summary;
  }
}
