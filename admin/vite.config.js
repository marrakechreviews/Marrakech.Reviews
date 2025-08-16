import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Fix process is not defined error
    global: 'globalThis',
  },
  server: {
    host: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      clientPort: 5000
    },
    watch: {
      usePolling: true
    },
    allowedHosts: [
      'localhost',
      '5179-ijxauh34hm2ew1rlc7wyf-6962130e.manusvm.computer'
    ]
  }
})

