import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    root: path.resolve(__dirname),
    include: ["src/**/__tests__/**/*.test.ts"],
  },
});
