import type { DashboardSummary, InventoryBalance, StockLedgerEntry, StockMovementKind } from "@inventory-management/shared";

export type StockBalanceKey = {
  branchId: string;
  itemId: string;
  batchNumber?: string;
};

export type StockMovement = StockBalanceKey & {
  quantityDelta: number;
  unitCost?: number;
  movementKind: StockMovementKind;
  referenceId: string;
  occurredAt: string;
  userId: string;
  expiryDate?: string;
};

export class InventoryDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InventoryDomainError";
  }
}

export class InsufficientStockError extends InventoryDomainError {
  constructor(itemId: string) {
    super(`Insufficient stock for item ${itemId}`);
    this.name = "InsufficientStockError";
  }
}

export function buildLedgerEntry(movement: StockMovement): StockLedgerEntry {
  return {
    branchId: movement.branchId,
    itemId: movement.itemId,
    batchNumber: movement.batchNumber,
    quantityDelta: movement.quantityDelta,
    unitCost: movement.unitCost,
    movementKind: movement.movementKind,
    referenceId: movement.referenceId,
    occurredAt: movement.occurredAt,
    userId: movement.userId
  };
}

export function buildNextBalance(existing: InventoryBalance | null, movement: StockMovement): InventoryBalance {
  const currentQuantity = existing?.quantity ?? 0;
  const nextQuantity = currentQuantity + movement.quantityDelta;

  if (nextQuantity < 0) {
    throw new InsufficientStockError(movement.itemId);
  }

  return {
    branchId: movement.branchId,
    itemId: movement.itemId,
    batchNumber: movement.batchNumber,
    quantity: nextQuantity,
    averageCost: movement.unitCost ?? existing?.averageCost ?? 0,
    expiryDate: movement.expiryDate ?? existing?.expiryDate
  };
}

export function buildDashboardSummary(branchId: string, balances: InventoryBalance[]): DashboardSummary {
  const lowStockCount = balances.filter((entry) => entry.quantity <= 10).length;
  const inventoryValue = balances.reduce((sum, entry) => sum + entry.quantity * entry.averageCost, 0);

  return {
    branchId,
    lowStockCount,
    inventoryValue,
    todaysSales: 0,
    todaysWasteCost: 0
  };
}
