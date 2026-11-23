/**
 * Validates every content file against the same Zod schemas Astro uses at
 * build time, plus cross-file rules (references, slug = filename, images exist).
 */
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { z } from 'astro/zod';
import {
  AREA_SLUGS,
  CATEGORY_SLUGS,
  createAreaSchema,
  createCategorySchema,
  createSpotSchema,
} from '../src/lib/schemas';

const root = resolve(__dirname, '../src/content');
const load = (dir: string) =>
  readdirSync(join(root, dir))
    .filter((f) => f.endsWith('.json'))
    .map((file) => ({ file, path: join(root, dir, file), data: JSON.parse(readFileSync(join(root, dir, file), 'utf8')) }));

const areas = load('areas');
const categories = load('categories');
const spots = load('spots');

const image = () => z.string().refine((p) => /\.(jpe?g|png|webp|avif)$/i.test(p), 'Image must be jpg/png/webp/avif');
const areaIds = areas.map((a) => a.data.slug);
const categoryIds = categories.map((c) => c.data.slug);
const spotSchema = createSpotSchema({
  image,
  areaRef: z.string().refine((v) => areaIds.includes(v), 'Unknown area'),
  categoryRef: z.string().refine((v) => categoryIds.includes(v), 'Unknown category'),
});

function expectValid(schema: z.ZodType, data: unknown, file: string) {
  const result = schema.safeParse(data);
  if (!result.success) throw new Error(`${file}: ${z.prettifyError(result.error)}`);
}

describe('areas', () => {
  it('has exactly the six launch areas', () => {
    expect(areaIds.sort()).toEqual([...AREA_SLUGS].sort());
  });
  it.each(areas)('$file is valid', ({ data, file, path }) => {
    expectValid(createAreaSchema({ image }), data, file);
    expect(file).toBe(`${data.slug}.json`);
    expect(existsSync(resolve(dirname(path), data.image))).toBe(true);
  });
});

describe('categories', () => {
  it('has exactly the six launch categories', () => {
    expect(categoryIds.sort()).toEqual([...CATEGORY_SLUGS].sort());
  });
  it.each(categories)('$file is valid', ({ data, file }) => {
    expectValid(createCategorySchema(), data, file);
    expect(file).toBe(`${data.slug}.json`);
  });
});

describe('spots', () => {
  it.each(spots)('$file is valid', ({ data, file, path }) => {
    expectValid(spotSchema, data, file);
    expect(file).toBe(`${data.slug}.json`);
    expect(existsSync(resolve(dirname(path), data.image))).toBe(true);
  });

  it('rejects unknown fields, bad URLs and invented-looking samples', () => {
    const valid = spots.find((s) => !s.data.draft)!.data;
    expect(spotSchema.safeParse({ ...valid, rating: 5 }).success).toBe(false);
    expect(spotSchema.safeParse({ ...valid, official_url: 'javascript:alert(1)' }).success).toBe(false);
    expect(spotSchema.safeParse({ ...valid, area: 'osaka' }).success).toBe(false);
    expect(
      spotSchema.safeParse({ ...valid, videos: [{ ...valid.videos[0], url: 'http://youtu.be/dQw4w9WgXcQ' }] }).success,
    ).toBe(false);
    expect(spotSchema.safeParse({ ...valid, is_sample: true, name_en: 'Real Cafe' }).success).toBe(false);
    expect(spotSchema.safeParse({ ...valid, latitude: 40 }).success).toBe(false);
    expect(spotSchema.safeParse({ ...valid, traveler_info: { ...valid.traveler_info, tax_free: 'yes' } }).success).toBe(false);
  });

  it('has unique slugs', () => {
    const slugs = spots.map((s) => s.data.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
