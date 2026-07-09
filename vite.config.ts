import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa' // 👇 Import the plugin

export default defineConfig({
  plugins: [
    vue(),
    // ⚙️ Configure the PWA plugin
    VitePWA({
      registerType: 'autoUpdate', // Automatically patches assets in the background
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Wonderbakes Seller App',
        short_name: 'Wonderbakes Seller',
        description: 'Dashboard portal for managing Wonderbakes orders and pastry inventories.',
        theme_color: '#ff6b81',
        background_color: '#fcf8f8',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})