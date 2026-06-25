import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import type { Branch, User } from "@inventory-management/shared";
import { database } from "../../infrastructure/db/mongo.js";
import { env } from "../../config/env.js";
import { logger } from "../../logger.js";

const authLogger = logger.child({ component: "auth" });

export type StoredUser = User & {
  passwordHash: string;
};

const branches = database.collection<Branch>("branches");
const users = database.collection<StoredUser>("users");

const defaultBranch: Branch = {
  id: "main-branch",
  name: "Main Branch",
  code: "MAIN"
};

export async function ensureAuthSeed() {
  await branches.updateOne(
    { id: defaultBranch.id },
    { $setOnInsert: defaultBranch },
    { upsert: true }
  );

  const existing = await users.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  const owner: StoredUser = {
    id: new ObjectId().toHexString(),
    email: env.ADMIN_EMAIL.toLowerCase(),
    name: "System Owner",
    role: "owner",
    branchIds: [defaultBranch.id],
    passwordHash
  };

  await users.insertOne(owner);
  authLogger.info({ email: owner.email, branchId: defaultBranch.id }, "Seeded default owner user");
}

export async function findUserByEmail(email: string) {
  return users.findOne({ email: email.toLowerCase() });
}

export async function findBranchesByIds(branchIds: string[]) {
  return branches.find({ id: { $in: branchIds } }).sort({ name: 1 }).toArray();
}

export async function findUserById(id: string) {
  return users.findOne({ id });
}
