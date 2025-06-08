// <reference types="vitest" />

import { defineConfig } from "vitest/config";
import { defineConfig as defineViteConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import * as path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 3001,
    strictPort: true,
  },
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./setupTests.ts"],
    // ルートの記載
    coverage: {
      include: [
        "app/components/**",
        "app/hooks/**",
        "app/routes/**",
        "app/utils/**",
      ],
    },
  },
});
