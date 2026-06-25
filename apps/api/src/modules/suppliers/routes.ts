import type { FastifyInstance } from "fastify";
import { supplierSchema } from "@inventory-management/shared";
import { database } from "../../infrastructure/db/mongo.js";

export async function supplierRoutes(app: FastifyInstance) {
  const collection = database.collection("suppliers");

  app.get("/", { preHandler: [app.authenticate] }, async () => {
    return collection.find().sort({ name: 1 }).toArray();
  });

  app.post("/", { preHandler: [app.authenticate] }, async (request, reply) => {
    const supplier = supplierSchema.parse(request.body);
    const result = await collection.insertOne(supplier);
    return reply.code(201).send({ ...supplier, id: result.insertedId.toHexString() });
  });
}

