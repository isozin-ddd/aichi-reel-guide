import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { createAreaSchema, createCategorySchema, createSpotSchema } from './lib/schemas';

const areas = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/areas' }),
  schema: ({ image }) => createAreaSchema({ image }),
});

const categories = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/categories' }),
  schema: () => createCategorySchema(),
});

const spots = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/spots' }),
  schema: ({ image }) =>
    createSpotSchema({
      image,
      areaRef: reference('areas'),
      categoryRef: reference('categories'),
    }),
});

export const collections = { areas, categories, spots };
