import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, API calls to /api are proxied to the Spring Boot backend (no CORS setup needed).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: process.env.VITE_BACKEND_URL || 'http://localhost:8080', changeOrigin: true },
    },
  },
});
