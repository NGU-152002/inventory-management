import type { FastifyInstance } from "fastify";
import { supplierSchema } from "@inventory-management/shared";
import { database } from "../../infrastructure/db/mongo.js";

function nowIso() {
  return new Date().toISOString();
}

export async function supplierRoutes(app: FastifyInstance) {
  const collection = database.collection("suppliers");

  app.get("/", { preHandler: [app.authenticate] }, async () => {
    return collection.find().sort({ name: 1 }).toArray();
  });

  app.post("/", { preHandler: [app.authenticate] }, async (request, reply) => {
    const input = supplierSchema.parse(request.body);
    const { _id: _ignoredId, createdAt: _ignoredCreatedAt, updatedAt: _ignoredUpdatedAt, ...payload } = input;
    const timestamp = nowIso();
    const supplier = {
      ...payload,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    const result = await collection.insertOne(supplier);
    return reply.code(201).send({ ...supplier, _id: result.insertedId.toHexString() });
  });
}
