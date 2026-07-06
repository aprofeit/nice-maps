import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Serve index.html for all routes (SPA routing)
    historyApiFallback: true,
  },
})
