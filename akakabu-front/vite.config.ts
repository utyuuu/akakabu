import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
});