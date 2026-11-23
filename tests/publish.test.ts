import { describe, expect, it } from 'vitest';
import { isDisplayableVideo, isPublishable, shouldIncludeSamples } from '../src/lib/publish';

describe('isPublishable', () => {
  const prod = { includeSamples: false };
  const preview = { includeSamples: true };

  it('publishes normal spots', () => {
    expect(isPublishable({ draft: false, is_sample: false }, prod)).toBe(true);
    expect(isPublishable({}, prod)).toBe(true);
  });
  it('never publishes drafts, even in previews', () => {
    expect(isPublishable({ draft: true }, prod)).toBe(false);
    expect(isPublishable({ draft: true }, preview)).toBe(false);
    expect(isPublishable({ draft: true, is_sample: true }, preview)).toBe(false);
  });
  it('excludes samples from production', () => {
    expect(isPublishable({ is_sample: true }, prod)).toBe(false);
    expect(isPublishable({ is_sample: true }, preview)).toBe(true);
  });
});

describe('shouldIncludeSamples', () => {
  it('is on in dev and off in production by default', () => {
    expect(shouldIncludeSamples({ DEV: true })).toBe(true);
    expect(shouldIncludeSamples({ DEV: false })).toBe(false);
    expect(shouldIncludeSamples({ DEV: false, INCLUDE_SAMPLE_CONTENT: 'false' })).toBe(false);
    expect(shouldIncludeSamples({ DEV: false, INCLUDE_SAMPLE_CONTENT: '' })).toBe(false);
  });
  it('only opts in on an explicit flag', () => {
    expect(shouldIncludeSamples({ DEV: false, INCLUDE_SAMPLE_CONTENT: 'true' })).toBe(true);
    expect(shouldIncludeSamples({ DEV: false, INCLUDE_SAMPLE_CONTENT: '1' })).toBe(true);
    expect(shouldIncludeSamples({ DEV: false, INCLUDE_SAMPLE_CONTENT: 'yes' })).toBe(false);
  });
});

describe('isDisplayableVideo', () => {
  it('shows granted and own, hides pending', () => {
    expect(isDisplayableVideo({ permission: 'granted' })).toBe(true);
    expect(isDisplayableVideo({ permission: 'own' })).toBe(true);
    expect(isDisplayableVideo({ permission: 'pending' })).toBe(false);
  });
});
