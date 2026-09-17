import { type ConfirmedDetection } from './ocr-types';
import {
  buildCandidate,
  candidateFingerprint,
  hasOpenCandidate,
  type ReviewCandidate,
} from './ocr-review';

function detection(
  overrides: Partial<ConfirmedDetection> = {},
): ConfirmedDetection {
  return {
    roiKey: 'zoneInfo',
    kind: 'ZONE_INFO',
    value: { zoneTimerSeconds: 229, stage: 1 },
    confidence: 0.96,
    tier: 'HIGH',
    rawText: '229',
    timestamp: 1,
    fingerprint: 'zoneInfo:ZONE_INFO:{"zoneTimerSeconds":229}',
    suggestedEvent: {
      kind: 'ZONE_TIMER',
      source: 'SYSTEM',
      confidence: 0.96,
      suggestedOnly: true,
      payload: { phase: 1, seconds: 229, ocr: true },
    },
    ...overrides,
  };
}

describe('ocr-review', () => {
  describe('candidateFingerprint', () => {
    it('is stable for the same kind + payload order', () => {
      expect(
        candidateFingerprint('ZONE_TIMER', { seconds: 229, phase: 1 }),
      ).toBe(candidateFingerprint('ZONE_TIMER', { phase: 1, seconds: 229 }));
    });

    it('differs across kind or value', () => {
      const base = candidateFingerprint('ZONE_TIMER', { seconds: 229 });
      expect(candidateFingerprint('ZONE_STARTED', { phase: 2 })).not.toBe(base);
      expect(candidateFingerprint('ZONE_TIMER', { seconds: 228 })).not.toBe(
        base,
      );
    });
  });

  describe('buildCandidate', () => {
    it('creates a PENDING ZONE_TIMER candidate from a suggested event', () => {
      const candidate = buildCandidate('match-1', detection());

      expect(candidate).not.toBeNull();

      expect(candidate!.id).toBeTruthy();
      expect(candidate!.matchId).toBe('match-1');
      expect(candidate!.kind).toBe('ZONE_TIMER');
      expect(candidate!.detectionKind).toBe('ZONE_INFO');
      expect(candidate!.status).toBe('PENDING');
      expect(candidate!.decidedAt).toBeNull();
      expect(candidate!.emittedEventId).toBeNull();
      expect(candidate!.payload).toEqual({ phase: 1, seconds: 229, ocr: true });
      expect(candidate!.reason).toBe('Zone timer 229s (phase 1)');
      expect(candidate!.fingerprint).toBe(
        candidateFingerprint('ZONE_TIMER', {
          phase: 1,
          seconds: 229,
          ocr: true,
        }),
      );
    });

    it('clamps fractional seconds to an integer', () => {
      const candidate = buildCandidate(
        'match-1',
        detection({
          suggestedEvent: {
            kind: 'ZONE_TIMER',
            source: 'SYSTEM',
            confidence: 0.9,
            suggestedOnly: true,
            payload: { phase: 1, seconds: 229.6 },
          },
        }),
      );

      expect(candidate!.payload.seconds).toBe(230);
    });

    it('returns null when no suggested event exists', () => {
      const candidate = buildCandidate(
        'match-1',
        detection({ suggestedEvent: undefined }),
      );

      expect(candidate).toBeNull();
    });

    it('returns null when the suggested kind is not wireable', () => {
      const candidate = buildCandidate(
        'match-1',
        detection({
          suggestedEvent: {
            kind: 'WINNER_DECLARED',
            source: 'SYSTEM',
            confidence: 0.9,
            suggestedOnly: true,
            payload: { teamId: 't1' },
          },
        }),
      );

      expect(candidate).toBeNull();
    });
  });

  describe('hasOpenCandidate', () => {
    it('blocks a duplicate identical pending candidate', () => {
      const first = buildCandidate('match-1', detection())!;
      const queue: ReviewCandidate[] = [first];

      expect(
        hasOpenCandidate(
          queue,
          candidateFingerprint('ZONE_TIMER', {
            phase: 1,
            seconds: 229,
            ocr: true,
          }),
        ),
      ).toBe(true);
    });

    it('still blocks when the same event was already approved', () => {
      const approved: ReviewCandidate = {
        ...buildCandidate('match-1', detection())!,
        status: 'APPROVED',
        decidedAt: 2,
        emittedEventId: 'evt-1',
      };

      expect(
        hasOpenCandidate(
          [approved],
          candidateFingerprint('ZONE_TIMER', {
            phase: 1,
            seconds: 229,
            ocr: true,
          }),
        ),
      ).toBe(true);
    });

    it('allows a new candidate once the previous one was rejected', () => {
      const rejected: ReviewCandidate = {
        ...buildCandidate('match-1', detection())!,
        status: 'REJECTED',
        decidedAt: 2,
      };

      expect(
        hasOpenCandidate(
          [rejected],
          candidateFingerprint('ZONE_TIMER', {
            phase: 1,
            seconds: 229,
            ocr: true,
          }),
        ),
      ).toBe(false);
    });

    it('allows a different value', () => {
      const queue = [buildCandidate('match-1', detection())!];

      expect(
        hasOpenCandidate(
          queue,
          candidateFingerprint('ZONE_TIMER', { phase: 1, seconds: 225 }),
        ),
      ).toBe(false);
    });
  });
});
