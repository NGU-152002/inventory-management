import { ObjectId } from "mongodb";
import type { InventoryBalance, StockLedgerEntry, StockMovementKind } from "@inventory-management/shared";
import { inventoryBalanceSchema, stockLedgerEntrySchema } from "@inventory-management/shared";
import { database, mongoClient } from "../../infrastructure/db/mongo.js";
import { redis } from "../../infrastructure/redis/client.js";

type ApplyMovementInput = {
  branchId: string;
  itemId: string;
  batchNumber?: string;
  quantityDelta: number;
  unitCost?: number;
  movementKind: StockMovementKind;
  referenceId: string;
  occurredAt: string;
  userId: string;
  expiryDate?: string;
};

export class InventoryService {
  private balances = database.collection<InventoryBalance>("inventory_balances");
  private ledger = database.collection<StockLedgerEntry>("stock_ledger");

  async applyMovement(input: ApplyMovementInput) {
    const ledgerEntry = stockLedgerEntrySchema.parse(input);
    const session = mongoClient.startSession();

    try {
      await session.withTransaction(async () => {
        const query = {
          branchId: input.branchId,
          itemId: input.itemId,
          batchNumber: input.batchNumber
        };

        const existing = await this.balances.findOne(query, { session });
        const currentQuantity = existing?.quantity ?? 0;
        const nextQuantity = currentQuantity + input.quantityDelta;

        if (nextQuantity < 0) {
          throw new Error(`Insufficient stock for item ${input.itemId}`);
        }

        const nextBalance = inventoryBalanceSchema.parse({
          branchId: input.branchId,
          itemId: input.itemId,
          batchNumber: input.batchNumber,
          quantity: nextQuantity,
          averageCost: input.unitCost ?? existing?.averageCost ?? 0,
          expiryDate: input.expiryDate ?? existing?.expiryDate
        });

        await this.balances.updateOne(
          query,
          { $set: nextBalance },
          { upsert: true, session }
        );

        await this.ledger.insertOne(
          {
            ...ledgerEntry,
            referenceId: input.referenceId || new ObjectId().toHexString()
          },
          { session }
        );
      });

      await redis.del(`cache:branch:${input.branchId}:dashboard`);
      await redis.del(`cache:branch:${input.branchId}:inventory`);
    } finally {
      await session.endSession();
    }
  }

  async listBalances(branchId: string) {
    return this.balances.find({ branchId }).sort({ itemId: 1 }).toArray();
  }

  async dashboard(branchId: string) {
    const cached = await redis.get(`cache:branch:${branchId}:dashboard`);
    if (cached) {
      return JSON.parse(cached);
    }

    const balances = await this.balances.find({ branchId }).toArray();
    const lowStockCount = balances.filter((entry) => entry.quantity <= 10).length;
    const inventoryValue = balances.reduce((sum, entry) => sum + entry.quantity * entry.averageCost, 0);
    const summary = {
      branchId,
      lowStockCount,
      inventoryValue,
      todaysSales: 0,
      todaysWasteCost: 0
    };

    await redis.set(`cache:branch:${branchId}:dashboard`, JSON.stringify(summary), {
      EX: 60
    });

    return summary;
  }
}

export const inventoryService = new InventoryService();

