import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import ruby from "vite-plugin-ruby";

// vite-plugin-ruby reads config/vite.json (source dir app/frontend, entrypoints
// in app/frontend/entrypoints, "~/" alias for app/frontend). Tests use
// vitest.config.ts, which does not need Ruby-side config.
export default defineConfig({
  plugins: [ruby(), react()],
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap 5.3 still uses @import and global Sass functions internally.
        quietDeps: true,
        silenceDeprecations: ["import", "global-builtin", "color-functions", "if-function"],
      },
    },
  },
});
