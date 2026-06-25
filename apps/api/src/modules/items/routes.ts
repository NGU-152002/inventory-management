import type { FastifyInstance } from "fastify";
import { itemSchema } from "@inventory-management/shared";
import { database } from "../../infrastructure/db/mongo.js";

export async function itemRoutes(app: FastifyInstance) {
  const collection = database.collection("items");

  app.get("/", { preHandler: [app.authenticate] }, async () => {
    return collection.find().sort({ name: 1 }).toArray();
  });

  app.post("/", { preHandler: [app.authenticate] }, async (request, reply) => {
    const item = itemSchema.parse(request.body);
    const result = await collection.insertOne(item);
    return reply.code(201).send({ ...item, id: result.insertedId.toHexString() });
  });
}

