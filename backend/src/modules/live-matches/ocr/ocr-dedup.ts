import { valueToken } from './ocr-normalize';
import { type OcrDetection } from './ocr-types';

// Duplicate event protection (spec: same visual event on many frames = ONE event).

export function detectionFingerprint(
  roiKey: string,
  kind: string,
  value: Record<string, unknown>,
): string {
  return `${roiKey}:${kind}:${valueToken(value)}`;
}

export class DedupCache {
  private readonly seen = new Map<string, number>();

  constructor(private readonly windowMs: number = 1500) {}

  isDuplicate(fingerprint: string, now: number): boolean {
    this.prune(now);

    const lastSeen = this.seen.get(fingerprint);

    return lastSeen !== undefined && now - lastSeen < this.windowMs;
  }

  mark(fingerprint: string, now: number): void {
    this.prune(now);
    this.seen.set(fingerprint, now);
  }

  prune(now: number): void {
    for (const [fingerprint, timestamp] of this.seen) {
      if (now - timestamp >= this.windowMs) {
        this.seen.delete(fingerprint);
      }
    }
  }

  size(): number {
    return this.seen.size;
  }
}

export function fingerprintFor(detection: OcrDetection): string {
  return detectionFingerprint(
    detection.roiKey,
    detection.kind,
    detection.value,
  );
}
