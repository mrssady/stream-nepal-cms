"use client";

import { use, useEffect, useState } from "react";

import { useLiveMatch } from "@/hooks/useLiveMatch";
import { getLiveMatchSnapshot } from "@/services/liveMatches";

import {
  MatchState,
  SnapshotPayload,
} from "@/types/live-match";

const PLACEMENT_SUFFIX: Record<number, string> = {
  1: "st",
  2: "nd",
  3: "rd",
};

function placementLabel(placement: number | null): string {
  if (!placement) {
    return "—";
  }

  const suffix =
    PLACEMENT_SUFFIX[placement] ??
    (placement % 100 >= 11 && placement % 100 <= 13
      ? "th"
      : ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"][
          placement % 10
        ]);

  return `${placement}${suffix}`;
}

type OverlayProps = {
  params: Promise<{ matchId: string }>;
};

export default function LiveOverlayPage({ params }: OverlayProps) {
  const { matchId } = use(params);

  const [snapshot, setSnapshot] = useState<SnapshotPayload | null>(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (!matchId) {
      return;
    }

    getLiveMatchSnapshot(matchId)
      .then(setSnapshot)
      .catch((err) => {
        console.error(err);
        setErrored(true);
      });
  }, [matchId]);

  const socket = useLiveMatch(matchId || undefined);

  const liveState: MatchState | null =
    socket.state ?? snapshot?.state ?? null;
  const match = snapshot?.match ?? null;
  const rule = snapshot?.rule ?? null;

  if (errored) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black font-sans text-white">
        <p className="text-slate-400">Match overlay unavailable</p>
      </div>
    );
  }

  if (!match || !liveState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black font-sans text-white">
        <div className="text-center">
          <p className="animate-pulse text-2xl font-bold uppercase tracking-widest text-slate-300">
            Waiting for match...
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-600">
            {match?.name ?? "Official"} ·{" "}
            {match &&
              `Match #${match.matchNumber}`}
          </p>
        </div>
      </div>
    );
  }

  const topThree = liveState.scoreboard.slice(0, 3);
  const isLive = liveState.status === "LIVE";

  return (
    <div
      className="flex min-h-screen flex-col justify-end bg-transparent p-12 font-sans"
      style={{
        fontFamily:
          "Rajdhani, 'Arial Narrow', 'Segoe UI', sans-serif",
      }}
    >
      <div className="pointer-events-none fixed inset-x-0 top-0 flex items-center justify-between p-8">
        {match && (
          <div>
            <p className="text-4xl font-bold uppercase tracking-widest text-white drop-shadow-lg">
              {match.name}
            </p>
            <p className="mt-1 text-xl tracking-[0.35em] text-white/80">
              Match #{match.matchNumber}
              {match.round ? ` · ${match.round}` : ""}
            </p>
          </div>
        )}

        <div className="flex items-center gap-3">
          {isLive && (
            <span className="flex items-center gap-2 rounded bg-red-600 px-3 py-1.5 text-sm font-bold uppercase tracking-widest text-white">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-white" />
              </span>
              Live
            </span>
          )}

          {liveState.status !== "LIVE" && (
            <span className="rounded bg-black/60 px-3 py-1.5 text-sm font-bold uppercase tracking-widest text-white">
              {liveState.status}
            </span>
          )}

          {liveState.locked && (
            <span className="rounded bg-amber-500 px-3 py-1.5 text-sm font-bold uppercase tracking-widest text-black">
              Frozen
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-end gap-4 lg:flex-row lg:items-end">
        <div className="w-full shrink-0 rounded-xl bg-black/70 p-6 backdrop-blur-sm lg:w-[620px]">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-lg font-bold uppercase tracking-widest text-white">
              Scoreboard
            </p>
            <p className="text-sm font-semibold tracking-widest text-white/60">
              {topThree.length} teams
            </p>
          </div>

          <table className="w-full text-white">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.25em] text-white/50">
                <th className="py-2 pr-3">#</th>
                <th className="py-2 pr-3">Team</th>
                <th className="py-2 pr-3 text-center">Kills</th>
                <th className="py-2 pr-3 text-center">Placement</th>
                <th className="py-2 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {liveState.scoreboard.map((team, index) => (
                <tr
                  key={team.teamId}
                  className={
                    team.isWinner
                      ? "bg-amber-400/90 text-black"
                      : index < 3
                        ? "bg-white/5"
                        : ""
                  }
                >
                  <td className="py-2.5 pr-3 text-xl font-bold">
                    {index + 1}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className="text-2xl font-bold uppercase">
                      {team.shortName || team.teamName}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-center text-xl font-semibold tabular-nums">
                    {team.killPoints}
                  </td>
                  <td className="py-2.5 pr-3 text-center text-lg tabular-nums">
                    {placementLabel(team.placement)}
                  </td>
                  <td
                    className={`py-2.5 text-right text-2xl font-bold tabular-nums ${
                      team.isWinner ? "" : "text-white"
                    }`}
                  >
                    {team.matchPoints}
                  </td>
                </tr>
              ))}

              {topThree.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-white/50"
                  >
                    Waiting for roster...
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {rule && (
            <p className="mt-4 text-xs uppercase tracking-[0.25em] text-white/45">
              {rule.name} · kill {rule.killPoint}pt
              {rule.booyahBonus > 0 &&
                ` · booyah +${rule.booyahBonus}`}
            </p>
          )}
        </div>

        <div className="hidden w-full max-w-xs shrink-0 rounded-xl bg-black/60 p-5 backdrop-blur-sm lg:block">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-white/60">
            Fresh kills
          </p>

          {liveState.killFeed.length === 0 ? (
            <p className="py-4 text-center text-sm text-white/40">
              —
            </p>
          ) : (
            <ul className="space-y-2">
              {[...liveState.killFeed]
                .reverse()
                .slice(0, 5)
                .map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded bg-white/5 px-3 py-2 text-sm text-white"
                  >
                    <span className="font-bold">
                      {entry.killerInGameName ?? "Zone"}
                    </span>
                    <span className="mx-1.5 text-white/50">►</span>
                    <span>{entry.victimInGameName ?? "??"}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}