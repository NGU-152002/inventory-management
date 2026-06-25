import type { FastifyInstance } from "fastify";
import { itemSchema } from "@inventory-management/shared";
import { database } from "../../infrastructure/db/mongo.js";

function nowIso() {
  return new Date().toISOString();
}

export async function itemRoutes(app: FastifyInstance) {
  const collection = database.collection("items");

  app.get("/", { preHandler: [app.authenticate] }, async () => {
    return collection.find().sort({ name: 1 }).toArray();
  });

  app.post("/", { preHandler: [app.authenticate] }, async (request, reply) => {
    const input = itemSchema.parse(request.body);
    const { _id: _ignoredId, createdAt: _ignoredCreatedAt, updatedAt: _ignoredUpdatedAt, ...payload } = input;
    const timestamp = nowIso();
    const item = {
      ...payload,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    const result = await collection.insertOne(item);
    return reply.code(201).send({ ...item, _id: result.insertedId.toHexString() });
  });
}
