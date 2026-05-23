import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/informe-de-inspeccion-gtc-45/', // ← Importante: nombre exacto del repositorio
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
