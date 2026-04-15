import { defineConfig } from "tsdown";

export default defineConfig({
  banner: { js: "import './style.css';" },
  sourcemap: "inline",
  deps: {
    skipNodeModulesBundle: true,
  },
});
