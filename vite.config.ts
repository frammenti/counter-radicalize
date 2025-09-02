import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import lightDarkFallback from '@csstools/postcss-light-dark-function'

// https://vite.dev/config/
export default defineConfig({
  base: '/counter-radicalize/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@models': path.resolve(__dirname, './models')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use '@/assets/styles/main' as *;`
      }
    },
    postcss: {
      plugins: [lightDarkFallback()]
    }
  }
})
