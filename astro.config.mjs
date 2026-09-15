// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'static',
  site: 'https://isom-835.vercel.app',
  vite: {
    plugins: [tailwindcss()]
  },
  adapter: vercel()
});
