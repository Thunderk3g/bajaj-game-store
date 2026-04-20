import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const LMS_URLS: Record<string, string> = {
  production: 'https://sales.bajajlife.com/BalicLmsUtil',
  preprod: 'https://sales.bajajlife.com/BalicLmsUtil',
  uat: 'https://sales.bajajlife.com/BalicLmsUtil',
};

const LMS_UPDATE_URLS: Record<string, string> = {
  production: 'https://sales.bajajlife.com/BalicLmsUtil',
  preprod: 'https://sales.bajajlife.com/BalicLmsUtil',
  uat: 'https://sales.bajajlife.com/BalicLmsUtil',
};

export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react()],
  define: {
    __LMS_BASE_URL__: JSON.stringify(LMS_URLS[mode] || LMS_URLS.uat),
    __LMS_UPDATE_BASE_URL__: JSON.stringify(LMS_UPDATE_URLS[mode] || LMS_UPDATE_URLS.uat),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        name: 'RetireWiseSudoku',
        exports: 'named',
        format: 'es',
      },
    },
  },
  server: {
    port: 5016,
    host: '0.0.0.0',
  },
}));
