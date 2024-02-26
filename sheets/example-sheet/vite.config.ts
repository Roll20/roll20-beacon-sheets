import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [vue(), svgLoader()],
  base:
    mode === "production"
      ? `https://storage.googleapis.com/roll20-cdn/${process.env.VITE_CDN_SHEETS_FOLDER}/dungeon-world-csc/`
      : "/",
  build: {
    emptyOutDir: true,
    minify: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        sheet: "src/main.ts"
      },
      output: {
        dir: "dist",
        compact: false,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") return "sheet.css";
          return "assets/[name][extname]";
        },
        entryFileNames: "sheet.js",
        minifyInternalExports: false
      }
    }
  },
  assetsInclude: ["**/*.hbs"],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis"
      }
    }
  },
  server: {
    cors: false,
    proxy: {
      "/api": {
        target: "https://compendium.csc.roll20teams.net/graphql",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace("/api", "")
      }
    }
  }
}));
