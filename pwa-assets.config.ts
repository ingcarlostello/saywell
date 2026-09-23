import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Opaque maskable and Apple icons on the manifest's background_color (vite.config.ts; check-arch keeps them in
// sync): Android's splash screen then blends with the icon, and iOS never fills transparency with black.
const ICON_BACKGROUND = '#050e1a';

// npm run generate-pwa-assets writes the icons next to the source image in public/; the PNGs are committed.
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { fit: 'contain', background: ICON_BACKGROUND } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { fit: 'contain', background: ICON_BACKGROUND } },
  },
  images: ['public/favicon.svg'],
});
