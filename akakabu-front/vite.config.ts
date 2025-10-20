import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
// import { createRequire } from "module";
// import path from "path";

// const require = createRequire(import.meta.url);
// const postcss = require(path.resolve(__dirname, "./postcss.config.cjs"));

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  // css: {
  //   postcss,
  // },
});