import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";
import { logger } from "../logger.js";

const configLogger = logger.child({ component: "config" });

const currentFile = fileURLToPath(import.meta.url);
const configDir = path.dirname(currentFile);
const apiDir = path.resolve(configDir, "..", "..");
const workspaceDir = path.resolve(apiDir, "..", "..");
const envCandidates = [
  path.join(apiDir, ".env"),
  path.join(workspaceDir, ".env")
];

const attemptedEnvFiles: string[] = [];
let loadedEnvPath: string | undefined;

for (const envPath of envCandidates) {
  attemptedEnvFiles.push(envPath);
  const result = dotenv.config({ path: envPath, override: false, quiet: true });
  if (!result.error) {
    loadedEnvPath = envPath;
    configLogger.info({ envPath }, "Loaded environment file");
    break;
  }
}

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default("0.0.0.0"),
  JWT_SECRET: z.string().min(8),
  ADMIN_EMAIL: z.string().default("owner@inventory.local"),
  ADMIN_PASSWORD: z.string().default("ChangeMe123!"),
  MONGODB_URI: z.string().min(1),
  MONGODB_DB: z.string().default("inventory_management"),
  REDIS_URL: z.string().min(1)
});

function exitForInvalidConfig(missingKeys: string[]): never {
  configLogger.error(
    {
      loadedEnvPath,
      checkedFiles: attemptedEnvFiles,
      missingKeys
    },
    "API configuration is invalid. Create apps/api/.env from apps/api/.env.example and set the required values."
  );

  process.exit(1);
}

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const missingKeys = parsedEnv.error.issues
    .map((issue) => issue.path[0])
    .filter((key): key is string => typeof key === "string");

  exitForInvalidConfig(missingKeys);
}

export const env = parsedEnv.data;
