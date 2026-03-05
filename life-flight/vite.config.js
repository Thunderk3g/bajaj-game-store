import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// LMS API base URLs per build mode
const LMS_URLS = {
    production: 'https://sales.bajajlife.com/BalicLmsUtil',
    preprod: 'https://bajajuat2.bajajlife.com/BalicLmsUtil',
    uat: 'https://bjuat.bajajlife.com/BalicLmsUtil',
};

export default defineConfig(({ mode }) => ({
    base: './',
    plugins: [react()],
    define: {
        __LMS_BASE_URL__: JSON.stringify(LMS_URLS[mode] || LMS_URLS.uat),
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            output: {
                name: 'LifeFlight',
                exports: 'named',
                format: 'es',
            },
        },
    },
    server: {
        port: 5012,
    },
}));

