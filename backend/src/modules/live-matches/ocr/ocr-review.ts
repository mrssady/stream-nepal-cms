import { randomUUID } from 'node:crypto';

import { type ConfirmedDetection, type DetectionKind } from './ocr-types';
import { valueToken } from './ocr-normalize';

// Manual review pipeline (spec 20/21/30): confirmed detections that can be
// proposed as real match events become PENDING candidates the operator must
// approve or reject. Wiring to the scorer happens only on explicit approval
// and only for event kinds that are safe today (ZONE_TIMER / ZONE_STARTED).
// Everything here is pure/in-memory: no persistence, no match mutation.

export type ReviewCandidateStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ReviewCandidate {
  id: string;
  matchId: string;
  roiKey: string;
  detectionKind: DetectionKind;
  kind: string;
  payload: Record<string, unknown>;
  confidence: number;
  rawText: string;
  reason: string;
  status: ReviewCandidateStatus;
  createdAt: number;
  decidedAt: number | null;
  emittedEventId: string | null;
  fingerprint: string;
}

export const WIREABLE_KINDS = new Set<string>(['ZONE_TIMER', 'ZONE_STARTED']);

const MAX_KIND_LABEL = 28;

export function candidateFingerprint(
  kind: string,
  payload: Record<string, unknown>,
): string {
  return `${kind}:${valueToken(payload)}`;
}

export function buildCandidate(
  matchId: string,
  detection: ConfirmedDetection,
): ReviewCandidate | null {
  const event = detection.suggestedEvent;

  if (!event || !WIREABLE_KINDS.has(event.kind)) {
    return null;
  }

  const payload: Record<string, unknown> = { ...event.payload };

  if (typeof payload.seconds === 'number') {
    payload.seconds = Math.max(0, Math.round(payload.seconds));
  }

  const seconds = payload.seconds;
  const rawPhase = event.payload.phase;
  const phaseLabel =
    typeof rawPhase === 'number' || typeof rawPhase === 'string'
      ? String(rawPhase)
      : '?';

  const reason =
    event.kind === 'ZONE_STARTED'
      ? `Zone ${phaseLabel} started`
      : `Zone timer ${typeof seconds === 'number' ? `${seconds}s` : '?'} (phase ${phaseLabel})`;

  return {
    id: randomUUID(),
    matchId,
    roiKey: detection.roiKey,
    detectionKind: detection.kind,
    kind: event.kind,
    payload,
    confidence: event.confidence,
    rawText: detection.rawText.slice(0, MAX_KIND_LABEL),
    reason,
    status: 'PENDING',
    createdAt: Date.now(),
    decidedAt: null,
    emittedEventId: null,
    fingerprint: candidateFingerprint(event.kind, payload),
  };
}

// True when the same visual event is already open (PENDING) or already wired
// (APPROVED). Prevents the monitor's re-confirmations from piling up dupes.
export function hasOpenCandidate(
  candidates: ReviewCandidate[],
  fingerprint: string,
): boolean {
  return candidates.some(
    (candidate) =>
      candidate.fingerprint === fingerprint && candidate.status !== 'REJECTED',
  );
}
