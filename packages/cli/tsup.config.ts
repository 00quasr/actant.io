import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  dts: true,
  clean: true,
  jsx: "automatic",
  jsxImportSource: "react",
  external: ["react", "react/jsx-runtime", "ink", "@inkjs/ui"],
});
