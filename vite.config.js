import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'lucide': ['lucide-react'],
          'supabase': ['@supabase/supabase-js'],
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      }
    },
    target: 'esnext',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
    cssMinify: true,
  },
  server: {
    port: 5173,
    hmr: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react', '@supabase/supabase-js']
  }
})
