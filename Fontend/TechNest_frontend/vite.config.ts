// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/users': {
          target: env.VITE_USER_SERVICE_URL,
          changeOrigin: true,
          secure: false,
        },
        '/products': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
        '/orders': {
          target: env.VITE_ORDER_SERVICE_URL,
          changeOrigin: true,
          secure: false,
        },

        // ◀── Add this block ──▶
        '/api/payment': {
          // Use your same API URL env var
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
          // no rewrite needed if your backend path is /api/payment/...
        },
      },
    },
  };
});
