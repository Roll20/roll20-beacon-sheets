import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    vueJsx(),
    VueDevTools(),
  ],
  base:
    mode === "production"
      ? `https://storage.googleapis.com/beacon-community-sheets/example-sheet/`
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
      '@': fileURLToPath(new URL('./src', import.meta.url))
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
    cors: false
  }
}))
