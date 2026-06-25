import type { FastifyInstance } from "fastify";
import { saleSchema } from "@inventory-management/shared";
import type { InventoryModule } from "../inventory/module.js";
import { mapInventoryError } from "../inventory/http.js";

export async function salesRoutes(app: FastifyInstance, inventory: InventoryModule) {
  app.post("/", { preHandler: [app.authenticate] }, async (request, reply) => {
    const sale = saleSchema.parse(request.body);

    try {
      const result = await inventory.recordSale.execute(sale, request.userContext.id);
      return reply.code(201).send(result);
    } catch (error) {
      const mapped = mapInventoryError(error);
      return reply.code(mapped.statusCode).send(mapped.body);
    }
  });
}
