import { fileURLToPath, URL } from 'node:url'
import { existsSync, readFileSync } from 'node:fs'
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

const devCompendium = () => ({
  name: 'ps-dev-compendium',
  apply: 'serve',
  configureServer(server) {
    const importFile = fileURLToPath(new URL('../release/compendium/import.json', import.meta.url))
    const rulesFile = fileURLToPath(new URL('../release/compendium/import-core-rules.json', import.meta.url))
    const cards = fileURLToPath(new URL('../graphics/Character Builder/', import.meta.url))
    const cardFile = (name) => `Card_${String(name).replace(/[^A-Za-z0-9]+/g, '_')}.webp`

    server.middlewares.use('/@dev-compendium', (_req, res) => {
      if (!existsSync(importFile)) {
        res.statusCode = 404
        res.end()
        return
      }
      const book = JSON.parse(readFileSync(importFile, 'utf8'))
      if (existsSync(rulesFile)) {
        for (const [category, pages] of Object.entries(JSON.parse(readFileSync(rulesFile, 'utf8')).pagesByCategory ?? {})) {
          book.pagesByCategory[category] = { ...pages, ...(book.pagesByCategory[category] ?? {}) }
        }
      }
      for (const category of ['Species', 'Professions']) {
        for (const [name, page] of Object.entries(book.pagesByCategory?.[category] ?? {})) {
          if (!page['data-builderImage'] && existsSync(cards + cardFile(name))) page['data-builderImage'] = `/@dev-cards/${cardFile(name)}`
        }
      }
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(book))
    })

    server.middlewares.use('/@dev-cards', (req, res) => {
      const name = String(req.url ?? '').replace(/^\/+/, '')
      if (!/^[\w-]+\.webp$/.test(name) || !existsSync(cards + name)) {
        res.statusCode = 404
        res.end()
        return
      }
      res.setHeader('Content-Type', 'image/webp')
      res.end(readFileSync(cards + name))
    })
  },
})

export default defineConfig(({ mode }) => ({
  plugins: [
    handlebarsPrecompile(),
    devCompendium(),
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
