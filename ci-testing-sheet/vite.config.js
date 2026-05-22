import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/main.js',
      output: {
        dir: 'dist',
        entryFileNames: 'sheet.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'sheet.css'
          return 'assets/[name][extname]'
        },
      },
    },
  },
})
