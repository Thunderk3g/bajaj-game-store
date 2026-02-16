import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    // use relative paths so assets are resolved relative to index.html
    // this avoids hard-coding a deployment subpath (e.g. /gamification/)
    base: './',
    plugins: [react()],
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
})
