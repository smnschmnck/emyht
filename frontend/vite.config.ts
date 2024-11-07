import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import Unfonts from 'unplugin-fonts/vite';
import { VitePWA } from 'vite-plugin-pwa';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import './src/env';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'emyht',
        short_name: 'emyht',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,jsx,css,html,png,svg,woff2,ico,json,webp}'],
      },
    }),
    Unfonts({
      fontsource: {
        families: [
          'Plus Jakarta Sans Variable',
          {
            name: 'Plus Jakarta Sans Variable',
            weights: [],
            styles: ['italic', 'normal'],
            subset: 'latin-ext',
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
});
