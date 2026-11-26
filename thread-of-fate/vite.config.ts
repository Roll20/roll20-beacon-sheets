import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";

/**
 * Resolve the production base path.
 *
 * Roll20's community-repo deploy workflow builds with shell env vars:
 *   VITE_SHEET_PATH       = https://cdn.roll20.net/<bucket-path>   (absolute URL)
 *   VITE_SHEET_SHORT_NAME = the shortname registered in approved.yaml
 * and the canonical community-sheet base is their straight concatenation
 * (`${VITE_SHEET_PATH}/${VITE_SHEET_SHORT_NAME}/`), exactly as in the
 * quickstart/advanced example sheets. Shell env vars therefore take priority
 * here; .env[.production] only fills gaps so a plain local `npm run build`
 * stays reproducible and never bakes in "undefined".
 */
function resolveBase(mode: string): string {
  if (mode !== "production") return "/";
  const fileEnv = loadEnv(mode, process.cwd(), "VITE_");
  const sheetPath = process.env.VITE_SHEET_PATH || fileEnv.VITE_SHEET_PATH || "";
  const short = process.env.VITE_SHEET_SHORT_NAME || fileEnv.VITE_SHEET_SHORT_NAME || "";
  if (sheetPath) {
    return `${sheetPath.replace(/\/+$/, "")}/${short ? `${short}/` : ""}`;
  }
  return short ? `/${short}/` : "/";
}

// The "app" mode builds a normal standalone SPA (index.html + assets) for the web
// deploy and the Electron desktop wrapper. Every other mode builds the single-file
// Roll20 Beacon sheet (sheet.js / sheet.css / host.css).
const beaconBuild = {
  target: 'esnext',
  emptyOutDir: true,
  minify: true,
  cssCodeSplit: false,
  // Roll20 Beacon loads the sheet as a single `sheet.js`, so we deliberately do
  // NOT code-split (multiple chunks would not resolve in the VTT). The bundle is
  // large mostly because of the full spell/discipline data plus the Crucible
  // registries; raise the warning threshold rather than fragment delivery.
  chunkSizeWarningLimit: 4000,
  rollupOptions: {
    input: { sheet: 'src/main.ts' },
    output: {
      dir: 'dist',
      compact: false,
      // Force EVERY dynamic import (Crucible, pdf-lib) into the one sheet.js -
      // the VTT loads a Beacon sheet as a single file and secondary chunks 404.
      inlineDynamicImports: true,
      assetFileNames: (assetInfo: { name?: string }) =>
        assetInfo.name === 'style.css' ? 'sheet.css' : 'assets/[name][extname]',
      entryFileNames: 'sheet.js',
      minifyInternalExports: false,
    },
  },
};
const appBuild = {
  target: 'esnext',
  emptyOutDir: true,
  outDir: 'dist-app',
  chunkSizeWarningLimit: 3000,
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [vue(), svgLoader()],
  // Relative base so the SPA loads from file:// inside Electron.
  base: mode === 'app' ? './' : resolveBase(mode),
  build: mode === 'app' ? appBuild : beaconBuild,
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
    watch: {
      // Keep the dev watcher off non-source trees. On Windows, watched
      // directories hold OS handles that make deletes/renames inside them
      // fail (EPERM/ENOTEMPTY) - which breaks release staging into Fork/.
      ignored: [
        "**/Design/**",
        "**/Fork/**",
        "**/release-work/**",
        "**/release/**",
        "**/release-tool/**",
        "**/dist/**",
        "**/dist-app/**"
      ]
    }
  }
}));
