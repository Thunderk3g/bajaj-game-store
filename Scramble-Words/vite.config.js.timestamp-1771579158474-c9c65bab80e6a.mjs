// vite.config.js
import { defineConfig } from "file:///C:/Users/Abhishek.Gurjar/Desktop/bajaj-game-store/node_modules/.pnpm/vite@5.4.21_@types+node@25._d67011bf73f87d9a01204cc08e80ebd8/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Abhishek.Gurjar/Desktop/bajaj-game-store/node_modules/.pnpm/@vitejs+plugin-react@4.7.0__5e8d7e567a0ba2c36053f2e4afe85757/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///C:/Users/Abhishek.Gurjar/Desktop/bajaj-game-store/node_modules/.pnpm/@tailwindcss+vite@4.1.18_vi_75c978c7256106a4c47df93f231b0056/node_modules/@tailwindcss/vite/dist/index.mjs";
var vite_config_default = defineConfig({
  base: "./",
  // Relative paths for flexible deployment
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        // Expose the App component as a library
        name: "ScrambleWordsGame",
        exports: "named",
        format: "es"
      }
    }
  },
  server: {
    port: 5001
    // Development port
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBYmhpc2hlay5HdXJqYXJcXFxcRGVza3RvcFxcXFxiYWphai1nYW1lLXN0b3JlXFxcXFNjcmFtYmxlLVdvcmRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBYmhpc2hlay5HdXJqYXJcXFxcRGVza3RvcFxcXFxiYWphai1nYW1lLXN0b3JlXFxcXFNjcmFtYmxlLVdvcmRzXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9BYmhpc2hlay5HdXJqYXIvRGVza3RvcC9iYWphai1nYW1lLXN0b3JlL1NjcmFtYmxlLVdvcmRzL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSAnQHRhaWx3aW5kY3NzL3ZpdGUnXHJcblxyXG4vLyBodHRwczovL3ZpdGUuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBiYXNlOiAnLi8nLCAvLyBSZWxhdGl2ZSBwYXRocyBmb3IgZmxleGlibGUgZGVwbG95bWVudFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICB0YWlsd2luZGNzcygpLFxyXG4gIF0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIG91dERpcjogJ2Rpc3QnLFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAvLyBFeHBvc2UgdGhlIEFwcCBjb21wb25lbnQgYXMgYSBsaWJyYXJ5XHJcbiAgICAgICAgbmFtZTogJ1NjcmFtYmxlV29yZHNHYW1lJyxcclxuICAgICAgICBleHBvcnRzOiAnbmFtZWQnLFxyXG4gICAgICAgIGZvcm1hdDogJ2VzJ1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIHBvcnQ6IDUwMDEgLy8gRGV2ZWxvcG1lbnQgcG9ydFxyXG4gIH1cclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE4WCxTQUFTLG9CQUFvQjtBQUMzWixPQUFPLFdBQVc7QUFDbEIsT0FBTyxpQkFBaUI7QUFHeEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsTUFBTTtBQUFBO0FBQUEsRUFDTixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsRUFDZDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBO0FBQUEsUUFFTixNQUFNO0FBQUEsUUFDTixTQUFTO0FBQUEsUUFDVCxRQUFRO0FBQUEsTUFDVjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUE7QUFBQSxFQUNSO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
