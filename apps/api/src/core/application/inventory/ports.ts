import type {
  DashboardSummary,
  InventoryBalance,
  ProductionOrderInput,
  PurchaseReceiptInput,
  SaleInput,
  StockLedgerEntry,
  WasteInput
} from "@inventory-management/shared";
import type { StockBalanceKey } from "../../domain/inventory/index.js";

export interface InventoryBalanceRepository {
  findByKey(key: StockBalanceKey): Promise<InventoryBalance | null>;
  upsert(balance: InventoryBalance): Promise<void>;
  listByBranch(branchId: string): Promise<InventoryBalance[]>;
}

export interface StockLedgerRepository {
  insert(entry: StockLedgerEntry): Promise<void>;
}

export interface GoodsReceiptRepository {
  create(receipt: PurchaseReceiptInput): Promise<string>;
}

export interface ProductionOrderRepository {
  create(order: ProductionOrderInput & { status: string }): Promise<string>;
}

export interface SalesRepository {
  create(sale: SaleInput): Promise<string>;
}

export interface WasteRepository {
  create(entry: WasteInput): Promise<string>;
}

export interface InventoryTransactionScope {
  balances: InventoryBalanceRepository;
  ledger: StockLedgerRepository;
  receipts: GoodsReceiptRepository;
  productionOrders: ProductionOrderRepository;
  sales: SalesRepository;
  waste: WasteRepository;
}

export interface InventoryTransactionManager {
  run<T>(callback: (scope: InventoryTransactionScope) => Promise<T>): Promise<T>;
}

export interface DashboardCache {
  get(branchId: string): Promise<DashboardSummary | null>;
  set(summary: DashboardSummary): Promise<void>;
  invalidateBranch(branchId: string): Promise<void>;
}
