import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Build only: the dev server has no service worker (npm run build && npm run preview to try it).
    VitePWA({
      // skipWaiting + clientsClaim. The injected registerSW.js never reloads an open page, so a half-typed word is
      // never lost: a new deploy downloads in the background on one launch and shows on the following one.
      // Never delete or rename /sw.js: installed clients would keep the last version. To retire the PWA, deploy
      // `selfDestroying: true` at the same URL and keep it for months.
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        // Changing `id` makes browsers treat it as a different app: installed copies would not update.
        id: '/',
        name: 'Pronunciador EN→ES',
        short_name: 'Pronunciador',
        description: 'Aprende a pronunciar inglés americano con fonética sencilla, sílaba por sílaba.',
        lang: 'es',
        start_url: '/',
        scope: '/',
        // No display_override: STANDALONE_QUERY (install-app constants) only detects `standalone`.
        display: 'standalone',
        orientation: 'portrait',
        // theme_color mirrors THEME_META_COLORS.dark; background_color is the icons' background
        // (pwa-assets.config.ts). check-arch keeps both in sync.
        theme_color: '#0c1829',
        background_color: '#050e1a',
        // Written by npm run generate-pwa-assets (pwa-assets.config.ts); precached through includeManifestIcons.
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // woff2 so the offline shell keeps its fonts.
        globPatterns: ['**/*.{js,css,html,woff2}'],
        // /api is network-only: never answered with the app shell, and no runtimeCaching stores its responses.
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
