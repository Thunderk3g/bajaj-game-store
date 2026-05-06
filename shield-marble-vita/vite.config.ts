import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// LMS API base URLs per build mode
const LMS_URLS = {
  production: 'https://sales.bajajlife.com/BalicLmsUtil',
  preprod: 'https://sales.bajajlife.com/BalicLmsUtil',
  uat: 'https://sales.bajajlife.com/BalicLmsUtil',
};

const LMS_UPDATE_URLS = {
  production: 'https://sales.bajajlife.com/BalicLmsUtil',
  preprod: 'https://sales.bajajlife.com/BalicLmsUtil',
  uat: 'https://sales.bajajlife.com/BalicLmsUtil',
};

export default defineConfig(({ mode }) => ({
  // Use relative paths so assets resolve correctly when served from angular-shell/assets/games/
  base: './',
  plugins: [react()],
  define: {
    __LMS_BASE_URL__: JSON.stringify(LMS_URLS[mode as keyof typeof LMS_URLS] || LMS_URLS.uat),
    __LMS_UPDATE_BASE_URL__: JSON.stringify(LMS_UPDATE_URLS[mode as keyof typeof LMS_UPDATE_URLS] || LMS_UPDATE_URLS.uat),
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: { name: 'ShieldMarbleVita', exports: 'named', format: 'es' },
    },
  },
  server: { port: 5020, host: '0.0.0.0' },
}));
