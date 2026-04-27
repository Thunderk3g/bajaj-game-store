import { defineConfig } from 'vite';

const LMS_URLS = {
  uat: 'https://uatapiin.bajajallianzlife.com/BagicWhatsAppService/api/Whatsapp',
  preprod: 'https://preprodapiin.bajajallianzlife.com/BagicWhatsAppService/api/Whatsapp',
  production: 'https://apiin.bajajallianzlife.com/BagicWhatsAppService/api/Whatsapp',
};
const LMS_UPDATE_URLS = {
  uat: 'https://uatapiin.bajajallianzlife.com/LMSService/api/LMS',
  preprod: 'https://preprodapiin.bajajallianzlife.com/LMSService/api/LMS',
  production: 'https://apiin.bajajallianzlife.com/LMSService/api/LMS',
};

export default defineConfig(({ mode }) => ({
  base: './',
  server: { port: 5173, host: '0.0.0.0' },
  define: {
    __LMS_BASE_URL__: JSON.stringify(LMS_URLS[mode] || LMS_URLS.uat),
    __LMS_UPDATE_BASE_URL__: JSON.stringify(LMS_UPDATE_URLS[mode] || LMS_UPDATE_URLS.uat),
  },
  build: { outDir: 'dist', assetsDir: 'assets', emptyOutDir: true },
}));
