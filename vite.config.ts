import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// FIX: Import 'process' to provide correct types for process.cwd(), which resolves a TypeScript error.
import process from 'process'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY)
    }
  }
})