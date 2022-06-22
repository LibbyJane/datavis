import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import mkcert from 'vite-plugin-mkcert'

//import vuetify from 'vuetify'

// import createSvgSpritePlugin from 'vite-plugin-svg-sprite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    mkcert()
    //,vuetify({ styles: 'expose' }),
    // ,createSvgSpritePlugin({
    //     symbolId: 'icon-[name]-[hash]',
    // }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    'process.env': null
  },
  server: { https: true }
  // ,css: {
  //   preprocessorOptions: {
  //     scss: {
  //       additionalData: `@import "./src/styles/global.scss";`
  //     },
  //   },
  // },
})

