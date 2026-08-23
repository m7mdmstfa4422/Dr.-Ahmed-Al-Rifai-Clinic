import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['public/logo.png'],
      manifest: {
        name: 'عيادة د. أحمد الرفاعي',
        short_name: 'العيادة',
        description: 'المنظومة الطبية الذكية لإدارة العيادات',
        theme_color: '#0284c7',
        background_color: '#ffffff',
        display: 'standalone',
        dir: 'rtl',
        lang: 'ar',
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    host: true, // يسمح للأجهزة الأخرى على الشبكة بالوصول
    proxy: { '/api': 'http://localhost:5000' }
  }
});
