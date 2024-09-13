import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag === 'webview'
        }
      }
    })
  ],
  base: process.env.ELECTRON == 'true' ? './' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: '.',
    rollupOptions: {
      external: ['electron']
    }
  },
  optimizeDeps: {
    include: ['v-calendar']
  }
})

