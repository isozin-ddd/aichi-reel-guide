/**
 * Zod schemas for the content collections.
 *
 * They are written as factories so the exact same rules can be used by
 * Astro (with its `image()` helper and `reference()`) and by Vitest (with
 * plain string stand-ins), which lets the test suite validate every content
 * file without booting Astro.
 */
import { z } from 'astro/zod';

type AnySchema = z.ZodType;

export const AREA_SLUGS = ['nagoya', 'inuyama', 'tokoname', 'nagakute', 'toyota', 'gamagori'] as const;
export const CATEGORY_SLUGS = [
  'food-cafes',
  'culture-history',
  'experiences',
  'shopping',
  'nature',
  'hidden-gems',
] as const;

export const VIDEO_PLATFORMS = ['instagram', 'tiktok', 'youtube'] as const;
export const VIDEO_PERMISSIONS = ['granted', 'pending', 'own'] as const;
export const SPOT_STATUSES = ['open', 'temporarily_closed', 'closed'] as const;

const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens only');

/** Text that may be unknown. Unknown facts must be null, never invented. */
const optionalText = z.string().trim().min(1).nullable();

const httpsUrl = z
  .url({ protocol: /^https$/, error: 'Must be an https:// URL' })
  .nullable();

/** ISO calendar date, e.g. 2026-11-01 */
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

const triState = z.boolean().nullable();

export const videoSchema = z.object({
  platform: z.enum(VIDEO_PLATFORMS),
  url: z.url({ protocol: /^https$/, error: 'Video URLs must be https://' }),
  creator_name: z.string().trim().min(1),
  /** Only `granted` and `own` are ever displayed. */
  permission: z.enum(VIDEO_PERMISSIONS),
  caption_en: z.string().trim().min(1).optional(),
});

export interface SchemaHelpers<I extends AnySchema, A extends AnySchema, C extends AnySchema> {
  image: () => I;
  areaRef: A;
  categoryRef: C;
}

export function createSpotSchema<I extends AnySchema, A extends AnySchema, C extends AnySchema>({
  image,
  areaRef,
  categoryRef,
}: SchemaHelpers<I, A, C>) {
  return z
    .object({
      slug,
      name_en: z.string().trim().min(1),
      name_ja: optionalText,
      area: areaRef,
      category: categoryRef,

      address: optionalText,
      latitude: z.number().min(34.5).max(35.5),
      longitude: z.number().min(136.6).max(137.9),

      summary_en: z.string().trim().min(10).max(160),
      description_en: z.array(z.string().trim().min(1)).min(1),
      highlights_en: z.array(z.string().trim().min(1)).default([]),

      /** 0 = free, 1 = ¥ … 4 = ¥¥¥¥, null = unknown */
      price_level: z.number().int().min(0).max(4).nullable(),
      opening_hours: optionalText,
      closed_days: optionalText,
      nearest_station: optionalText,
      access_en: optionalText,
      /**
       * Step-by-step public transport directions, drawn as a route card.
       * The site's signature: one main route from a hub, then short alternatives.
       */
      directions: z
        .object({
          from_en: z.string().trim().min(2),
          minutes: z.number().int().positive(),
          fare_yen: z.number().int().nonnegative(),
          changes: z.number().int().nonnegative(),
          legs: z
            .array(
              z.discriminatedUnion('type', [
                z
                  .object({
                    type: z.literal('stop'),
                    name_en: z.string().trim().min(2),
                    name_ja: z.string().trim().min(1).optional(),
                    code: z.string().trim().min(1).optional(),
                    note_en: z.string().trim().min(5).optional(),
                  })
                  .strict(),
                z
                  .object({
                    type: z.literal('ride'),
                    line_en: z.string().trim().min(2),
                    line_ja: z.string().trim().min(1).optional(),
                    badge: z.string().trim().min(1).max(3),
                    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
                    toward_en: z.string().trim().min(2),
                    stops: z.number().int().positive().optional(),
                    minutes: z.number().int().positive().optional(),
                    note_en: z.string().trim().min(5).optional(),
                  })
                  .strict(),
                z
                  .object({
                    type: z.literal('walk'),
                    minutes: z.number().int().positive(),
                    text_en: z.string().trim().min(5),
                  })
                  .strict(),
              ]),
            )
            .min(3),
          alternatives: z
            .array(
              z
                .object({
                  title_en: z.string().trim().min(2),
                  text_en: z.string().trim().min(10),
                })
                .strict(),
            )
            .default([]),
        })
        .strict()
        .optional(),

      /** Admission prices for visitors, in plain English. */
      admission_en: optionalText.optional(),

      /** How strongly we recommend the spot to overseas visitors, with our reasons. Shown first on the page. */
      visitor_rating: z
        .object({
          stars: z.number().int().min(1).max(5),
          reasons_en: z.array(z.string().trim().min(10)).min(1),
        })
        .strict()
        .optional(),

      /** Suggested way to see the spot, in order. */
      route_en: z
        .array(
          z
            .object({
              title_en: z.string().trim().min(2),
              text_en: z.string().trim().min(10),
            })
            .strict(),
        )
        .default([]),

      official_url: httpsUrl,
      google_maps_url: httpsUrl,

      image: image(),
      image_alt: z.string().trim().min(5),
      image_credit: z.string().trim().min(1),
      /** Where to anchor the main photo when it is cropped, as CSS object-position, e.g. "70% 50%". */
      image_focus: z
        .string()
        .regex(/^\d{1,3}% \d{1,3}%$/, 'Use "X% Y%", e.g. "70% 50%"')
        .optional(),
      /** Extra photos shown as a swipeable strip under the title. */
      gallery: z
        .array(
          z
            .object({
              image: image(),
              alt: z.string().trim().min(5),
              credit: z.string().trim().min(1),
            })
            .strict(),
        )
        .default([]),

      traveler_info: z.object({
        english_menu: triState,
        cards_accepted: triState,
        reservation: triState,
        vegetarian: triState,
        tax_free: triState,
      }),

      videos: z.array(videoSchema).default([]),

      featured: z.boolean().default(false),
      status: z.enum(SPOT_STATUSES).default('open'),
      draft: z.boolean().default(false),
      is_sample: z.boolean().default(false),
      last_verified_at: isoDate,
    })
    .strict()
    .superRefine((spot, ctx) => {
      if (spot.is_sample && !/\(sample\)$/i.test(spot.name_en)) {
        ctx.addIssue({
          code: 'custom',
          path: ['name_en'],
          message: 'Sample spots must use a fictional name ending in "(Sample)"',
        });
      }
    });
}

export function createAreaSchema<I extends AnySchema>({ image }: { image: () => I }) {
  return z
    .object({
      slug,
      name: z.string().trim().min(1),
      name_ja: z.string().trim().min(1),
      tagline: z.string().trim().min(1),
      intro_en: z.array(z.string().trim().min(1)).min(1),
      getting_there_en: optionalText,
      latitude: z.number(),
      longitude: z.number(),
      image: image(),
      image_alt: z.string().trim().min(5),
      image_credit: z.string().trim().min(1),
      order: z.number().int(),
    })
    .strict();
}

export function createCategorySchema() {
  return z
    .object({
      slug,
      name: z.string().trim().min(1),
      short_description: z.string().trim().min(1),
      intro_en: z.array(z.string().trim().min(1)).min(1),
      icon: z.enum(['coffee', 'landmark', 'sparkles', 'shopping-bag', 'trees', 'gem']),
      order: z.number().int(),
    })
    .strict();
}
