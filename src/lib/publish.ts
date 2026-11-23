/**
 * Publishing rules, kept free of Astro imports so they can be unit-tested.
 *
 * - `draft: true` spots are never built.
 * - `is_sample: true` spots are only built in `astro dev`, or when the build
 *   explicitly opts in with INCLUDE_SAMPLE_CONTENT=true (preview deployments).
 * - Only videos whose permission is `granted` or `own` are displayed.
 */

export interface PublishFlags {
  draft?: boolean;
  is_sample?: boolean;
}

export interface PublishOptions {
  includeSamples: boolean;
}

export function isPublishable(spot: PublishFlags, { includeSamples }: PublishOptions): boolean {
  if (spot.draft) return false;
  if (spot.is_sample && !includeSamples) return false;
  return true;
}

export function shouldIncludeSamples(env: {
  DEV?: boolean;
  INCLUDE_SAMPLE_CONTENT?: string | boolean | undefined;
}): boolean {
  if (env.DEV) return true;
  const flag = env.INCLUDE_SAMPLE_CONTENT;
  return flag === true || flag === 'true' || flag === '1';
}

export type VideoPermission = 'granted' | 'pending' | 'own';

export function isDisplayableVideo(video: { permission: VideoPermission }): boolean {
  return video.permission === 'granted' || video.permission === 'own';
}
