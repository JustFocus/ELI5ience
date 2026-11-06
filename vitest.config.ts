import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "~": path.resolve(import.meta.dirname, "app/frontend") },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["app/frontend/test/setup.ts"],
    include: ["app/frontend/**/*.test.{ts,tsx}"],
    css: false,
  },
});
