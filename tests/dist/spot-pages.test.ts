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

  it('uses the Next Stop Nagoya brand and never the old name', () => {
    const pages = ['index.html', 'about/index.html', 'privacy/index.html', 'spots/nagoya-castle/index.html'];
    for (const page of pages) {
      const html = read(page);
      expect(html).toContain('Next Stop Nagoya');
      expect(html).not.toMatch(/Aichi Reel Guide/i);
    }
    expect(read('index.html')).toMatch(/<title>Next Stop Nagoya/);
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

  it('puts the visitor info in priority order: rating, access, hours, admission, route', () => {
    const ids = ['rating-heading', 'access-heading', 'hours-heading', 'admission-heading', 'route-heading', 'about-heading'];
    const positions = ids.map((id) => html.indexOf(`id="${id}"`));
    expect(positions.every((p) => p > 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it('draws the route card from Nagoya Station with lines, transfer and exit', () => {
    const start = html.indexOf('id="getting-there"');
    const section = html.slice(start, html.indexOf('id="hours-heading"'));
    expect(section).toContain('From Nagoya Station');
    expect(section).toContain('¥240');
    for (const text of ['Higashiyama Line', 'Meijo Line', 'Sakae', 'Nagoyajo', 'Exit 7', 'Shiyakusho']) {
      expect(section).toContain(text);
    }
    expect(section.indexOf('Higashiyama Line')).toBeLessThan(section.indexOf('Meijo Line'));
  });

  it('links the at-a-glance travel time to the directions', () => {
    expect(html).toMatch(/<a href="#getting-there"[^>]*>\s*15 min/);
  });

  it('shows the star rating out of 5', () => {
    expect(html).toMatch(/\d out of 5 for overseas visitors/);
  });

  it('credits Photock', () => {
    expect(html).toContain('Photo: Photock');
  });

  it('does not use any view taken from the castle keep', () => {
    expect(html).not.toMatch(/view-of-nagoya-city/i);
  });
});
