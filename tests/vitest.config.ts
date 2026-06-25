import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@inventory-management/shared": path.resolve(__dirname, "../packages/shared/src/index.ts")
    }
  },
  test: {
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    setupFiles: ["tests/setup/env.ts"],
    environment: "node",
    globals: true,
    isolate: true,
    testTimeout: 30000,
    hookTimeout: 30000
  }
});
