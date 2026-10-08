/* eslint-env node */
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    vueJsx(),
    VueDevTools(),
    tailwindcss(),
  ],
  base:
    mode === "production"
    ? `${process.env.VITE_SHEET_PATH}/${process.env.VITE_SHEET_SHORT_NAME}/`
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
        dir: "dist",
        compact: false,
        assetFileNames: (assetInfo) => {
          const names = assetInfo.names ?? []
          if (names.includes('style.css')) return 'sheet.css'
          return 'assets/[name][extname]'
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
    cors: false,
    // ddd-x61, ported from devils-dandy-dogs (this project was scaffolded from the Dog
    // sheet before the fix landed there). The HMR client calls location.reload() on its
    // own frame when the websocket closes uncleanly — exactly what a frozen background
    // tab produces. Roll20 will NOT re-issue `init` to a frame that reloaded itself, so
    // beacon-sdk's initRelay never resolves and the sandbox sheet is a silent blank
    // field. `staging` is the sandbox mode that runs INSIDE Roll20, so it must never
    // self-reload; `npm run dev` (development) mounts standalone and keeps full HMR.
    //
    // `ws` is the load-bearing one, NOT `hmr`: vite gates the websocket server on
    // `server.ws === false`; `hmr: false` only suppresses update *sending*, leaving the
    // socket open and the reload path live. See sandbox-relay-policy.test.js.
    hmr: mode !== 'staging',
    ws: mode !== 'staging'
  }
}))
