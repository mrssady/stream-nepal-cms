import { detectionFingerprint, DedupCache } from './ocr-dedup';

describe('detectionFingerprint', () => {
  it('is stable regardless of key order', () => {
    const a = detectionFingerprint('r', 'K', { a: 1, b: 2 });
    const b = detectionFingerprint('r', 'K', { b: 2, a: 1 });

    expect(a).toBe(b);
  });

  it('differs when kind or value changes', () => {
    expect(detectionFingerprint('killFeed', 'K', { killer: 'x' })).not.toBe(
      detectionFingerprint('killFeed', 'K', { killer: 'y' }),
    );
  });
});

describe('DedupCache', () => {
  it('deduplicates within the window', () => {
    const cache = new DedupCache(1500);

    expect(cache.isDuplicate('fp', 1000)).toBe(false);
    cache.mark('fp', 1000);
    expect(cache.isDuplicate('fp', 1200)).toBe(true);
  });

  it('allows re-emission after the window expires', () => {
    const cache = new DedupCache(100);

    cache.mark('fp', 1000);
    expect(cache.isDuplicate('fp', 1200)).toBe(false);
  });

  it('only blocks within window per fingerprint', () => {
    const cache = new DedupCache(1500);

    cache.mark('a', 1000);
    expect(cache.isDuplicate('b', 1100)).toBe(false);
  });
});
