import { confidenceTier, tierAcceptable } from './ocr-confidence';
import { type OcrProfileConfig } from './ocr-config';
import { DedupCache, fingerprintFor } from './ocr-dedup';
import { detectReading } from './ocr-detectors';
import { suggestEvent } from './ocr-event-normalizer';
import { valueToken } from './ocr-normalize';
import { TemporalTracker } from './ocr-temporal';
import {
  type ConfirmedDetection,
  type FrameAnalysis,
  type OcrFrame,
  type OcrProvider,
  type RoiReading,
  type UncertainReason,
  type UncertainSignal,
} from './ocr-types';

export interface EngineOptions {
  confirmations?: number;
  dedupWindowMs?: number;
}

export class OcrAnalysisEngine {
  private readonly temporal: TemporalTracker;
  private readonly dedup: DedupCache;
  private frameNumber = 0;

  constructor(options: EngineOptions = {}) {
    this.temporal = new TemporalTracker(options.confirmations ?? 3);
    this.dedup = new DedupCache(options.dedupWindowMs ?? 1500);
  }

  async processFrame(
    config: OcrProfileConfig,
    provider: OcrProvider,
    frame: OcrFrame,
    context: { teamTags?: string[] } = {},
  ): Promise<FrameAnalysis> {
    const readings = await provider.readFrame(config, frame, context);

    const detections: ConfirmedDetection[] = [];
    const uncertain: UncertainSignal[] = [];

    for (const reading of readings) {
      const signal = this.processReading(reading, context);

      if (signal.detection) {
        detections.push(signal.detection);
      }

      if (signal.uncertain) {
        uncertain.push(signal.uncertain);
      }
    }

    this.frameNumber += 1;

    return {
      frame: this.frameNumber,
      detections,
      uncertain,
      readingsProcessed: readings.length,
      at: Date.now(),
    };
  }

  private processReading(
    reading: RoiReading,
    context: { teamTags?: string[] },
  ): { detection?: ConfirmedDetection; uncertain?: UncertainSignal } {
    const parsed = detectReading(reading, {
      knownTeamTags: context.teamTags,
    });

    if (!parsed) {
      return {};
    }

    const tier = confidenceTier(parsed.confidence);

    if (!tierAcceptable(tier)) {
      return {};
    }

    const fingerprint = fingerprintFor(parsed);
    const windowKey = `${parsed.roiKey}:${parsed.kind}`;
    const token = valueToken(parsed.value);

    const temporal = this.temporal.push(windowKey, token);

    // Alternate between two team tags / values -> manual review now.
    if (context.teamTags && context.teamTags.length > 0) {
      const ambiguous = parsed.value.currentTeamAmbiguous;

      if (Array.isArray(ambiguous) && ambiguous.length > 0) {
        return {
          uncertain: this.buildSignal(reading, parsed, 'AMBIGUOUS_TEAM'),
        };
      }
    }

    if (temporal.verdict === 'CONFIRMED') {
      if (this.dedup.isDuplicate(fingerprint, parsed.timestamp)) {
        return {};
      }

      this.dedup.mark(fingerprint, parsed.timestamp);

      const detection: ConfirmedDetection = {
        ...parsed,
        fingerprint,
        suggestedEvent: suggestEvent(parsed) ?? undefined,
      };

      if (tier === 'REVIEW') {
        return {
          detection,
          uncertain: this.buildSignal(reading, parsed, 'REVIEW_CONFIDENCE'),
        };
      }

      return { detection };
    }

    if (temporal.verdict === 'UNCERTAIN') {
      return {
        uncertain: this.buildSignal(reading, parsed, 'ALTERNATING_READINGS'),
      };
    }

    return {};
  }

  private buildSignal(
    reading: RoiReading,
    parsed: { roiKey: string; kind: string },
    reason: UncertainReason,
  ): UncertainSignal {
    return {
      roiKey: reading.roiKey,
      kind: parsed.kind as UncertainSignal['kind'],
      reason,
      candidates: [],
      timestamp: reading.timestamp,
    };
  }
}
