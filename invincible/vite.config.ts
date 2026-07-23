import { fileURLToPath, URL } from "node:url";
import { execSync } from "node:child_process";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";

import tailwindcss from "@tailwindcss/vite";

function generateEffectPathsPlugin() {
  return {
    name: "generate-effect-paths",
    buildStart() {
      // Avoid infinite recursion when the paths generator itself or vitest is run
      const isGenerating = process.argv.some(
        (arg) => arg.includes("vite-node") || arg.includes("generate-effect-paths") || arg.includes("vitest")
      );
      if (isGenerating) {
        return;
      }

      try {
        execSync("npm run generate-effect-paths", { stdio: "inherit" });
      } catch (err) {
        console.error("[generate-effect-paths] Failed to run generator:", err);
      }
    },
    handleHotUpdate({ file }) {
      if (file.includes("/src/schemas/")) {
        try {
          execSync("npm run generate-effect-paths", { stdio: "inherit" });
        } catch (err) {
          console.error("[generate-effect-paths] Failed to run generator on update:", err);
        }
      }
    }
  };
}

function generateSvgSpritesPlugin() {
  return {
    name: "generate-svg-sprites",
    buildStart() {
      const isGenerating = process.argv.some(
        (arg) => arg.includes("vite-node") || arg.includes("generate-svg-sprites") || arg.includes("vitest")
      );
      if (isGenerating) {
        return;
      }

      try {
        execSync("npm run generate-svg-sprites", { stdio: "inherit" });
      } catch (err) {
        console.error("[generate-svg-sprites] Failed to run generator:", err);
      }
    },
    configureServer(server) {
      server.watcher.add(fileURLToPath(new URL("./src/sprites", import.meta.url)));
      server.watcher.on("all", (event, filePath) => {
        const normalized = filePath.replace(/\\/g, "/");
        if (normalized.endsWith(".svg") && normalized.includes("/src/sprites/")) {
          try {
            execSync("npm run generate-svg-sprites", { stdio: "inherit" });
          } catch (err) {
            console.error("[generate-svg-sprites] Failed to run generator on watcher event:", err);
          }
        }
      });
    },
    handleHotUpdate({ file }) {
      const normalized = file.replace(/\\/g, "/");
      if (normalized.endsWith(".svg") && normalized.includes("/src/sprites/")) {
        try {
          execSync("npm run generate-svg-sprites", { stdio: "inherit" });
        } catch (err) {
          console.error("[generate-svg-sprites] Failed to run generator on HMR update:", err);
        }
      }
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [generateEffectPathsPlugin(), generateSvgSpritesPlugin(), tailwindcss(), vue(), svgLoader()],
  base:
    mode === "production"
      ? "https://raw.githubusercontent.com/Roll20/roll20-beacon-sheets/refs/heads/main/invincible/src/"
      : "/",
  build: {
    target: 'esnext',
    emptyOutDir: true,
    minify: true,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      input: {
        sheet: "src/main.ts"
      },
      output: {
        dir: "dist",
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
  define: {
    global: "globalThis"
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  server: {
    cors: false
  }
}));
