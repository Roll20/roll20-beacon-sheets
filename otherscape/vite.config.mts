import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const { VITE_SHEET_PATH, VITE_SHEET_SHORT_NAME } = process.env;
  if (mode === 'production' && Boolean(VITE_SHEET_PATH) !== Boolean(VITE_SHEET_SHORT_NAME)) {
    throw new Error('VITE_SHEET_PATH and VITE_SHEET_SHORT_NAME must be set together.');
  }

  return {
    plugins: [vue(), svgLoader()],
    base:
      mode === 'production' && VITE_SHEET_PATH && VITE_SHEET_SHORT_NAME
        ? `${VITE_SHEET_PATH}/${VITE_SHEET_SHORT_NAME}/`
        : '/',
    build: {
      target: 'esnext',
      emptyOutDir: true,
      minify: true,
      cssCodeSplit: false,
      rolldownOptions: {
        input: {
          sheet: 'src/main.ts',
        },
        output: {
          dir: 'dist',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'style.css') return 'sheet.css';
            return 'assets/[name][extname]';
          },
          entryFileNames: 'sheet.js',
          minifyInternalExports: false,
        },
      },
    },
    assetsInclude: ['**/*.hbs'],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      rolldownOptions: {
        transform: {
          define: {
            global: 'globalThis',
          },
        },
      },
    },
    server: {
      cors: false,
    },
  };
});
