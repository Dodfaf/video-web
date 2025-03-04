// import { fileURLToPath, URL } from 'node:url'

// import { defineConfig } from 'vite'
// import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     vue(),
//     vueDevTools(),
//   ],
//   resolve: {
//     alias: {
//       '@': fileURLToPath(new URL('./src', import.meta.url))
//     },
//   },
// })

import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const VITE_API_HOST = 'http://localhost:5000'
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/videodisplay': {
        target: VITE_API_HOST,
        changeOrigin: true
      }
    }
  }
})
