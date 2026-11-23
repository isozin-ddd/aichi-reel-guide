export function priceLabel(level: number | null): { symbol: string; text: string } | null {
  switch (level) {
    case 0:
      return { symbol: 'Free', text: 'Free entry' };
    case 1:
      return { symbol: '¥', text: 'Budget' };
    case 2:
      return { symbol: '¥¥', text: 'Moderate' };
    case 3:
      return { symbol: '¥¥¥', text: 'Pricey' };
    case 4:
      return { symbol: '¥¥¥¥', text: 'Splurge' };
    default:
      return null;
  }
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!)).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function googleMapsUrl(spot: {
  google_maps_url: string | null;
  latitude: number;
  longitude: number;
}): string {
  if (spot.google_maps_url) return spot.google_maps_url;
  return `https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`;
}

export const STATUS_LABELS = {
  open: null,
  temporarily_closed: 'Temporarily closed',
  closed: 'Permanently closed',
} as const;
