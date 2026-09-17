import { type OcrDetection, type SuggestedEvent } from './ocr-types';

// Converts a confirmed OCR detection into a candidate match-engine event.
// Always read-only (suggestedOnly): nothing here mutates tournament state.
// Per spec, first OCR runs must not modify scores, so this exists to feed the
// review panel, and wiring to the scorer happens only after manual approval.

export function suggestEvent(detection: OcrDetection): SuggestedEvent | null {
  switch (detection.kind) {
    case 'ZONE_INFO': {
      const zoneTimerSeconds = detection.value.zoneTimerSeconds;
      const stage = detection.value.stage;

      if (typeof zoneTimerSeconds !== 'number') {
        return null;
      }

      return {
        kind: 'ZONE_TIMER',
        source: 'SYSTEM',
        confidence: detection.confidence,
        suggestedOnly: true,
        payload: {
          phase: typeof stage === 'number' ? stage : 1,
          seconds: zoneTimerSeconds,
          ocr: true,
        },
      };
    }

    default:
      // Team/player/stat detections require human validation before any
      // match event can be proposed (spec: kill feed etc. pending review).
      return null;
  }
}
