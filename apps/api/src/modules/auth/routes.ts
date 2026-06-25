import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { authSessionSchema, userSchema } from "@inventory-management/shared";
import { z } from "zod";
import { createSessionId, findBranchesByIds, findUserByEmail, findUserById, revokeSession, toPublicUser } from "./store.js";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8)
});

export async function authRoutes(app: FastifyInstance) {
  app.post("/login", async (request, reply) => {
    const input = loginSchema.parse(request.body);
    const user = await findUserByEmail(input.email);

    if (!user) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValidPassword) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }

    const safeUser = userSchema.parse(toPublicUser(user));
    const branches = await findBranchesByIds(safeUser.branchIds);
    const activeBranchId = branches[0]?._id ?? safeUser.branchIds[0] ?? "";
    const sessionId = createSessionId();

    const token = await reply.jwtSign({
      ...safeUser,
      activeBranchId,
      sessionId
    });

    return authSessionSchema.parse({
      token,
      user: safeUser,
      branches,
      activeBranchId
    });
  });

  app.post("/logout", { preHandler: [app.authenticate] }, async (request) => {
    if (request.userContext.sessionId) {
      await revokeSession(request.userContext.sessionId, request.userContext._id);
    }

    return { success: true };
  });

  app.get("/me", { preHandler: [app.authenticate] }, async (request, reply) => {
    const user = await findUserById(request.userContext._id);
    if (!user) {
      return reply.code(404).send({ message: "User not found" });
    }

    const safeUser = userSchema.parse(toPublicUser(user));
    const branches = await findBranchesByIds(safeUser.branchIds);
    const activeBranchId = request.userContext.activeBranchId ?? branches[0]?._id ?? safeUser.branchIds[0] ?? "";

    return authSessionSchema.parse({
      token: "",
      user: safeUser,
      branches,
      activeBranchId
    });
  });
}
