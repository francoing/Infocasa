  /// <reference types="vitest" />
  import { defineConfig, loadEnv } from 'vite'
  import react from '@vitejs/plugin-react'
  import path from 'path'

  // Hosts extra para el dev server (p. ej. un túnel de ngrok), desde tu .env local:
  //   VITE_DEV_ALLOWED_HOSTS=mi-tunel.ngrok-free.dev,.ngrok-free.dev
  // Sin la variable solo se acepta localhost.
  const devAllowedHosts = (mode) =>
    (loadEnv(mode, process.cwd(), '').VITE_DEV_ALLOWED_HOSTS || '')
      .split(',')
      .map((host) => host.trim())
      .filter(Boolean)

  // https://vitejs.dev/config/
  export default defineConfig(({ mode }) => ({
    plugins: [react()],
    server: {
      host: true, // permite conexiones de red
      port: 5173,
      allowedHosts: ['localhost', ...devAllowedHosts(mode)],
    },
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
  }))
