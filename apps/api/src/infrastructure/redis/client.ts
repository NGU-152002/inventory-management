import { createClient } from "redis";
import { env } from "../../config/env.js";
import { logger } from "../../logger.js";

const redisLogger = logger.child({ component: "redis" });

export const redis = createClient({ url: env.REDIS_URL });

export async function connectRedis() {
  redis.on("error", (error) => {
    redisLogger.error({ err: error }, "Redis client error");
  });

  try {
    await redis.connect();
    redisLogger.info("Redis connected");
  } catch (error) {
    redisLogger.error({ err: error }, "Redis client connection failed");
    throw error;
  }
}
