import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/aipcvl/', // Subpath isolation required by Nginx
  server: {
    proxy: {
      '/aipcvl-api': {
        target: 'http://127.0.0.1:8000',
        rewrite: (path) => path.replace(/^\/aipcvl-api/, '/api'),
        changeOrigin: true
      }
    }
  }
})
