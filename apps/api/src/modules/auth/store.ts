import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { ObjectId } from "mongodb";
import type { Branch, User } from "@inventory-management/shared";
import { database } from "../../infrastructure/db/mongo.js";
import { env } from "../../config/env.js";
import { logger } from "../../logger.js";

const authLogger = logger.child({ component: "auth" });

export type StoredBranch = Omit<Branch, "_id"> & {
  _id: ObjectId;
};

export type StoredUser = Omit<User, "_id" | "branchIds"> & {
  _id: ObjectId;
  branchIds: ObjectId[];
  passwordHash: string;
};

type RevokedSession = {
  sessionId: string;
  userId: string;
  revokedAt: string;
  createdAt: string;
  updatedAt: string;
};

const branches = database.collection<StoredBranch>("branches");
const users = database.collection<StoredUser>("users");
const revokedSessions = database.collection<RevokedSession>("revoked_sessions");

const defaultBranch = {
  name: "Main Branch",
  code: "MAIN"
} as const;

function nowIso() {
  return new Date().toISOString();
}

export function toPublicBranch(branch: StoredBranch): Branch {
  return {
    _id: branch._id.toHexString(),
    name: branch.name,
    code: branch.code,
    createdAt: branch.createdAt,
    updatedAt: branch.updatedAt
  };
}

export function toPublicUser(user: StoredUser): User {
  return {
    _id: user._id.toHexString(),
    email: user.email,
    name: user.name,
    role: user.role,
    branchIds: user.branchIds.map((branchId) => branchId.toHexString()),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export function createSessionId() {
  return randomUUID();
}

export async function ensureAuthSeed() {
  const timestamp = nowIso();

  await branches.updateOne(
    { code: defaultBranch.code },
    {
      $set: {
        name: defaultBranch.name,
        updatedAt: timestamp
      },
      $setOnInsert: {
        _id: new ObjectId(),
        code: defaultBranch.code,
        createdAt: timestamp
      }
    },
    { upsert: true }
  );

  const branch = await branches.findOne({ code: defaultBranch.code });
  if (!branch) {
    throw new Error("Default branch was not created");
  }

  const existing = await users.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  const owner: StoredUser = {
    _id: new ObjectId(),
    email: env.ADMIN_EMAIL.toLowerCase(),
    name: "System Owner",
    role: "owner",
    branchIds: [branch._id],
    passwordHash,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  await users.insertOne(owner);
  authLogger.info({ email: owner.email, branchId: branch._id.toHexString() }, "Seeded default owner user");
}

export async function findUserByEmail(email: string) {
  return users.findOne({ email: email.toLowerCase() });
}

export async function findBranchesByIds(branchIds: string[]) {
  const objectIds = branchIds.map((branchId) => new ObjectId(branchId));
  const records = await branches.find({ _id: { $in: objectIds } }).sort({ name: 1 }).toArray();
  return records.map(toPublicBranch);
}

export async function findUserById(id: string) {
  return users.findOne({ _id: new ObjectId(id) });
}

export async function revokeSession(sessionId: string, userId: string) {
  const timestamp = nowIso();

  await revokedSessions.updateOne(
    { sessionId },
    {
      $set: {
        userId,
        revokedAt: timestamp,
        updatedAt: timestamp
      },
      $setOnInsert: {
        sessionId,
        createdAt: timestamp
      }
    },
    { upsert: true }
  );
  authLogger.info({ sessionId, userId }, "Revoked auth session");
}

export async function isSessionRevoked(sessionId: string) {
  const revoked = await revokedSessions.findOne({ sessionId });
  return Boolean(revoked);
}
