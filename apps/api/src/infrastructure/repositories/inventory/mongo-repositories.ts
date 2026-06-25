import { ObjectId, type ClientSession } from "mongodb";
import type {
  DashboardSummary,
  InventoryBalance,
  ProductionOrderInput,
  PurchaseReceiptInput,
  SaleInput,
  StockLedgerEntry,
  WasteInput
} from "@inventory-management/shared";
import { database, mongoClient } from "../../db/mongo.js";
import { redis } from "../../redis/client.js";
import type {
  DashboardCache,
  GoodsReceiptRepository,
  InventoryBalanceRepository,
  InventoryTransactionManager,
  InventoryTransactionScope,
  ProductionOrderRepository,
  SalesRepository,
  StockLedgerRepository,
  WasteRepository
} from "../../../core/application/inventory/ports.js";
import type { StockBalanceKey } from "../../../core/domain/inventory/index.js";

function nowIso() {
  return new Date().toISOString();
}

class MongoInventoryBalanceRepository implements InventoryBalanceRepository {
  constructor(private readonly session?: ClientSession) {}

  private readonly collection = database.collection<InventoryBalance>("inventory_balances");

  async findByKey(key: StockBalanceKey) {
    return this.collection.findOne(key, { session: this.session });
  }

  async upsert(balance: InventoryBalance) {
    const timestamp = nowIso();

    await this.collection.updateOne(
      {
        branchId: balance.branchId,
        itemId: balance.itemId,
        batchNumber: balance.batchNumber
      },
      {
        $set: {
          ...balance,
          updatedAt: timestamp
        },
        $setOnInsert: {
          createdAt: timestamp
        }
      },
      { upsert: true, session: this.session }
    );
  }

  async listByBranch(branchId: string) {
    return this.collection.find({ branchId }, { session: this.session }).sort({ itemId: 1 }).toArray();
  }
}

class MongoStockLedgerRepository implements StockLedgerRepository {
  constructor(private readonly session?: ClientSession) {}

  private readonly collection = database.collection<StockLedgerEntry>("stock_ledger");

  async insert(entry: StockLedgerEntry) {
    const timestamp = nowIso();

    await this.collection.insertOne(
      {
        ...entry,
        referenceId: entry.referenceId || new ObjectId().toHexString(),
        createdAt: timestamp,
        updatedAt: timestamp
      },
      { session: this.session }
    );
  }
}

class MongoGoodsReceiptRepository implements GoodsReceiptRepository {
  constructor(private readonly session?: ClientSession) {}

  private readonly collection = database.collection("goods_receipts");

  async create(receipt: PurchaseReceiptInput) {
    const timestamp = nowIso();
    const inserted = await this.collection.insertOne(
      {
        ...receipt,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      { session: this.session }
    );
    return inserted.insertedId.toHexString();
  }
}

class MongoProductionOrderRepository implements ProductionOrderRepository {
  constructor(private readonly session?: ClientSession) {}

  private readonly collection = database.collection("production_orders");

  async create(order: ProductionOrderInput & { status: string }) {
    const timestamp = nowIso();
    const inserted = await this.collection.insertOne(
      {
        ...order,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      { session: this.session }
    );
    return inserted.insertedId.toHexString();
  }
}

class MongoSalesRepository implements SalesRepository {
  constructor(private readonly session?: ClientSession) {}

  private readonly collection = database.collection("sales");

  async create(sale: SaleInput) {
    const timestamp = nowIso();
    const inserted = await this.collection.insertOne(
      {
        ...sale,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      { session: this.session }
    );
    return inserted.insertedId.toHexString();
  }
}

class MongoWasteRepository implements WasteRepository {
  constructor(private readonly session?: ClientSession) {}

  private readonly collection = database.collection("waste_entries");

  async create(entry: WasteInput) {
    const timestamp = nowIso();
    const inserted = await this.collection.insertOne(
      {
        ...entry,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      { session: this.session }
    );
    return inserted.insertedId.toHexString();
  }
}

export class MongoInventoryTransactionManager implements InventoryTransactionManager {
  async run<T>(callback: (scope: InventoryTransactionScope) => Promise<T>): Promise<T> {
    const session = mongoClient.startSession();

    try {
      let result: T | undefined;

      await session.withTransaction(async () => {
        result = await callback({
          balances: new MongoInventoryBalanceRepository(session),
          ledger: new MongoStockLedgerRepository(session),
          receipts: new MongoGoodsReceiptRepository(session),
          productionOrders: new MongoProductionOrderRepository(session),
          sales: new MongoSalesRepository(session),
          waste: new MongoWasteRepository(session)
        });
      });

      return result as T;
    } finally {
      await session.endSession();
    }
  }
}

export class MongoInventoryReadRepository extends MongoInventoryBalanceRepository {
  constructor() {
    super(undefined);
  }
}

export class RedisDashboardCache implements DashboardCache {
  async get(branchId: string): Promise<DashboardSummary | null> {
    const cached = await redis.get(`cache:branch:${branchId}:dashboard`);
    return cached ? JSON.parse(cached) as DashboardSummary : null;
  }

  async set(summary: DashboardSummary): Promise<void> {
    await redis.set(`cache:branch:${summary.branchId}:dashboard`, JSON.stringify(summary), { EX: 60 });
  }

  async invalidateBranch(branchId: string): Promise<void> {
    await redis.del(`cache:branch:${branchId}:dashboard`);
    await redis.del(`cache:branch:${branchId}:inventory`);
  }
}
