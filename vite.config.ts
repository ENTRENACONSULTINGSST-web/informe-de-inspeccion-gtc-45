import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // Using relative paths for hosting portability (GitHub Pages, preview, etc)
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
