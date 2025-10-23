import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import yaml from '@rollup/plugin-yaml'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/counter-radicalize/',
  plugins: [vue(), yaml()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@models': path.resolve(__dirname, './models')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use '@/assets/styles/theme' as *;`
      }
    }
  }
})
