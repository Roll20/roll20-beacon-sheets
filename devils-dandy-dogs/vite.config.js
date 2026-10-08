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
    // ddd-x61. The HMR client calls location.reload() on its own frame when the websocket
    // closes uncleanly (vite/dist/client/client.mjs:552-563) — which is exactly what a
    // frozen background tab produces. Roll20 will NOT re-issue `init` to a frame that
    // reloaded itself, so beacon-sdk's initRelay promise never resolves, main.js never
    // reaches app.mount('#app'), and the sheet is a silent blank field with no errors.
    // The SDK's own fallbackReady retry (index.js:55) re-posts `ready` every 2s forever
    // and the host ignores all of it, so an orphaned frame can never self-recover.
    // `staging` is the sandbox mode that runs INSIDE Roll20, so it must never self-reload;
    // `npm run dev` (development, port 5173) mounts standalone and keeps full HMR.
    //
    // `ws` is the load-bearing one, NOT `hmr`. Vite gates the websocket server on
    // `server.ws === false` (dist/node/chunks/dep-BK3b2jBa.js:59356); `hmr: false` only
    // suppresses update *sending*, leaving the socket open and the reload path live —
    // verified by a 101 Switching Protocols upgrade against 7620 with hmr already false.
    // With ws off the client socket never opens, so client.mjs takes the
    // onCloseWithoutOpen branch (:554) and never reaches location.reload() (:562).
    hmr: mode !== 'staging',
    ws: mode !== 'staging'
  }
}))
