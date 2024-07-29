import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";
import svgLoader from "vite-svg-loader";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue(), svgLoader()],
  test: {
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "e2e/*"],
    root: fileURLToPath(new URL("./", import.meta.url))
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    dedupe: ["vue"],
  },
});
