import type { FastifyInstance } from "fastify";
import type { InventoryModule } from "../inventory/module.js";

export async function dashboardRoutes(app: FastifyInstance, inventory: InventoryModule) {
  app.get("/:branchId", { preHandler: [app.authenticate] }, async (request) => {
    const params = request.params as { branchId: string };
    return inventory.getDashboardSummary.execute(params.branchId);
  });
}
