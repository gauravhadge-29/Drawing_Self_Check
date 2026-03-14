import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Proxy /validate-drawing directly to the FastAPI backend so requests
    // go through the dev server and avoid CORS issues during development.
    proxy: {
      '/validate-drawing': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
