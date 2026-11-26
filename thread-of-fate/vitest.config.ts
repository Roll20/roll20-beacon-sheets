import { fileURLToPath, URL } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";

export default defineConfig({
  plugins: [vue(), svgLoader()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  test: {
    environment: "jsdom",
    // Only this sheet's own tests: never sweep vendored material, release
    // tooling, or a community-repo fork clone living inside the project.
    exclude: [
      ...configDefaults.exclude,
      "e2e/*",
      "Design/**",
      "Fork/**",
      "release-tool/**",
      "release-work/**"
    ],
    root: fileURLToPath(new URL("./", import.meta.url))
  }
});
