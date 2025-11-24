import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// FIX: Resolve __dirname for ES module scope
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to \'\' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'https://api-watqbfh3lq-uc.a.run.app',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    // The following `define` block is the critical fix.
    // It makes the FIREBASE_CLIENT_CONFIG variable available to the build process.
    define: {
      'import.meta.env.FIREBASE_CLIENT_CONFIG': JSON.stringify(env.FIREBASE_CLIENT_CONFIG),
    },
  }
})
