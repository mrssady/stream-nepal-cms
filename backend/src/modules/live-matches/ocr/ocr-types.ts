import { type OcrResolution } from './ocr-config';

export type DetectionKind =
  | 'MATCH_HEADER'
  | 'TEAM_ELIMINATIONS'
  | 'OBSERVER_PLAYER_LIST'
  | 'ZONE_INFO'
  | 'CURRENT_TEAM'
  | 'PLAYER_STATS'
  | 'UNKNOWN';

export interface OcrFrame {
  width: number;
  height: number;
  source: string;
  data?: unknown;
}

export interface RoiReading {
  roiKey: string;
  text: string;
  confidence: number;
  timestamp: number;
  provider: string;
}

export type ConfidenceTier = 'HIGH' | 'REVIEW' | 'REJECT';

export interface OcrDetection {
  roiKey: string;
  kind: DetectionKind;
  value: Record<string, unknown>;
  confidence: number;
  tier: ConfidenceTier;
  rawText: string;
  timestamp: number;
}

export interface SuggestedEvent {
  kind: string;
  source: 'SYSTEM';
  confidence: number;
  payload: Record<string, unknown>;
  suggestedOnly: true;
}

export interface ConfirmedDetection extends OcrDetection {
  fingerprint: string;
  suggestedEvent?: SuggestedEvent;
}

export type UncertainReason =
  'ALTERNATING_READINGS' | 'AMBIGUOUS_TEAM' | 'REVIEW_CONFIDENCE';

export interface UncertainSignal {
  roiKey: string;
  kind: DetectionKind;
  reason: UncertainReason;
  candidates: Array<{ value: Record<string, unknown>; confidence: number }>;
  timestamp: number;
}

export interface FrameAnalysis {
  frame: number;
  detections: ConfirmedDetection[];
  uncertain: UncertainSignal[];
  readingsProcessed: number;
  at: number;
}

export interface AnalyzeResult {
  matchId: string;
  profileId: string;
  frameCount: number;
  readings: number;
  detections: ConfirmedDetection[];
  uncertain: UncertainSignal[];
  suggestedEvents: SuggestedEvent[];
}

export interface OcrProvider {
  readonly id: string;
  readonly label: string;
  readFrame(
    config: { rois: Record<string, { enabled: boolean; ocr: boolean }> },
    frame: OcrFrame,
    context: { teamTags?: string[] },
  ): Promise<RoiReading[]>;
}

export type { OcrResolution };
