import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  base: "/informe-de-inspeccion-gtc-45/",
  css: {
    postcss: "./postcss.config.cjs",
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
})
