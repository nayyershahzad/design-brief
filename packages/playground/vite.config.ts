import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Alias the core package to its source so the playground always reflects the
// current contract without a separate build step. core/ is pure, browser-safe TS.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@design-brief/core": fileURLToPath(new URL("../core/src/index.ts", import.meta.url)),
    },
  },
  server: { port: 4321, strictPort: true },
  preview: { port: 4321, strictPort: true },
});
