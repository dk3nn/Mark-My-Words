import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/dictionary': 'http://localhost:3000',
      '/thesaurus': 'http://localhost:3000',
      '/signup': 'http://localhost:3000',
      '/login': 'http://localhost:3000',
      '/logout': 'http://localhost:3000',
      '/user': 'http://localhost:3000',
      '/folders': 'http://localhost:3000',
      '/saved': 'http://localhost:3000',
    }
  }
})