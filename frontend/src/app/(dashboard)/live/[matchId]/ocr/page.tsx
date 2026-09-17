"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { ArrowLeft, ScanLine, Square, Play, Wifi, WifiOff } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useLiveMatch } from "@/hooks/useLiveMatch";

import {
  getLiveMatch,
  getOcrMonitorLatest,
  getOcrMonitorStatus,
  getOcrOverlay,
  startOcrMonitor,
  stopOcrMonitor,
} from "@/services/liveMatches";

import {
  LiveMatch,
  OcrConfirmedDetection,
  OcrFrameAnalysis,
  OcrMonitorStatus,
  OcrOverlayPayload,
  OcrUncertainSignal,
} from "@/types/live-match";

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatValue(detection: OcrConfirmedDetection): string {
  const value = detection.value;

  switch (detection.kind) {
    case "MATCH_HEADER":
      return `${value.remainingPlayers ?? "—"} alive · ${
        value.observedTeamCount ?? "—"
      } teams`;
    case "TEAM_ELIMINATIONS":
      return `${value.teamEliminations} eliminations`;
    case "OBSERVER_PLAYER_LIST": {
      const lines = value.lines as
        | Array<{ raw: string; teamTag: string | null }>
        | undefined;

      return lines ? lines.map((line) => line.raw).join(", ") : "—";
    }
    case "ZONE_INFO":
      return `${typeof value.zoneTimerSeconds === "number"
        ? formatClock(value.zoneTimerSeconds)
        : "—"} · stage ${value.stage ?? "—"}`;
    case "CURRENT_TEAM":
      return `${value.currentTeamTag ?? value.currentTeamTagRaw ?? "—"} · ${
        value.observerTeamsValue ?? "—"
      } teams`;
    case "PLAYER_STATS":
      return `K ${value.eliminations ?? 0} · D ${value.damage ?? 0} · A ${
        value.assists ?? 0
      }`;
    default:
      return JSON.stringify(value);
  }
}

function tierColor(tier: string): string {
  switch (tier) {
    case "HIGH":
      return "#34d399";
    case "REVIEW":
      return "#fbbf24";
    case "REJECT":
      return "#f87171";
    default:
      return "#38bdf8";
  }
}

export default function OcrMonitorPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = use(params);

  const [match, setMatch] = useState<LiveMatch | null>(null);
  const [status, setStatus] = useState<OcrMonitorStatus | null>(null);
  const [overlay, setOverlay] = useState<OcrOverlayPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [intervalMs, setIntervalMs] = useState(1000);
  const [confirmations, setConfirmations] = useState(3);
  const [noise, setNoise] = useState(false);
  const [progress, setProgress] = useState(true);

  const [detectionsByRoi, setDetectionsByRoi] = useState<
    Record<string, OcrConfirmedDetection>
  >({});
  const [uncertain, setUncertain] = useState<OcrUncertainSignal[]>([]);
  const [lastFrame, setLastFrame] = useState<OcrFrameAnalysis | null>(null);

  const socket = useLiveMatch(matchId || undefined);

  const fetchMatch = useCallback(async () => {
    if (!matchId) {
      return;
    }

    try {
      const data = await getLiveMatch(matchId);
      setMatch(data.match);
    } catch (err) {
      console.error(err);
    }
  }, [matchId]);

  const fetchStatus = useCallback(async () => {
    if (!matchId) {
      return;
    }

    try {
      const data = await getOcrMonitorStatus(matchId);
      setStatus(data);
    } catch (err) {
      console.error(err);
    }
  }, [matchId]);

  const fetchOverlay = useCallback(async () => {
    if (!matchId) {
      return;
    }

    try {
      const data = await getOcrOverlay(matchId);
      setOverlay(data);
    } catch (err) {
      console.error(err);
    }
  }, [matchId]);

  const fetchLatest = useCallback(async () => {
    if (!matchId) {
      return;
    }

    try {
      const data = await getOcrMonitorLatest(matchId);
      setLastFrame(data.analysis);
    } catch (err) {
      console.error(err);
    }
  }, [matchId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMatch();
  }, [fetchMatch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStatus();
    fetchOverlay();
    fetchLatest();
  }, [fetchStatus, fetchOverlay, fetchLatest]);

  useEffect(() => {
    if (!socket.ocrAnalysis) {
      return;
    }

    const analysis = socket.ocrAnalysis;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLastFrame(analysis);
    setDetectionsByRoi((current) => {
      const next: Record<string, OcrConfirmedDetection> = { ...current };

      for (const detection of analysis.detections) {
        next[detection.roiKey] = detection;
      }

      return next;
    });
    setUncertain((current) => {
      const byKey = new Map(
        current.map((signal) => [
          `${signal.roiKey}:${signal.kind}:${signal.reason}`,
          signal,
        ]),
      );

      for (const signal of analysis.uncertain) {
        byKey.set(`${signal.roiKey}:${signal.kind}:${signal.reason}`, signal);
      }

      return Array.from(byKey.values());
    });
  }, [socket.ocrAnalysis]);

  const suggestedEvents = useMemo(() => {
    const seen = new Set<string>();
    const events: Array<{
      kind: string;
      confidence: number;
      payload: Record<string, unknown>;
      at: number;
    }> = [];

    for (const detection of Object.values(detectionsByRoi)) {
      const event = detection.suggestedEvent;

      if (!event) {
        continue;
      }

      const key = `${event.kind}:${JSON.stringify(event.payload)}`;

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      events.push({
        kind: event.kind,
        confidence: event.confidence,
        payload: event.payload,
        at: detection.timestamp,
      });
    }

    return events;
  }, [detectionsByRoi]);

  const handleStart = async () => {
    if (!matchId) {
      return;
    }

    setBusy(true);

    try {
      const data = await startOcrMonitor(matchId, {
        intervalMs,
        confirmations,
        noise,
        progress,
      });
      setStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const handleStop = async () => {
    if (!matchId) {
      return;
    }

    setBusy(true);

    try {
      const data = await stopOcrMonitor(matchId);
      setStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const running = status?.running ?? false;
  const resolution = overlay?.resolution;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/live/${matchId}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ArrowLeft className="size-4" />
            Control panel
          </Link>

          <div>
            <h1 className="text-xl font-bold">OCR Monitor</h1>
            <p className="text-sm text-muted-foreground">
              {match?.name ?? "Loading match…"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={running ? "default" : "outline"}>
            {running ? "Monitoring" : "Stopped"}
          </Badge>
          <Badge variant="secondary">
            {socket.connected ? (
              <span className="flex items-center gap-1">
                <Wifi className="size-3" />
                Live
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <WifiOff className="size-3" />
                Offline
              </span>
            )}
          </Badge>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Dry-run monitor
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" disabled={busy || running} onClick={handleStart}>
            <Play className="size-4" />
            Start
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busy || !running}
            onClick={handleStop}
          >
            <Square className="size-4" />
            Stop
          </Button>

          <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Interval
            <select
              className="h-8 rounded-md border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              value={intervalMs}
              onChange={(event) => setIntervalMs(Number(event.target.value))}
            >
              <option value={250}>250ms</option>
              <option value={500}>500ms</option>
              <option value={1000}>1s</option>
              <option value={2000}>2s</option>
              <option value={5000}>5s</option>
            </select>
          </label>

          <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Confirmations
            <input
              type="number"
              min={1}
              max={8}
              className="h-8 w-14 rounded-md border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              value={confirmations}
              onChange={(event) =>
                setConfirmations(Number(event.target.value))
              }
            />
          </label>

          <label className="flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="size-3.5"
              checked={progress}
              onChange={(event) => setProgress(event.target.checked)}
            />
            Simulate live scene
          </label>

          <label className="flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="size-3.5"
              checked={noise}
              onChange={(event) => setNoise(event.target.checked)}
            />
            OCR noise
          </label>
        </div>

        {status && (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Frames" value={String(status.frameCount)} />
            <Stat label="Readings" value={String(status.readings)} />
            <Stat label="Detections" value={String(status.detections)} />
            <Stat label="Review flags" value={String(status.uncertainSignals)} />
          </div>
        )}

        {status?.lastError && (
          <p className="mt-2 text-xs text-destructive">{status.lastError}</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                ROI layout ({resolution
                  ? `${resolution.width}×${resolution.height}`
                  : "…"})
              </label>
              <span className="text-[11px] text-muted-foreground">
                {overlay?.activeOcr ?? 0} OCR regions · kill feed & minimap off
              </span>
            </div>

            {overlay ? (
              <OverlayFrame
                overlay={overlay}
                detectionsByRoi={detectionsByRoi}
              />
            ) : (
              <div className="grid aspect-video w-full place-items-center rounded-lg border bg-muted/30 text-sm text-muted-foreground">
                Loading layout…
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-card p-4">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Last confirmed readouts (frame {lastFrame?.frame ?? "—"})
            </label>

            {Object.keys(detectionsByRoi).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Start the monitor to see confirmed detections.
              </p>
            ) : (
              <div className="space-y-1.5">
                {Object.entries(detectionsByRoi).map(([roiKey, detection]) => (
                  <div
                    key={roiKey}
                    className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {roiKey}
                      </p>
                      <p className="truncate text-sm font-semibold">
                        {formatValue(detection)}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        “{detection.rawText}”
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge
                        variant={
                          detection.tier === "HIGH"
                            ? "default"
                            : detection.tier === "REVIEW"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {detection.tier}
                      </Badge>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {Math.round(detection.confidence * 100)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border bg-card p-4">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Suggested events ({suggestedEvents.length})
            </label>

            {suggestedEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No read-only event suggestions yet.
              </p>
            ) : (
              <div className="space-y-1.5">
                {suggestedEvents.map((event) => (
                  <div
                    key={`${event.kind}:${JSON.stringify(event.payload)}`}
                    className="rounded-md border bg-muted/30 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">
                        <ScanLine className="mr-1 inline size-3.5" />
                        {event.kind}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {Math.round(event.confidence * 100)}% · suggested only
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {JSON.stringify(event.payload)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-card p-4">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Needs review ({uncertain.length})
            </label>

            {uncertain.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No uncertain signals. Apply OCR noise to force some.
              </p>
            ) : (
              <div className="space-y-1.5">
                {uncertain.map((signal, index) => (
                  <div
                    key={`${signal.roiKey}:${signal.kind}:${signal.reason}:${index}`}
                    className="rounded-md border border-amber-400/30 bg-amber-500/5 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">
                        {signal.roiKey}
                      </span>
                      <Badge variant="secondary">{signal.reason}</Badge>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {signal.kind}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/30 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

function OverlayFrame({
  overlay,
  detectionsByRoi,
}: {
  overlay: OcrOverlayPayload;
  detectionsByRoi: Record<string, OcrConfirmedDetection>;
}) {
  const { width, height } = overlay.resolution;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="aspect-video w-full rounded-lg border bg-slate-950"
      role="img"
      aria-label="ROI overlay preview"
    >
      <rect x={0} y={0} width={width} height={height} className="fill-slate-950" />
      <line
        x1={width / 2}
        y1={0}
        x2={width / 2}
        y2={height}
        className="stroke-slate-800"
        strokeWidth={1}
      />
      <line
        x1={0}
        y1={height / 2}
        x2={width}
        y2={height / 2}
        className="stroke-slate-800"
        strokeWidth={1}
      />

      {overlay.rois.map((roi) => {
        const detection = detectionsByRoi[roi.key];
        const tone = detection ? detection.tier : null;

        const stroke = roi.enabled && roi.ocr
          ? tone
            ? tierColor(tone)
            : "#38bdf8"
          : roi.enabled
            ? "#475569"
            : "#1e293b";
        const dash =
          roi.enabled && roi.ocr ? "" : "1 3";
        const dim =
          roi.enabled && roi.ocr ? 1 : 0.4;

        return (
          <g key={roi.key} opacity={dim}>
            <rect
              x={roi.crop.x}
              y={roi.crop.y}
              width={roi.crop.width}
              height={roi.crop.height}
              fill="none"
              stroke={stroke}
              strokeWidth={2}
              strokeDasharray={dash}
            />
            <text
              x={roi.crop.x + 6}
              y={roi.crop.y + 14}
              fill={stroke}
              fontSize={Math.max(12, Math.round(height * 0.016))}
              className="font-mono"
            >
              {roi.key}
            </text>
          </g>
        );
      })}
    </svg>
  );
}