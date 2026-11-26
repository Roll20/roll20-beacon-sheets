import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader';

function diceRollerBrowserCrypto() {
  return {
    name: 'dice-roller-browser-crypto',
    enforce: 'pre' as const,
    resolveId(source: string, importer: string | undefined) {
      if (
        source === 'crypto' &&
        importer?.replace(/\\/g, '/').includes('/@dice-roller/rpg-dice-roller/lib/esm/bundle.js')
      ) {
        return fileURLToPath(new URL('./src/utility/browserRandomBytes.ts', import.meta.url));
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const sheetPath = process.env.VITE_SHEET_PATH;
  const sheetName = process.env.VITE_SHEET_SHORT_NAME;
  if (mode === 'production' && Boolean(sheetPath) !== Boolean(sheetName)) {
    throw new Error('VITE_SHEET_PATH and VITE_SHEET_SHORT_NAME must be set together');
  }
  if (mode === 'production' && sheetPath && !/^(?:\/|https?:\/\/)/i.test(sheetPath)) {
    throw new Error('VITE_SHEET_PATH must be an absolute path or HTTP(S) URL');
  }

  return {
    plugins: [vue(), svgLoader(), diceRollerBrowserCrypto()],
    base:
      mode === 'production' && sheetPath && sheetName
        ? `${sheetPath.replace(/\/+$/, '')}/${sheetName.replace(/^\/+|\/+$/g, '')}/`
        : '/',
    build: {
      target: 'esnext',
      emptyOutDir: true,
      minify: true,
      cssCodeSplit: false,
      chunkSizeWarningLimit: 3000,
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
        plugins: [diceRollerBrowserCrypto()],
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
