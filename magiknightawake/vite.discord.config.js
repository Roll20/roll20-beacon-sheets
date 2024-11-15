import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'

const DISCORD_ACTIVITY_CLIENT_ID = process.env.DISCORD_ACTIVITY_CLIENT_ID || "1199270539278164008";
const SHORT_NAME = process.env.VITE_SHEET_SHORT_NAME || 'magiknightawake';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    VueDevTools(),
  ],
  base: 
    mode === "production"
      ? `https://${DISCORD_ACTIVITY_CLIENT_ID}.discordsays.com/.proxy/googleapis/storage/roll20-cdn/roll20-beacon-sheets/discord/${DISCORD_ACTIVITY_CLIENT_ID}/${SHORT_NAME}/`
      : "/",
  build: {
    target: 'esnext',
    emptyOutDir: true,
    minify: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        sheet: "src/main.js"
      },
      output: {
        dir: `dist/${SHORT_NAME}`,
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
  },
  define: {
    __DISCORD_ACTIVITY_CLIENT_ID__: JSON.stringify(DISCORD_ACTIVITY_CLIENT_ID)
  }
}))
