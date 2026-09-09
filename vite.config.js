/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    // happy-dom en vez de jsdom: sin binario nativo, evita el EPERM intermitente en
    // Windows que había sacado los tests del CI. Ver PROJECT-MAP "Tests".
    environment: 'happy-dom',
    setupFiles: './src/test/setup.js',
  },
})
