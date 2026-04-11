import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// LMS API base URLs per build mode
const LMS_URLS = {
    production: "https://sales.bajajlife.com/BalicLmsUtil",
    preprod: "https://sales.bajajlife.com/BalicLmsUtil",
    uat: "https://sales.bajajlife.com/BalicLmsUtil",
};


// LMS Lead Update API base URLs per build mode
const LMS_UPDATE_URLS = {
  production: 'https://sales.bajajlife.com/BalicLmsUtil',
  preprod: 'https://sales.bajajlife.com/BalicLmsUtil',
  uat: 'https://sales.bajajlife.com/BalicLmsUtil',
}
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
            output: {
                entryFileNames: 'index.js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
                name: 'LifeSnakesLaddersGame',
                exports: 'named',
                format: 'es',
            },
        },
    },
    server: {
        port: 5175,
        host: true,
    },
}));
