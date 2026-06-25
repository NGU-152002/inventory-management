import { MongoClient } from "mongodb";
import { env } from "../../config/env.js";
import { logger } from "../../logger.js";

const mongoLogger = logger.child({ component: "mongo" });

export const mongoClient = new MongoClient(env.MONGODB_URI);
export const database = mongoClient.db(env.MONGODB_DB);

export async function connectMongo() {
  try {
    await mongoClient.connect();
    mongoLogger.info({ database: env.MONGODB_DB }, "MongoDB connected");
  } catch (error) {
    mongoLogger.error({ err: error }, "MongoDB client connection failed");
    throw error;
  }
}
