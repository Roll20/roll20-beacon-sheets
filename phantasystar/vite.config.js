import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'
import process from 'node:process'
import { defineConfig } from 'vite'
import Handlebars from 'handlebars'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueDevTools from 'vite-plugin-vue-devtools'

const handlebarsPrecompile = () => ({
  name: 'ps-handlebars-precompile',
  transform(_code, id) {
    if (!id.endsWith('.hbs')) return null
    const source = readFileSync(id.split('?')[0], 'utf8')
    return { code: `export default ${Handlebars.precompile(source)};`, map: null }
  },
})

export default defineConfig(({ mode }) => ({
  plugins: [
    handlebarsPrecompile(),
    vue(),
    vueJsx(),
    mode !== 'production' && VueDevTools(),
  ].filter(Boolean),
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
          if (assetInfo.name === "style.css") return "sheet.css";
          return "assets/[name][extname]";
        },
        entryFileNames: "sheet.js",
        minifyInternalExports: false
      }
    }
  },
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
