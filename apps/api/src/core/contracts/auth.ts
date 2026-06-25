import type { FastifyRequest } from "fastify";
import type { User } from "@inventory-management/shared";

export type AuthenticatedUser = User & {
  activeBranchId?: string;
};

export type AuthenticatedRequest = FastifyRequest & {
  userContext: AuthenticatedUser;
};
