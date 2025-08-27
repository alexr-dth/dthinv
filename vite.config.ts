import fs from 'node:fs'
import path from 'node:path'

import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { resolve } from 'node:path'

import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'robots.txt',
        'apple-touch-icon.png',
      ],
    }),
  ],
  preview: {
    allowedHosts: ['.ngrok-free.app'],
  },
  server: {
    allowedHosts: ['.ngrok-free.app'],
    host: true,
    // https: {
    //   key: fs.readFileSync(
    //     path.resolve(__dirname, './certs/localhost-key.pem'),
    //   ),
    //   cert: fs.readFileSync(
    //     path.resolve(__dirname, './certs/localhost-cert.pem'),
    //   ),
    // },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
