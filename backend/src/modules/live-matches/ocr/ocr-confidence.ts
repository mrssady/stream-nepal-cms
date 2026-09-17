import { type ConfidenceTier } from './ocr-types';

// Initial confidence thresholds (spec): tune with real footage.
export const HIGH_CONFIDENCE = 0.9;
export const REVIEW_CONFIDENCE = 0.7;

export function confidenceTier(confidence: number): ConfidenceTier {
  if (confidence >= HIGH_CONFIDENCE) {
    return 'HIGH';
  }

  if (confidence >= REVIEW_CONFIDENCE) {
    return 'REVIEW';
  }

  return 'REJECT';
}

export function tierAcceptable(tier: ConfidenceTier): boolean {
  return tier !== 'REJECT';
}

export function clampConfidence(value: number): number {
  return Math.max(0, Math.min(1, value));
}
