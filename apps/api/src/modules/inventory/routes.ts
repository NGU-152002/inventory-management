import type { FastifyInstance } from "fastify";
import type { InventoryModule } from "./module.js";

export async function inventoryRoutes(app: FastifyInstance, inventory: InventoryModule) {
  app.get("/:branchId/balances", { preHandler: [app.authenticate] }, async (request) => {
    const params = request.params as { branchId: string };
    return inventory.getInventoryBalances.execute(params.branchId);
  });
}
