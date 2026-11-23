/**
 * Site-wide settings. Edit these values (or the environment variables they
 * read) rather than hard-coding them in components.
 */
function parseEmail(value: string | undefined): string | null {
  const v = value?.trim() ?? '';
  return /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(v) ? v : null;
}

export const SITE = {
  name: 'Aichi Reel Guide',
  tagline: 'Discover Aichi through local videos.',
  description:
    'An independent English guide to Aichi, Japan — Nagoya and beyond — told through short videos by local creators. Cafes, castles, crafts and quiet corners worth the trip.',
  locale: 'en_US',
  /**
   * Contact address from PUBLIC_CONTACT_EMAIL. When unset (or not an email
   * address), every contact section and link is hidden — no placeholder text.
   */
  contactEmail: parseEmail(import.meta.env.PUBLIC_CONTACT_EMAIL as string | undefined),
  /**
   * Operator's social accounts, shown in the footer. Add entries like
   * { label: 'Instagram', href: 'https://www.instagram.com/your_handle/' }.
   * Empty URLs are skipped.
   */
  social: [
    { label: 'Instagram', href: (import.meta.env.PUBLIC_SOCIAL_INSTAGRAM as string | undefined) ?? '' },
    { label: 'TikTok', href: (import.meta.env.PUBLIC_SOCIAL_TIKTOK as string | undefined) ?? '' },
    { label: 'YouTube', href: (import.meta.env.PUBLIC_SOCIAL_YOUTUBE as string | undefined) ?? '' },
  ].filter((s) => /^https:\/\//.test(s.href)),
} as const;

export const MAP_TILES = {
  url:
    (import.meta.env.PUBLIC_MAP_TILE_URL as string | undefined) ||
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution:
    (import.meta.env.PUBLIC_MAP_TILE_ATTRIBUTION as string | undefined) ||
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: Number(import.meta.env.PUBLIC_MAP_TILE_MAX_ZOOM) || 19,
};

export const ANALYTICS_TOKEN = (import.meta.env.PUBLIC_CF_ANALYTICS_TOKEN as string | undefined) || '';
