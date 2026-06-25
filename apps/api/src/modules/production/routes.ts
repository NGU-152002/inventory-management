import type { FastifyInstance } from "fastify";
import { productionOrderSchema } from "@inventory-management/shared";
import type { InventoryModule } from "../inventory/module.js";
import { mapInventoryError } from "../inventory/http.js";

export async function productionRoutes(app: FastifyInstance, inventory: InventoryModule) {
  app.post("/", { preHandler: [app.authenticate] }, async (request, reply) => {
    const order = productionOrderSchema.parse(request.body);

    try {
      const result = await inventory.completeProductionOrder.execute(order, request.userContext._id);
      return reply.code(201).send(result);
    } catch (error) {
      const mapped = mapInventoryError(error);
      return reply.code(mapped.statusCode).send(mapped.body);
    }
  });
}
