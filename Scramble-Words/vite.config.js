import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// https://vite.dev/config/
export default defineConfig({
  base: './', // Relative paths for flexible deployment
  plugins: [
    react()
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        // Expose the App component as a library
        name: 'ScrambleWordsGame',
        exports: 'named',
        format: 'es'
      }
    }
  },
  server: {
    port: 5001 // Development port
  }
})
