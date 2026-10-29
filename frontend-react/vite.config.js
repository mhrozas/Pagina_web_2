import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Las llamadas a /api se reenvían al backend, así no hace falta configurar CORS
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
