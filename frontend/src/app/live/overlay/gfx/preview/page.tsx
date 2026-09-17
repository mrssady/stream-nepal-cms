"use client";

import { useRef, useState } from "react";

import { EliminationCard } from "@/components/live/gfx/EliminationCard";

import { KillFeed } from "@/components/live/gfx/KillFeed";
import { WinnerCard } from "@/components/live/gfx/WinnerCard";
import { ZoneStartedFlash } from "@/components/live/gfx/ZoneStartedFlash";
import { ZoneTimer } from "@/components/live/gfx/ZoneTimer";

import { KillFeedEntry } from "@/types/live-match";

const TEAMS = [
  { teamId: "t1", shortName: "ALP" },
  { teamId: "t2", shortName: "BRV" },
  { teamId: "t3", shortName: "CHR" },
  { teamId: "t4", shortName: "DTF" },
];

let killSeq = 100;

function fakeKill(killer: number, victim: number): KillFeedEntry {
  killSeq += 1;

  return {
    id: `preview-${killSeq}`,
    seq: killSeq,
    killerTeamId: TEAMS[killer].teamId,
    killerPlayerId: null,
    killerInGameName: `Pro${killer + 1}`,
    victimTeamId: TEAMS[victim].teamId,
    victimPlayerId: null,
    victimInGameName: `Rookie${victim + 1}`,
    timestamp: new Date().toISOString(),
  };
}

export default function GfxPreviewPage() {
  const [elim, setElim] = useState<{
    key: number;
    shortName: string;
    teamName: string;
    placement: number;
  } | null>(null);

  const [winner, setWinner] = useState<{
    key: number;
    shortName: string;
    teamName: string;
  } | null>(null);

  const [kills, setKills] = useState<KillFeedEntry[]>([]);
  const [zoneFlash, setZoneFlash] = useState<{
    phase: number;
    seq: number;
  } | null>(null);

  const [zone, setZone] = useState<{
    phase: number | null;
    timerSeconds: number | null;
    timerSetAt: string | null;
  }>({
    phase: 2,
    timerSeconds: null,
    timerSetAt: null,
  });

  const elimDepth = useRef(0);
  const winnerDepth = useRef(0);
  const flashDepth = useRef(0);

  const shortOf = (teamId: string | null): string =>
    TEAMS.find((team) => team.teamId === teamId)?.shortName ?? "";

  function playElimination() {
    elimDepth.current += 1;
    setElim(null);
    window.setTimeout(() => {
      setElim({
        key: elimDepth.current,
        shortName: TEAMS[3].shortName,
        teamName: "Delta Force",
        placement: 4,
      });
    }, 30);
  }

  function playWinner() {
    winnerDepth.current += 1;
    setWinner(null);
    window.setTimeout(() => {
      setWinner({
        key: winnerDepth.current,
        shortName: TEAMS[0].shortName,
        teamName: "Alpha Squad",
      });
    }, 30);
  }

  function pushKill() {
    const victim = Math.floor(Math.random() * 4);
    let killer = Math.floor(Math.random() * 4);
    if (killer === victim) {
      killer = (killer + 1) % 4;
    }
    setKills((current) => [...current, fakeKill(killer, victim)]);
  }

  function flashZone(phase: number) {
    flashDepth.current += 1;
    setZoneFlash({ phase, seq: flashDepth.current });
    setZone((current) => ({ ...current, phase }));
  }

  function startTimer(seconds: number) {
    setZone({
      phase: (zone.phase ?? 1) + 1 > 8 ? 8 : (zone.phase ?? 1) + 1,
      timerSeconds: seconds,
      timerSetAt: new Date().toISOString(),
    });
  }

  return (
    <div className="relative min-h-screen bg-transparent">
      <div className="pointer-events-none fixed inset-x-0 top-0 flex items-center justify-center">
        <div className="gfx-enter-up mt-6 rounded-lg border border-white/20 bg-black/80 px-5 py-3 backdrop-blur-sm">
          <p className="text-lg font-black uppercase tracking-[0.35em] text-white">
            GFX Preview
          </p>
        </div>
      </div>

      <KillFeed entries={kills} shortOf={shortOf} />

      <ZoneTimer
        phase={zone.phase}
        zoneCount={8}
        timerSeconds={zone.timerSeconds}
        timerSetAt={zone.timerSetAt}
      />

      {elim && (
        <EliminationCard
          key={elim.key}
          shortName={elim.shortName}
          teamName={elim.teamName}
          placement={elim.placement}
        />
      )}

      {winner && (
        <WinnerCard
          key={winner.key}
          shortName={winner.shortName}
          teamName={winner.teamName}
          points={42}
        />
      )}

      {zoneFlash && (
        <ZoneStartedFlash
          key={zoneFlash.seq}
          phase={zoneFlash.phase}
          zoneCount={8}
          seq={zoneFlash.seq}
        />
      )}

      <div className="fixed bottom-6 left-1/2 flex -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-xl border border-white/20 bg-black/80 p-4 backdrop-blur-sm">
        <button
          onClick={playElimination}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-bold uppercase tracking-wider text-white hover:bg-red-500"
        >
          Eliminated card
        </button>
        <button
          onClick={playWinner}
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-bold uppercase tracking-wider text-black hover:bg-amber-400"
        >
          Winner card
        </button>
        <button
          onClick={pushKill}
          className="rounded-md bg-white/10 px-4 py-2 text-sm font-bold uppercase tracking-wider text-white hover:bg-white/20"
        >
          Push kill
        </button>
        <button
          onClick={() => flashZone((zone.phase ?? 0) + 1)}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-bold uppercase tracking-wider text-white hover:bg-sky-500"
        >
          Zone flash
        </button>
        <button
          onClick={() => startTimer(120)}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold uppercase tracking-wider text-white hover:bg-emerald-500"
        >
          Timer 2:00
        </button>
        <button
          onClick={() => startTimer(45)}
          className="rounded-md bg-emerald-600/60 px-4 py-2 text-sm font-bold uppercase tracking-wider text-white hover:bg-emerald-500/70"
        >
          Timer 0:45
        </button>
      </div>
    </div>
  );
}