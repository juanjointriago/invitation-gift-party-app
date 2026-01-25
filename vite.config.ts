import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Manual chunking to keep main bundle lean
        manualChunks: {
          firebase: [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/database',
            'firebase/storage',
          ],
          framer: ['framer-motion'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          table: ['@tanstack/react-table'],
          state: ['zustand'],
          ui: ['lucide-react', 'sonner'],
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
})
