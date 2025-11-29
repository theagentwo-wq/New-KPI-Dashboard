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
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'https://api-watqbfh3lq-uc.a.run.app',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    // The following `define` block is the critical fix.
    // It makes the environment variables available to the build process.
    define: {
      'import.meta.env.VITE_FIREBASE_CLIENT_CONFIG': JSON.stringify(env.VITE_FIREBASE_CLIENT_CONFIG),
      'import.meta.env.VITE_MAPS_KEY': JSON.stringify(env.VITE_MAPS_KEY),
    },
    build: {
      commonjsOptions: {
        include: [/firebase/, /node_modules/],
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'firebase': ['firebase/app', 'firebase/firestore', 'firebase/storage'],
          },
        },
      },
    },
    optimizeDeps: {
      include: ['firebase/app', 'firebase/firestore', 'firebase/storage'],
      esbuildOptions: {
        target: 'esnext',
      },
    },
  }
})
