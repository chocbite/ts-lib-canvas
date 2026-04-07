import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@chocbite/ts-lib-list": path.resolve(__dirname, "./src/index.ts"),
    },
  },
});
