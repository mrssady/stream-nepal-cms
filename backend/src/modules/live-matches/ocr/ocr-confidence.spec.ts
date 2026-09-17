import { confidenceTier, tierAcceptable } from './ocr-confidence';

describe('confidenceTier', () => {
  it('tiers at the specified thresholds', () => {
    expect(confidenceTier(0.96)).toBe('HIGH');
    expect(confidenceTier(0.9)).toBe('HIGH');
    expect(confidenceTier(0.8)).toBe('REVIEW');
    expect(confidenceTier(0.7)).toBe('REVIEW');
    expect(confidenceTier(0.5)).toBe('REJECT');
  });
});

describe('tierAcceptable', () => {
  it('accepts only high and review', () => {
    expect(tierAcceptable('HIGH')).toBe(true);
    expect(tierAcceptable('REVIEW')).toBe(true);
    expect(tierAcceptable('REJECT')).toBe(false);
  });
});
