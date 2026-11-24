import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Runs against the output of `npm run build` (see the "verify" script).
const dist = resolve(__dirname, '../../dist');
const read = (path: string) => readFileSync(resolve(dist, path), 'utf8');

describe('built site', () => {
  it('has a home page and a spots index', () => {
    expect(existsSync(resolve(dist, 'index.html'))).toBe(true);
    expect(existsSync(resolve(dist, 'spots/index.html'))).toBe(true);
  });
});

describe('Nagoya Castle page', () => {
  const html = read('spots/nagoya-castle/index.html');

  it('leads with the castle keep photo, anchored so the keep stays in frame', () => {
    const firstImg = html.match(/<img[^>]+>/)?.[0] ?? '';
    expect(firstImg).toMatch(/src="\/_astro\/nagoya-castle-keep\.[^"]+"/);
    expect(firstImg).toContain('object-position: 70% 50%');
  });

  it('shows every gallery photo with its alt text', () => {
    for (const name of ['stone-monument', 'shachihoko', 'hommaru-palace', 'moat']) {
      expect(html).toMatch(new RegExp(`<img[^>]+src="/_astro/nagoya-castle-${name}\\.[^"]+"[^>]*alt="[^"]{5,}"`));
    }
  });

  it('credits Photock', () => {
    expect(html).toContain('Photo: Photock');
  });

  it('does not use any view taken from the castle keep', () => {
    expect(html).not.toMatch(/view-of-nagoya-city/i);
  });
});
