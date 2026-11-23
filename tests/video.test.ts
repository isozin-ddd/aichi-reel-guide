import { describe, expect, it } from 'vitest';
import { parseVideoUrl, toSafeHttpsUrl } from '../src/lib/video';

describe('parseVideoUrl — YouTube', () => {
  it.each([
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtube.com/shorts/dQw4w9WgXcQ?feature=share', 'dQw4w9WgXcQ'],
    ['https://m.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['  https://www.youtube.com/shorts/dQw4w9WgXcQ  ', 'dQw4w9WgXcQ'],
  ])('parses %s', (url, id) => {
    const v = parseVideoUrl(url);
    expect(v).not.toBeNull();
    expect(v!.platform).toBe('youtube');
    expect(v!.id).toBe(id);
    expect(v!.embedUrl).toBe(`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`);
    expect(v!.canonicalUrl).toBe(`https://www.youtube.com/shorts/${id}`);
  });

  it.each([
    'https://www.youtube.com/shorts/short',
    'https://www.youtube.com/shorts/dQw4w9WgXcQ"onload=alert(1)',
    'https://www.youtube.com/watch?v=<script>xxxx',
    'https://www.youtube.com/channel/UC1234567890',
    'https://www.youtube.com/',
    'http://www.youtube.com/shorts/dQw4w9WgXcQ',
    'https://youtube.com.evil.example/shorts/dQw4w9WgXcQ',
    'https://evil.example/?u=https://youtu.be/dQw4w9WgXcQ',
  ])('rejects %s', (url) => {
    expect(parseVideoUrl(url)).toBeNull();
  });
});

describe('parseVideoUrl — TikTok', () => {
  it('parses a standard video URL', () => {
    const v = parseVideoUrl('https://www.tiktok.com/@nagoya.eats/video/7301234567890123456?is_from_webapp=1');
    expect(v).toEqual({
      platform: 'tiktok',
      id: '7301234567890123456',
      canonicalUrl: 'https://www.tiktok.com/@nagoya.eats/video/7301234567890123456',
      embedUrl: 'https://www.tiktok.com/embed/v2/7301234567890123456',
    });
  });

  it.each([
    'https://www.tiktok.com/@nagoya.eats',
    'https://www.tiktok.com/@nagoya.eats/video/abc',
    'https://www.tiktok.com/nagoya/video/7301234567890123456',
    'https://vm.tiktok.com/ZMabcdef/',
    'https://www.tiktok.com/@a/photo/7301234567890123456',
  ])('rejects %s', (url) => {
    expect(parseVideoUrl(url)).toBeNull();
  });
});

describe('parseVideoUrl — Instagram', () => {
  it.each([
    ['https://www.instagram.com/reel/C1a2B3c4D5e/', 'reel', 'C1a2B3c4D5e'],
    ['https://instagram.com/reel/C1a2B3c4D5e', 'reel', 'C1a2B3c4D5e'],
    ['https://www.instagram.com/reels/C1a2B3c4D5e/', 'reel', 'C1a2B3c4D5e'],
    ['https://www.instagram.com/p/C1a2B3c4D5e/?igsh=abc', 'p', 'C1a2B3c4D5e'],
    ['https://www.instagram.com/someone/reel/C1a2B3c4D5e/', 'reel', 'C1a2B3c4D5e'],
  ])('parses %s', (url, kind, code) => {
    const v = parseVideoUrl(url);
    expect(v?.platform).toBe('instagram');
    expect(v?.id).toBe(code);
    expect(v?.embedUrl).toBe(`https://www.instagram.com/${kind}/${code}/embed/`);
  });

  it.each([
    'https://www.instagram.com/someone/',
    'https://www.instagram.com/stories/someone/1234567890/',
    'https://www.instagram.com/reel/',
    'https://www.instagram.com/reel/abc%22onerror/',
  ])('rejects %s', (url) => {
    expect(parseVideoUrl(url)).toBeNull();
  });
});

describe('parseVideoUrl — invalid and unsupported input', () => {
  it.each([
    undefined,
    null,
    42,
    {},
    '',
    '   ',
    'not a url',
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'ftp://www.youtube.com/shorts/dQw4w9WgXcQ',
    'https://user:pass@www.youtube.com/shorts/dQw4w9WgXcQ',
    'https://www.youtube.com:8443/shorts/dQw4w9WgXcQ',
    'https://' + 'a'.repeat(3000) + '.com',
  ])('returns null for %s', (input) => {
    expect(parseVideoUrl(input)).toBeNull();
  });

  it.each(['https://vimeo.com/123456789', 'https://www.facebook.com/watch/?v=123', 'https://x.com/a/status/1'])(
    'returns null for unsupported platform %s',
    (url) => {
      expect(parseVideoUrl(url)).toBeNull();
    },
  );

  it('rejects a URL that does not match the expected platform', () => {
    expect(parseVideoUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ', 'tiktok')).toBeNull();
    expect(parseVideoUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ', 'youtube')?.platform).toBe('youtube');
  });
});

describe('toSafeHttpsUrl', () => {
  it('accepts https and rejects everything else', () => {
    expect(toSafeHttpsUrl('https://vimeo.com/1')?.hostname).toBe('vimeo.com');
    expect(toSafeHttpsUrl('http://vimeo.com/1')).toBeNull();
    expect(toSafeHttpsUrl('javascript:alert(1)')).toBeNull();
  });
});
