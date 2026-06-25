import type { FastifyInstance } from "fastify";
import { wasteSchema } from "@inventory-management/shared";
import type { InventoryModule } from "../inventory/module.js";
import { mapInventoryError } from "../inventory/http.js";

export async function wasteRoutes(app: FastifyInstance, inventory: InventoryModule) {
  app.post("/", { preHandler: [app.authenticate] }, async (request, reply) => {
    const waste = wasteSchema.parse(request.body);

    try {
      const result = await inventory.recordWaste.execute(waste, request.userContext.id);
      return reply.code(201).send(result);
    } catch (error) {
      const mapped = mapInventoryError(error);
      return reply.code(mapped.statusCode).send(mapped.body);
    }
  });
}
