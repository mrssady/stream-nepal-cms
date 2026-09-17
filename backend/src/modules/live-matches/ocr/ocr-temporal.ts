// Temporal validation (spec: never trust a single frame).
//
// Sliding-window rule over the last (confirmations * 2) values:
//  - CONFIRMED: the last `confirmations` values are identical.
//  - UNCERTAIN:  the window is full and a streak never formed (the value is
//    alternating, e.g. 8,9,8,9) -> send to manual review.
//  - PENDING:   not enough frames yet, or a recent change that is still
//    settling in. A stat that changes once and then stabilizes re-confirms
//    cleanly instead of being flagged.

export type TemporalVerdict = 'CONFIRMED' | 'UNCERTAIN' | 'PENDING';

export interface TemporalResult {
  verdict: TemporalVerdict;
  confirmations: number;
  framesSeen: number;
}

export class TemporalTracker {
  private readonly windows = new Map<string, { sequence: string[] }>();

  constructor(private readonly confirmations: number = 3) {}

  push(windowKey: string, token: string): TemporalResult {
    const limit = this.confirmations * 2;

    const entry = this.windows.get(windowKey) ?? { sequence: [] };

    entry.sequence.push(token);

    if (entry.sequence.length > limit) {
      entry.sequence = entry.sequence.slice(-limit);
    }

    this.windows.set(windowKey, entry);

    const recent = entry.sequence.slice(-this.confirmations);
    const allEqual =
      recent.length >= this.confirmations &&
      recent.every((value) => value === token);

    if (allEqual) {
      return {
        verdict: 'CONFIRMED',
        confirmations: recent.length,
        framesSeen: entry.sequence.length,
      };
    }

    if (entry.sequence.length >= limit) {
      return {
        verdict: 'UNCERTAIN',
        confirmations: recent.length,
        framesSeen: entry.sequence.length,
      };
    }

    return {
      verdict: 'PENDING',
      confirmations: recent.length,
      framesSeen: entry.sequence.length,
    };
  }
}
