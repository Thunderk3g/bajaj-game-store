import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// LMS API base URLs per build mode
const LMS_URLS = {
    production: 'https://sales.bajajlife.com/BalicLmsUtil',
    preprod: 'https://sales.bajajlife.com/BalicLmsUtil',
    uat: 'https://sales.bajajlife.com/BalicLmsUtil',
}


// LMS Lead Update API base URLs per build mode
const LMS_UPDATE_URLS = {
  production: 'https://sales.bajajlife.com/BalicLmsUtil',
  preprod: 'https://sales.bajajlife.com/BalicLmsUtil',
  uat: 'https://sales.bajajlife.com/BalicLmsUtil',
}
// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
    // use relative paths so assets are resolved relative to index.html
    base: './',
    plugins: [react()],
    define: {
        __LMS_BASE_URL__: JSON.stringify(LMS_URLS[mode] || LMS_URLS.uat),
    __LMS_UPDATE_BASE_URL__: JSON.stringify(LMS_UPDATE_URLS[mode] || LMS_UPDATE_URLS.uat),
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            output: {
                name: 'LifeGoalsGame',
                exports: 'named',
                format: 'es'
            }
        }
    },
    server: {
        port: 5002 // Development port
    }
}))
