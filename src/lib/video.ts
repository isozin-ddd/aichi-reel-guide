/**
 * Safe parsing of social video URLs.
 *
 * Nothing here ever trusts the raw string: URLs are parsed with the WHATWG URL
 * parser, must be https, must be on an allow-listed host, and IDs are matched
 * against strict character sets before being placed into an embed URL.
 * Anything that doesn't match returns `null`, and the UI falls back to a plain
 * link card (or nothing, if the URL is not even a safe https link).
 */

export type VideoPlatform = 'instagram' | 'tiktok' | 'youtube';

export interface ParsedVideo {
  platform: VideoPlatform;
  /** Platform-specific ID (YouTube video ID, TikTok numeric ID, Instagram shortcode). */
  id: string;
  /** Normalised public URL of the original post. */
  canonicalUrl: string;
  /** URL to load in an iframe once the visitor opts in. */
  embedUrl: string;
}

const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']);
const TIKTOK_HOSTS = new Set(['tiktok.com', 'www.tiktok.com', 'm.tiktok.com']);
const INSTAGRAM_HOSTS = new Set(['instagram.com', 'www.instagram.com']);

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const TIKTOK_ID = /^\d{8,25}$/;
const TIKTOK_USER = /^@[A-Za-z0-9._]{1,40}$/;
const INSTAGRAM_CODE = /^[A-Za-z0-9_-]{5,40}$/;

/** Parse a string into an https URL, or null. Rejects credentials and odd ports. */
export function toSafeHttpsUrl(raw: unknown): URL | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > 2048) return null;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  if (url.username || url.password) return null;
  if (url.port && url.port !== '443') return null;
  return url;
}

function segments(url: URL): string[] {
  return url.pathname.split('/').filter(Boolean);
}

export function parseYouTube(url: URL): ParsedVideo | null {
  const host = url.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) return null;
  const parts = segments(url);
  let id: string | null = null;

  if (host === 'youtu.be') {
    id = parts[0] ?? null;
  } else if (parts[0] === 'shorts' || parts[0] === 'embed' || parts[0] === 'live') {
    id = parts[1] ?? null;
  } else if (parts[0] === 'watch' && parts.length === 1) {
    id = url.searchParams.get('v');
  }

  if (!id || !YOUTUBE_ID.test(id)) return null;
  return {
    platform: 'youtube',
    id,
    canonicalUrl: `https://www.youtube.com/shorts/${id}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`,
  };
}

export function parseTikTok(url: URL): ParsedVideo | null {
  const host = url.hostname.toLowerCase();
  if (!TIKTOK_HOSTS.has(host)) return null;
  const parts = segments(url);
  // https://www.tiktok.com/@user/video/1234567890123456789
  if (parts.length < 3 || !TIKTOK_USER.test(parts[0]!) || parts[1] !== 'video') return null;
  const id = parts[2]!;
  if (!TIKTOK_ID.test(id)) return null;
  return {
    platform: 'tiktok',
    id,
    canonicalUrl: `https://www.tiktok.com/${parts[0]}/video/${id}`,
    embedUrl: `https://www.tiktok.com/embed/v2/${id}`,
  };
}

export function parseInstagram(url: URL): ParsedVideo | null {
  const host = url.hostname.toLowerCase();
  if (!INSTAGRAM_HOSTS.has(host)) return null;
  const parts = segments(url);
  // /reel/{code}/, /reels/{code}/, /p/{code}/, or /{user}/reel/{code}/
  let kind: string | undefined;
  let code: string | undefined;
  if (['reel', 'reels', 'p', 'tv'].includes(parts[0] ?? '')) {
    [kind, code] = parts;
  } else if (['reel', 'p'].includes(parts[1] ?? '')) {
    [, kind, code] = parts;
  }
  if (!kind || !code || !INSTAGRAM_CODE.test(code)) return null;
  const path = kind === 'p' || kind === 'tv' ? 'p' : 'reel';
  return {
    platform: 'instagram',
    id: code,
    canonicalUrl: `https://www.instagram.com/${path}/${code}/`,
    embedUrl: `https://www.instagram.com/${path}/${code}/embed/`,
  };
}

const PARSERS: Record<VideoPlatform, (url: URL) => ParsedVideo | null> = {
  youtube: parseYouTube,
  tiktok: parseTikTok,
  instagram: parseInstagram,
};

/**
 * Parse a video URL. When `expected` is given, the URL must belong to that
 * platform — a mismatch between data and URL is treated as unsupported.
 */
export function parseVideoUrl(raw: unknown, expected?: VideoPlatform): ParsedVideo | null {
  const url = toSafeHttpsUrl(raw);
  if (!url) return null;
  if (expected) return PARSERS[expected]?.(url) ?? null;
  for (const parse of Object.values(PARSERS)) {
    const result = parse(url);
    if (result) return result;
  }
  return null;
}

export const PLATFORM_LABELS: Record<VideoPlatform, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube Shorts',
};
