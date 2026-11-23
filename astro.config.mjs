// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const mode = process.argv.includes('dev') ? 'development' : 'production';
const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };

/** Public origin used for canonical, og:url, og:image, sitemap and robots.txt. Override with SITE_URL. */
const DEFAULT_SITE_URL = 'https://aichi-reel-guide.ghj87vy8mm.workers.dev';
const site = (env.SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');

/**
 * Pages that must never appear in the sitemap: sample spots (only ever built for
 * previews) and drafts (never built). Read straight from the content files so the
 * sitemap stays correct even if someone flips INCLUDE_SAMPLE_CONTENT on.
 */
const spotsDir = fileURLToPath(new URL('./src/content/spots/', import.meta.url));
const hiddenSpotPaths = new Set(
  readdirSync(spotsDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(spotsDir + f, 'utf8')))
    .filter((s) => s.draft || s.is_sample)
    .map((s) => `/spots/${s.slug}/`),
);

export default defineConfig({
  site,
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        return !hiddenSpotPaths.has(path) && path !== '/404/';
      },
    }),
  ],
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
