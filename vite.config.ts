import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative paths so the site works on GitHub Pages.
  base: './',
  plugins: [react(), tailwindcss()],
})
