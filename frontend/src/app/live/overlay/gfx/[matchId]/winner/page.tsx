"use client";

import { use, useEffect, useRef, useState } from "react";

import { WinnerCard } from "@/components/live/gfx/WinnerCard";
import { useGfxMatch } from "@/components/live/gfx/useGfxMatch";

const HIDE_AFTER_MS = 12000;

type WinnerData = {
  key: number;
  shortName: string;
  teamName: string;
  points: number;
};

export default function WinnerGfxPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = use(params);
  const { state, lastEvent, connected } = useGfxMatch(matchId);

  const [winner, setWinner] = useState<WinnerData | null>(null);
  const handledSeq = useRef<number | null>(null);

  useEffect(() => {
    const event = lastEvent;

    if (!event || event.kind !== "WINNER_DECLARED") {
      return;
    }

    if (handledSeq.current === event.seq) {
      return;
    }

    handledSeq.current = event.seq;

    const derived = event.derived;
    const teamId =
      derived?.teamId ??
      (typeof event.payload.teamId === "string"
        ? event.payload.teamId
        : null);
    const team = teamId ? state?.teams[teamId] : null;

    setWinner({
      key: event.seq,
      shortName:
        derived?.shortName ?? team?.shortName ?? "???",
      teamName: derived?.teamName ?? team?.teamName ?? "",
      points: team?.matchPoints ?? 0,
    });
  }, [lastEvent, state]);

  useEffect(() => {
    if (!winner) {
      return;
    }

    const timer = setTimeout(() => setWinner(null), HIDE_AFTER_MS);

    return () => clearTimeout(timer);
  }, [winner]);

  return (
    <div className="gfx-hide-when-empty">
      {winner && (
        <WinnerCard
          key={winner.key}
          shortName={winner.shortName}
          teamName={winner.teamName}
          points={winner.points}
        />
      )}

      {connected && !winner && (
        <p className="pointer-events-none fixed bottom-3 right-4 text-xs uppercase tracking-[0.3em] text-white/25">
          Winner overlay · armed
        </p>
      )}
    </div>
  );
}