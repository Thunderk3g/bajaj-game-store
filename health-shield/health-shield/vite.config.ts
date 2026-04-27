import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const LMS_URLS: Record<string, string> = {
  uat: 'https://uatapiin.bajajallianzlife.com/BagicWhatsAppService/api/Whatsapp',
  preprod: 'https://preprodapiin.bajajallianzlife.com/BagicWhatsAppService/api/Whatsapp',
  production: 'https://apiin.bajajallianzlife.com/BagicWhatsAppService/api/Whatsapp',
};

const LMS_UPDATE_URLS: Record<string, string> = {
  uat: 'https://uatapiin.bajajallianzlife.com/LMSService/api/LMS',
  preprod: 'https://preprodapiin.bajajallianzlife.com/LMSService/api/LMS',
  production: 'https://apiin.bajajallianzlife.com/LMSService/api/LMS',
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',
  server: {
    port: 5020,
    host: '0.0.0.0',
  },
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
        name: 'HealthShield',
        exports: 'named',
        format: 'es',
      },
    },
  },
}));
