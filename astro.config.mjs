// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// /session-02 is the URL people type and share; the page itself lives at
// /sessions/session-02. (public/session-NN/ holds that session's notebooks and
// slides, so the bare path used to hit a bare asset folder and 404.)
const sessionAliases = Object.fromEntries(
  Array.from({ length: 13 }, (_, i) => String(i + 1).padStart(2, '0'))
    .map((n) => [`/session-${n}`, `/sessions/session-${n}`])
);

export default defineConfig({
  output: 'static',
  redirects: sessionAliases,
  site: 'https://isom-835.vercel.app',
  vite: {
    plugins: [tailwindcss()]
  },
  adapter: vercel()
});
