process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";
process.env.JWT_SECRET ??= "test-secret-123";
process.env.ADMIN_EMAIL ??= "owner@inventory.local";
process.env.ADMIN_PASSWORD ??= "ChangeMe123!";
process.env.REDIS_URL ??= "redis://127.0.0.1:6379";
process.env.MONGODB_DB ??= "inventory_management_test";
