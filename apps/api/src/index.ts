import { buildApp } from "./app.js";
import { logger } from "./logger.js";
import { env } from "./config/env.js";
import { connectMongo } from "./infrastructure/db/mongo.js";
import { connectRedis } from "./infrastructure/redis/client.js";
import { ensureAuthSeed } from "./modules/auth/store.js";

export async function start() {
  const app = buildApp();

  try {
    await connectMongo();
    await ensureAuthSeed();
  } catch (error) {
    app.log.error({ err: error }, "MongoDB connection failed");
    throw error;
  }

  try {
    await connectRedis();
  } catch (error) {
    app.log.error({ err: error }, "Redis connection failed");
    throw error;
  }

  await app.listen({ port: env.PORT, host: env.HOST });
  app.log.info({ port: env.PORT, host: env.HOST }, "API server listening");

  return app;
}

start().catch((error) => {
  logger.error({ err: error }, "API startup failed");
  process.exit(1);
});
