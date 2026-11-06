import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Rutas relativas para poder publicarlo en GitHub Pages.
  base: './',
  plugins: [react(), tailwindcss()],
})
