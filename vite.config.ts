import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
// import viteFastify from '@fastify/vite/plugin'
// import viteFastifyVue from '@fastify/vue/plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  server: {
    proxy: {
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true
      },
      '/ask': 'http://localhost:3000'
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
