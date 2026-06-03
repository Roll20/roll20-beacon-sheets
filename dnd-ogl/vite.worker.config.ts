import { fileURLToPath, URL } from "node:url";
 
import { defineConfig } from "vite";
 
export default defineConfig(({ mode }) => ({
  base:
    mode === "production"
      ? `${process.env.VITE_SHEET_PATH}/${process.env.VITE_SHEET_SHORT_NAME}/`
      : "/",
  build: {
    target: "esnext",
    emptyOutDir: false,
    minify: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        worker: "src/worker.ts",
      },
      output: {
        dir: "dist",
        entryFileNames: "worker.js",
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}));