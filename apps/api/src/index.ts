import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "./config/env.js";
import { logger } from "./logger.js";
import { connectMongo } from "./infrastructure/db/mongo.js";
import { connectRedis } from "./infrastructure/redis/client.js";
import { authRoutes } from "./modules/auth/routes.js";
import { ensureAuthSeed } from "./modules/auth/store.js";
import { itemRoutes } from "./modules/items/routes.js";
import { supplierRoutes } from "./modules/suppliers/routes.js";
import { purchaseRoutes } from "./modules/purchases/routes.js";
import { productionRoutes } from "./modules/production/routes.js";
import { salesRoutes } from "./modules/sales/routes.js";
import { wasteRoutes } from "./modules/waste/routes.js";
import { inventoryRoutes } from "./modules/inventory/routes.js";
import { dashboardRoutes } from "./modules/dashboard/routes.js";
import { createInventoryModule } from "./modules/inventory/module.js";
import type { User } from "@inventory-management/shared";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    userContext: User & { activeBranchId?: string };
  }
}

const app = Fastify({
  loggerInstance: logger
});
const inventoryModule = createInventoryModule();

app.register(cors, { origin: true });
app.register(jwt, { secret: env.JWT_SECRET });

app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const payload = await request.jwtVerify<User & { activeBranchId?: string }>();
    request.userContext = payload;
  } catch {
    reply.code(401).send({ message: "Unauthorized" });
  }
});

app.get("/health", async () => ({ ok: true }));
app.register(authRoutes, { prefix: "/auth" });
app.register(itemRoutes, { prefix: "/items" });
app.register(supplierRoutes, { prefix: "/suppliers" });
app.register(async (instance) => purchaseRoutes(instance, inventoryModule), { prefix: "/purchases" });
app.register(async (instance) => productionRoutes(instance, inventoryModule), { prefix: "/production" });
app.register(async (instance) => salesRoutes(instance, inventoryModule), { prefix: "/sales" });
app.register(async (instance) => wasteRoutes(instance, inventoryModule), { prefix: "/waste" });
app.register(async (instance) => inventoryRoutes(instance, inventoryModule), { prefix: "/inventory" });
app.register(async (instance) => dashboardRoutes(instance, inventoryModule), { prefix: "/dashboard" });

async function start() {
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
}

start().catch((error) => {
  app.log.error({ err: error }, "API startup failed");
  process.exit(1);
});
