import {
  CompleteProductionOrderUseCase,
  GetDashboardSummaryUseCase,
  GetInventoryBalancesUseCase,
  ReceiveGoodsUseCase,
  RecordSaleUseCase,
  RecordWasteUseCase
} from "../../core/application/inventory/use-cases.js";
import { MongoInventoryReadRepository, MongoInventoryTransactionManager, RedisDashboardCache } from "../../infrastructure/repositories/inventory/mongo-repositories.js";

export function createInventoryModule() {
  const tx = new MongoInventoryTransactionManager();
  const balances = new MongoInventoryReadRepository();
  const cache = new RedisDashboardCache();

  return {
    receiveGoods: new ReceiveGoodsUseCase(tx, cache),
    completeProductionOrder: new CompleteProductionOrderUseCase(tx, cache),
    recordSale: new RecordSaleUseCase(tx, cache),
    recordWaste: new RecordWasteUseCase(tx, cache),
    getInventoryBalances: new GetInventoryBalancesUseCase(balances),
    getDashboardSummary: new GetDashboardSummaryUseCase(balances, cache)
  };
}

export type InventoryModule = ReturnType<typeof createInventoryModule>;
