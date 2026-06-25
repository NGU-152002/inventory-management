import type { FastifyInstance } from "fastify";
import { purchaseReceiptSchema } from "@inventory-management/shared";
import type { InventoryModule } from "../inventory/module.js";
import { mapInventoryError } from "../inventory/http.js";

export async function purchaseRoutes(app: FastifyInstance, inventory: InventoryModule) {
  app.post("/receipts", { preHandler: [app.authenticate] }, async (request, reply) => {
    const receipt = purchaseReceiptSchema.parse(request.body);

    try {
      const result = await inventory.receiveGoods.execute(receipt, request.userContext.id);
      return reply.code(201).send(result);
    } catch (error) {
      const mapped = mapInventoryError(error);
      return reply.code(mapped.statusCode).send(mapped.body);
    }
  });
}
