"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  Copy,
  Crosshair,
  Flag,
  Lock,
  Minus,
  Pause,
  Play,
  Plus,
  ScanLine,
  Skull,
  Square,
  Timer,
  Trophy,
  Undo2,
  Unlock,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useLiveMatch } from "@/hooks/useLiveMatch";

import {
  appendMatchEvent,
  getLiveMatch,
  getZoneOcrStatus,
  lockLiveMatch,
  readyLiveMatch,
  reopenLiveMatch,
  startZoneOcr,
  stopZoneOcr,
  undoLiveMatchEvent,
} from "@/services/liveMatches";

import {
  LiveMatch,
  LiveMatchStatus,
  MatchState,
  ZoneOcrStatus,
} from "@/types/live-match";

type Snapshot = {
  match: LiveMatch;
  state: MatchState;
};

function formatTime(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

const statusVariant: Record<
  LiveMatchStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  SCHEDULED: "secondary",
  READY: "outline",
  LIVE: "default",
  PAUSED: "secondary",
  FINISHED: "outline",
  CANCELLED: "destructive",
};

export default function LiveControlPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = use(params);

  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);

  const [killerId, setKillerId] = useState("");
  const [victimId, setVictimId] = useState("");
  const [correction, setCorrection] = useState({
    teamId: "",
    amount: "1",
  });
  const [zoneSeconds, setZoneSeconds] = useState("60");
  const [ocr, setOcr] = useState<ZoneOcrStatus | null>(null);
  const [ocrBusy, setOcrBusy] = useState(false);

  const socket = useLiveMatch(matchId || undefined);

  const match = snapshot?.match ?? null;
  const state = socket.state ?? snapshot?.state ?? null;

  const fetchSnapshot = useCallback(async () => {
    if (!matchId) {
      return;
    }

    try {
      const data = await getLiveMatch(matchId);
      setSnapshot(data);
      setStatusMessage(null);
    } catch (err) {
      console.error(err);
    }
  }, [matchId]);

  useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  const fetchOcrStatus = useCallback(async () => {
    if (!matchId) {
      return;
    }

    try {
      const status = await getZoneOcrStatus(matchId);
      setOcr(status);
    } catch (err) {
      console.error(err);
    }
  }, [matchId]);

  useEffect(() => {
    fetchOcrStatus();
  }, [fetchOcrStatus]);

  useEffect(() => {
    if (!ocr?.running) {
      return;
    }

    const timer = setInterval(() => {
      void fetchOcrStatus();
    }, 3000);

    return () => clearInterval(timer);
  }, [ocr?.running, fetchOcrStatus]);

  function report(value: {
    kind: "ok" | "err";
    text: string;
  }) {
    setStatusMessage(value);
  }

  async function applyEvent(kind: string, payload?: Record<string, unknown>) {
    if (!matchId) {
      return;
    }

    try {
      const result = await appendMatchEvent(matchId, { kind, payload });
      setSnapshot((current) =>
        current
          ? { ...current, state: result.state }
          : current,
      );
      report({ kind: "ok", text: `${kind} applied` });
    } catch (err) {
      report({
        kind: "err",
        text: errorMessage(err),
      });
    }
  }

  function errorMessage(err: unknown): string {
    const message =
      (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
    if (typeof message === "string") {
      return message;
    }
    return "Request failed";
  }

  async function handleReady() {
    if (!matchId) {
      return;
    }

    try {
      const result = await readyLiveMatch(matchId);
      setSnapshot((current) =>
        current ? { ...current, state: result.state } : current,
      );
      report({ kind: "ok", text: "Roster loaded from approved registrations" });
    } catch (err) {
      report({ kind: "err", text: errorMessage(err) });
    }
  }

  async function handleUndoLast() {
    if (!matchId || !state) {
      return;
    }

    const last = state.events[state.events.length - 1];

    if (!last) {
      report({ kind: "err", text: "No events to undo" });
      return;
    }

    try {
      if (last.kind === "UNDO") {
        report({ kind: "err", text: "Last event is already an undo" });
        return;
      }

      const result = await undoLiveMatchEvent(matchId, { eventId: last.id });

      if (result?.state) {
        setSnapshot((current) =>
          current ? { ...current, state: result.state } : current,
        );
      }
      report({ kind: "ok", text: `Undid ${last.kind}` });
    } catch (err) {
      report({ kind: "err", text: errorMessage(err) });
    }
  }

  async function handleLock() {
    if (!matchId) {
      return;
    }

    try {
      const result = await lockLiveMatch(matchId);
      setSnapshot((current) =>
        current ? { ...current, state: result.state } : current,
      );
      report({ kind: "ok", text: "Match locked" });
    } catch (err) {
      report({ kind: "err", text: errorMessage(err) });
    }
  }

  async function handleReopen() {
    if (!matchId) {
      return;
    }

    try {
      const result = await reopenLiveMatch(matchId);
      setSnapshot((current) =>
        current ? { ...current, state: result.state } : current,
      );
      report({ kind: "ok", text: "Match reopened for corrections" });
    } catch (err) {
      report({ kind: "err", text: errorMessage(err) });
    }
  }

  async function handleKill() {
    if (!killerId || !victimId) {
      report({ kind: "err", text: "Select killer and victim" });
      return;
    }

    if (killerId === victimId) {
      report({ kind: "err", text: "Killer and victim must be different" });
      return;
    }

    await applyEvent("PLAYER_KILLED", {
      killerId,
      victimId,
    });

    setKillerId("");
    setVictimId("");
  }

  function currentZonePhase(): number {
    return state?.zone?.phase ?? 0;
  }

  function zoneTimerTargetPhase(): number {
    return Math.min(currentZonePhase() + 1, state?.zoneCount ?? 8);
  }

  async function handleZonePhase(phase: number) {
    await applyEvent("ZONE_STARTED", { phase });
  }

  async function handleZoneNext() {
    await handleZonePhase(zoneTimerTargetPhase());
  }

  async function handleZoneTimer(seconds: number) {
    if (!Number.isInteger(seconds) || seconds < 1 || seconds > 600) {
      report({ kind: "err", text: "Zone timer must be 1–600 seconds" });
      return;
    }

    await applyEvent("ZONE_TIMER", {
      phase: zoneTimerTargetPhase(),
      seconds,
    });
  }

  function gfxUrl(path: string): string {
    return `${window.location.origin}/live/overlay/gfx/${matchId}${path}`;
  }

  async function copyGfxUrl(path: string) {
    try {
      await navigator.clipboard.writeText(gfxUrl(path));
      report({ kind: "ok", text: "Overlay URL copied to clipboard" });
    } catch (err) {
      console.error(err);
      report({ kind: "err", text: "Could not copy URL" });
    }
  }

  async function handleOcrStart() {
    if (!matchId) {
      return;
    }

    setOcrBusy(true);

    try {
      const status = await startZoneOcr(matchId, {
        mode: "MOCK",
        intervalMs: 1000,
        seconds: 180,
        noise: true,
      });
      setOcr(status);
      report({ kind: "ok", text: "Mock zone OCR started (dry-run)" });
    } catch (err) {
      report({ kind: "err", text: errorMessage(err) });
    } finally {
      setOcrBusy(false);
    }
  }

  async function handleOcrStop() {
    if (!matchId) {
      return;
    }

    setOcrBusy(true);

    try {
      const status = await stopZoneOcr(matchId);
      setOcr(status);
      report({ kind: "ok", text: "Zone OCR stopped" });
    } catch (err) {
      report({ kind: "err", text: errorMessage(err) });
    } finally {
      setOcrBusy(false);
    }
  }

  if (!match || !state) {
    return (
      <div className="flex items-center justify-center rounded-xl border p-16 text-sm text-muted-foreground">
        Loading live match...
      </div>
    );
  }

  const players = Object.values(state.players);
  const alivePlayers = players.filter((player) => player.alive);
  const participantCount = Object.keys(state.teams).length;

  const isLive = state.status === "LIVE" && !state.locked;
  const controlsEnabled = !state.locked && state.status !== "CANCELLED";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">
              {match.name}
            </h1>
            <Badge variant={statusVariant[state.status]}>
              {state.status}
            </Badge>

            {state.locked && (
              <Badge variant="secondary">Locked</Badge>
            )}

            {socket.connected ? (
              <Wifi className="size-4 text-emerald-500" />
            ) : (
              <WifiOff className="size-4 text-muted-foreground" />
            )}
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Match #{match.matchNumber}
            {match.round ? ` · ${match.round}` : ""} · Started{" "}
            {formatTime(state.startedAt)} · Connected:{" "}
            {socket.connected ? "live" : "offline"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {state.status === "SCHEDULED" && (
            <Button onClick={handleReady}>
              <Trophy className="size-4" />
              Load Roster
            </Button>
          )}

          {controlsEnabled && state.status === "READY" && (
            <Button
              onClick={() => applyEvent("MATCH_STARTED")}
            >
              <Play className="size-4" />
              Start
            </Button>
          )}

          {isLive && (
            <Button
              variant="secondary"
              onClick={() => applyEvent("MATCH_PAUSED")}
            >
              <Pause className="size-4" />
              Pause
            </Button>
          )}

          {state.status === "PAUSED" &&
            !state.locked && (
              <Button
                variant="secondary"
                onClick={() => applyEvent("MATCH_RESUMED")}
              >
                <Play className="size-4" />
                Resume
              </Button>
            )}

          {controlsEnabled && isLive && (
            <Button
              variant="default"
              onClick={() => applyEvent("MATCH_FINISHED")}
            >
              <Flag className="size-4" />
              Finish
            </Button>
          )}

          {controlsEnabled && isLive && (
            <Button
              variant="destructive"
              onClick={() => applyEvent("MATCH_CANCELLED")}
            >
              <Skull className="size-4" />
              Cancel
            </Button>
          )}

          {!state.locked && isLive && (
            <Button
              variant="outline"
              onClick={handleLock}
            >
              <Lock className="size-4" />
              Lock
            </Button>
          )}

          {state.locked && (
            <Button variant="outline" onClick={handleReopen}>
              <Unlock className="size-4" />
              Reopen
            </Button>
          )}

          <Button variant="ghost" onClick={handleUndoLast}>
            <Undo2 className="size-4" />
            Undo Last
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            statusMessage.kind === "ok"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Section title="Scoreboard">
            <ScoreboardTable
              scoreboard={state.scoreboard}
              participantCount={participantCount}
              disabled={!controlsEnabled}
              onPlacement={(teamId, placement) =>
                applyEvent("PLACEMENT_SET", { teamId, placement })
              }
              onEliminate={(teamId) =>
                applyEvent("TEAM_ELIMINATED", { teamId })
              }
              onWin={(teamId) =>
                applyEvent("WINNER_DECLARED", { teamId })
              }
            />
          </Section>

          <Section title="Kill Input (manual)">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Killer
                </label>
                <select
                  className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                  value={killerId}
                  disabled={!controlsEnabled}
                  onChange={(event) =>
                    setKillerId(event.target.value)
                  }
                >
                  <option value="">Select killer...</option>
                  {alivePlayers.map((player) => (
                    <option key={player.playerId} value={player.playerId}>
                      {player.inGameName} ({teamName(state, player.teamId)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Victim
                </label>
                <select
                  className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                  value={victimId}
                  disabled={!controlsEnabled}
                  onChange={(event) =>
                    setVictimId(event.target.value)
                  }
                >
                  <option value="">Select victim...</option>
                  {alivePlayers
                    .filter((player) => player.playerId !== killerId)
                    .map((player) => (
                      <option key={player.playerId} value={player.playerId}>
                        {player.inGameName} ({teamName(state, player.teamId)})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-end pt-1">
                <Button
                  className="w-full"
                  disabled={!controlsEnabled}
                  onClick={handleKill}
                >
                  <Crosshair className="size-4" />
                  Record Kill
                </Button>
              </div>

              <div className="flex items-end pt-1">
                <p className="text-xs text-muted-foreground">
                  Kills are scored automatically using the tournament rule.
                </p>
              </div>
            </div>
          </Section>

          <Section title="Kill correction">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Team
                </label>
                <select
                  className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                  value={correction.teamId}
                  disabled={!controlsEnabled}
                  onChange={(event) =>
                    setCorrection({
                      ...correction,
                      teamId: event.target.value,
                    })
                  }
                >
                  <option value="">Select team...</option>
                  {state.scoreboard.map((team) => (
                    <option key={team.teamId} value={team.teamId}>
                      {team.teamName || team.shortName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Kill delta
                </label>
                <input
                  type="number"
                  className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                  value={correction.amount}
                  disabled={!controlsEnabled}
                  onChange={(event) =>
                    setCorrection({
                      ...correction,
                      amount: event.target.value,
                    })
                  }
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  className="flex-1"
                  disabled={!controlsEnabled}
                  onClick={() =>
                    handleCorrectionWithSign(1)
                  }
                >
                  <Plus className="size-4" />
                  Add
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  disabled={!controlsEnabled}
                  onClick={() =>
                    handleCorrectionWithSign(-1)
                  }
                >
                  <Minus className="size-4" />
                  Sub
                </Button>
              </div>
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Zone / Broadcast GFX">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black tabular-nums">
                    {state.zone.phase ?? "—"}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    / {state.zoneCount} zones
                  </span>

                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={!controlsEnabled}
                    onClick={handleZoneNext}
                  >
                    Next zone
                  </Button>
                </div>

                {state.zone.timerSeconds !== null &&
                  state.zone.timerSeconds > 0 && (
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-destructive">
                      <Timer className="size-4" />
                      Next zone in {formatClock(state.zone.timerSeconds)}
                    </span>
                  )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Current zone
                </label>
                <div className="grid grid-cols-8 gap-1.5">
                  {Array.from(
                    { length: state.zoneCount },
                    (_, i) => i + 1,
                  ).map((phase) => (
                    <Button
                      key={phase}
                      size="sm"
                      variant={
                        phase === state.zone.phase
                          ? "default"
                          : "outline"
                      }
                      disabled={
                        !controlsEnabled ||
                        phase === state.zone.phase
                      }
                      onClick={() => handleZonePhase(phase)}
                    >
                      {phase}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Zone timer (countdown shown by OCR / broadcast)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[60, 90, 120, 180, 300].map((seconds) => (
                    <Button
                      key={seconds}
                      size="sm"
                      variant="outline"
                      disabled={!controlsEnabled}
                      onClick={() => handleZoneTimer(seconds)}
                    >
                      {formatClock(seconds)}
                    </Button>
                  ))}

                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={600}
                      className="h-8 w-16 rounded-md border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                      value={zoneSeconds}
                      disabled={!controlsEnabled}
                      onChange={(event) =>
                        setZoneSeconds(event.target.value)
                      }
                    />
                    <Button
                      size="sm"
                      disabled={!controlsEnabled}
                      onClick={() =>
                        handleZoneTimer(Number(zoneSeconds))
                      }
                    >
                      <Zap className="size-4" />
                      Set
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Zone timer OCR (auto)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={ocr?.running ? "default" : "secondary"}>
                    {ocr?.running ? "OCR running" : "OCR idle"}
                  </Badge>

                  {ocr?.mode && (
                    <Badge variant="outline">{ocr.mode}</Badge>
                  )}

                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={
                      ocrBusy || !controlsEnabled || Boolean(ocr?.running)
                    }
                    onClick={handleOcrStart}
                  >
                    <ScanLine className="size-4" />
                    Start mock OCR
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={ocrBusy || !ocr?.running}
                    onClick={handleOcrStop}
                  >
                    <Square className="size-4" />
                    Stop
                  </Button>

                  <Link
                    href="/live/ocr-profiles"
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}
                  >
                    <ScanLine className="size-4" />
                    Profiles
                  </Link>
                </div>

                {ocr && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    phase {ocr.phase ?? "—"}/{ocr.zoneCount ?? "—"} ·
                    reading {ocr.lastRaw ?? "—"} · {ocr.readings} reads,{" "}
                    {ocr.emissions} events · confidence{" "}
                    {ocr.lastConfidence !== null
                      ? `${Math.round(ocr.lastConfidence * 100)}%`
                      : "—"}
                  </p>
                )}

                {ocr?.lastError && (
                  <p className="mt-1 text-[11px] text-destructive">
                    {ocr.lastError}
                  </p>
                )}

                <p className="mt-1 text-[11px] text-muted-foreground">
                  Video OCR (real footage) is not calibrated yet. Mock mode
                  simulates a live HUD countdown to exercise the pipeline.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  OBS overlays (copy URL)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      ["Eliminated", "elimination"],
                      ["Winner", "winner"],
                      ["Kill feed", "killfeed"],
                      ["Zone", "zone"],
                      ["Preview", "/preview"],
                    ] as const
                  ).map(([label, path]) => (
                    <Button
                      key={path}
                      size="sm"
                      variant="secondary"
                      onClick={() => copyGfxUrl(path)}
                    >
                      <Copy className="size-3.5" />
                      {label}
                    </Button>
                  ))}
                </div>

                <p className="mt-2 truncate rounded-md bg-muted/40 px-2 py-1.5 text-[11px] text-muted-foreground">
                  {gfxUrl("elimination")}
                </p>
              </div>
            </div>
          </Section>

          <Section title="Kill Feed">
            {state.killFeed.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No kills yet
              </p>
            ) : (
              <ul className="space-y-2">
                {[...state.killFeed]
                  .reverse()
                  .slice(0, 20)
                  .map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-foreground">
                        {entry.killerInGameName ?? "Zone"}
                      </span>
                      <span className="text-muted-foreground">►</span>
                      <span className="text-muted-foreground">
                        {entry.victimInGameName ?? "??"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(entry.timestamp)}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </Section>

          <Section title="Event Log">
            {state.events.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No events yet
              </p>
            ) : (
              <ul className="max-h-[420px] space-y-1.5 overflow-y-auto">
                {[...state.events]
                  .reverse()
                  .slice(0, 40)
                  .map((event) => (
                    <li
                      key={event.id}
                      className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs"
                    >
                      <span className="font-medium text-muted-foreground">
                        #{event.seq}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-foreground">
                        {event.kind}
                      </span>
                      <span
                        className={
                          event.source === "SYSTEM"
                            ? "text-sky-500"
                            : "text-muted-foreground"
                        }
                      >
                        {event.source}
                      </span>
                      <span className="text-muted-foreground">
                        {formatTime(event.timestamp)}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </Section>
        </div>
      </div>
    </div>
  );

  async function handleCorrectionWithSign(sign: number) {
    if (!correction.teamId) {
      report({ kind: "err", text: "Select a team to correct" });
      return;
    }

    const amount = Number(correction.amount || 0);

    if (isNaN(amount) || amount === 0) {
      report({ kind: "err", text: "Amount must be non-zero" });
      return;
    }

    await applyEvent("MANUAL_CORRECTION", {
      targetTeamId: correction.teamId,
      kind: "KILL_ADJUST",
      amount: sign * amount,
    });

    setCorrection({ teamId: "", amount: "1" });
  }
}

function teamName(state: MatchState, teamId: string): string {
  return state.teams[teamId]?.shortName || "?";
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border">
      <div className="border-b px-5 py-3.5">
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ScoreboardTable({
  scoreboard,
  participantCount,
  disabled,
  onPlacement,
  onEliminate,
  onWin,
}: {
  scoreboard: import("@/types/live-match").TeamStanding[];
  participantCount: number;
  disabled: boolean;
  onPlacement: (teamId: string, placement: number) => void;
  onEliminate: (teamId: string) => void;
  onWin: (teamId: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40">
          <tr>
            <th className="px-4 py-3 text-left font-medium">#</th>
            <th className="px-4 py-3 text-left font-medium">Team</th>
            <th className="px-4 py-3 text-center font-medium">Kills</th>
            <th className="px-4 py-3 text-center font-medium">Place</th>
            <th className="px-4 py-3 text-right font-medium">Points</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {scoreboard.map((team, index) => (
            <tr
              key={team.teamId}
              className={team.isWinner ? "bg-amber-500/5" : ""}
            >
              <td className="px-4 py-3 text-muted-foreground">
                {index + 1}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">
                    {team.shortName}
                  </span>
                  <div>
                    <p className="font-medium">
                      {team.teamName || team.shortName}
                      {team.isWinner && (
                        <span className="ml-1.5 text-amber-500">●</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {team.alivePlayers} alive
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-center tabular-nums">
                {team.killPoints}
              </td>
              <td className="px-4 py-3 text-center tabular-nums">
                {team.placement ?? "—"}
              </td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums">
                {team.matchPoints}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1.5">
                  <select
                    className="h-9 rounded-md border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                    value={team.placement ?? ""}
                    disabled={disabled || team.isWinner}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      if (value > 0) {
                        onPlacement(team.teamId, value);
                      }
                    }}
                  >
                    <option value="">None</option>
                    {Array.from(
                      { length: participantCount },
                      (_, i) => i + 1,
                    ).map((placement) => (
                      <option key={placement} value={placement}>
                        {placement}
                      </option>
                    ))}
                  </select>

                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={disabled}
                    onClick={() => onEliminate(team.teamId)}
                    title="Eliminate team"
                  >
                    <Skull className="size-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={disabled}
                    onClick={() => onWin(team.teamId)}
                    title="Declare winner"
                  >
                    <Trophy className="size-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}