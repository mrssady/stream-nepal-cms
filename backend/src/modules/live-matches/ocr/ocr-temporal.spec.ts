import { TemporalTracker } from './ocr-temporal';

describe('TemporalTracker', () => {
  it('confirms after N consecutive identical tokens', () => {
    const tracker = new TemporalTracker(3);

    expect(tracker.push('ct', '777A').verdict).toBe('PENDING');
    expect(tracker.push('ct', '777A').verdict).toBe('PENDING');
    expect(tracker.push('ct', '777A').verdict).toBe('CONFIRMED');
  });

  it('marks alternating values UNCERTAIN after enough frames', () => {
    const tracker = new TemporalTracker(3);

    // 8,9,8,9,... never gets 3 consecutive -> UNCERTAIN at frame 6.
    const values = ['8', '9', '8', '9', '8', '9'];
    const verdicts = values.map((value) => tracker.push('stat', value).verdict);

    expect(verdicts.slice(0, 5)).not.toContain('UNCERTAIN');
    expect(verdicts[5]).toBe('UNCERTAIN');
  });

  it('stays PENDING on a recent change before confirmation window', () => {
    const tracker = new TemporalTracker(3);

    expect(tracker.push('stat', '0').verdict).toBe('PENDING');
    expect(tracker.push('stat', '1').verdict).toBe('PENDING');
    expect(tracker.push('stat', '1').verdict).toBe('PENDING');
    expect(tracker.push('stat', '1').verdict).toBe('CONFIRMED');
  });

  it('tracks independent windows separately', () => {
    const tracker = new TemporalTracker(3);

    tracker.push('a', '1');
    tracker.push('b', 'X');

    expect(tracker.push('b', 'X').verdict).toBe('PENDING');
    expect(tracker.push('b', 'X').verdict).toBe('CONFIRMED');
  });

  it('flags a one-time change for review, then re-confirms the new value', () => {
    const tracker = new TemporalTracker(3);

    for (let i = 0; i < 10; i++) {
      tracker.push('stat', '0');
    }

    // A stat change trips the review signal (spec: old 0 -> new 1 must be
    // validated), then the new stable value re-confirms cleanly.
    expect(tracker.push('stat', '1').verdict).toBe('UNCERTAIN');
    expect(tracker.push('stat', '1').verdict).toBe('UNCERTAIN');
    expect(tracker.push('stat', '1').verdict).toBe('CONFIRMED');
  });
});
