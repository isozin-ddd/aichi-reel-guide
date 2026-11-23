import { getCollection, type CollectionEntry } from 'astro:content';
import { isDisplayableVideo, isPublishable, shouldIncludeSamples } from './publish';

export type Spot = CollectionEntry<'spots'>;
export type Area = CollectionEntry<'areas'>;
export type Category = CollectionEntry<'categories'>;

export const INCLUDE_SAMPLES = shouldIncludeSamples({
  DEV: import.meta.env.DEV,
  INCLUDE_SAMPLE_CONTENT: process.env.INCLUDE_SAMPLE_CONTENT ?? import.meta.env.INCLUDE_SAMPLE_CONTENT,
});

/** All spots that may be built, sorted: featured first, then by name. */
export async function getPublishedSpots(): Promise<Spot[]> {
  const spots = await getCollection('spots', ({ data }) =>
    isPublishable(data, { includeSamples: INCLUDE_SAMPLES }),
  );
  return spots.sort(
    (a, b) =>
      Number(b.data.featured) - Number(a.data.featured) || a.data.name_en.localeCompare(b.data.name_en),
  );
}

export async function getAreas(): Promise<Area[]> {
  return (await getCollection('areas')).sort((a, b) => a.data.order - b.data.order);
}

export async function getCategories(): Promise<Category[]> {
  return (await getCollection('categories')).sort((a, b) => a.data.order - b.data.order);
}

export function displayableVideos(spot: Spot) {
  return spot.data.videos.filter(isDisplayableVideo);
}

export async function getLookups() {
  const [areas, categories] = await Promise.all([getAreas(), getCategories()]);
  return {
    areas,
    categories,
    areaById: new Map(areas.map((a) => [a.id, a])),
    categoryById: new Map(categories.map((c) => [c.id, c])),
  };
}
