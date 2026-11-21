import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      proxy: {
        '^/(?:oauth2/authorization|login/oauth2/code)(?:/|$)': { target: env.DEV_API_PROXY_TARGET || env.VITE_API_BASE_URL || 'http://localhost:8080', changeOrigin: true },
        '^/api(?:/|$)': {
          target: env.DEV_API_PROXY_TARGET || env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  }
})
