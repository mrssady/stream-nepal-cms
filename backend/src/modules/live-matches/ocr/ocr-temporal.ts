// Temporal validation (spec: never trust a single frame).

export type TemporalVerdict = 'CONFIRMED' | 'UNCERTAIN' | 'PENDING';

export interface TemporalResult {
  verdict: TemporalVerdict;
  confirmations: number;
  framesSeen: number;
}

export class TemporalTracker {
  private readonly windows = new Map<
    string,
    { sequence: string[]; seen: number }
  >();

  constructor(private readonly confirmations: number = 3) {}

  push(windowKey: string, token: string): TemporalResult {
    const entry = this.windows.get(windowKey) ?? {
      sequence: [],
      seen: 0,
    };

    entry.seen += 1;
    entry.sequence.push(token);

    if (entry.sequence.length > this.confirmations) {
      entry.sequence = entry.sequence.slice(-this.confirmations);
    }

    this.windows.set(windowKey, entry);

    const allEqual =
      entry.sequence.length >= this.confirmations &&
      entry.sequence.every((value) => value === token);

    if (allEqual) {
      return {
        verdict: 'CONFIRMED',
        confirmations: entry.sequence.length,
        framesSeen: entry.seen,
      };
    }

    // Values keep alternating / mixed (8,9,8,9) -> manual review.
    if (entry.seen >= this.confirmations * 2) {
      return {
        verdict: 'UNCERTAIN',
        confirmations: entry.sequence.length,
        framesSeen: entry.seen,
      };
    }

    return {
      verdict: 'PENDING',
      confirmations: entry.sequence.length,
      framesSeen: entry.seen,
    };
  }
}
