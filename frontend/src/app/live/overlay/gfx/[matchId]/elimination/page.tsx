"use client";

import { use, useEffect, useRef, useState } from "react";

import { EliminationCard } from "@/components/live/gfx/EliminationCard";
import { useGfxMatch } from "@/components/live/gfx/useGfxMatch";

import { MatchEventKind } from "@/types/live-match";

const TRIGGER_KINDS: MatchEventKind[] = [
  "TEAM_ELIMINATED",
  "PLACEMENT_SET",
  "PLACEMENT_CONFIRMED",
];

const HIDE_AFTER_MS = 6500;

type CardData = {
  key: number;
  shortName: string;
  teamName: string;
  placement: number | null;
  placementPoints?: number;
};

export default function EliminationGfxPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = use(params);
  const { state, lastEvent, connected } = useGfxMatch(matchId);

  const [card, setCard] = useState<CardData | null>(null);
  const handledSeq = useRef<number | null>(null);

  useEffect(() => {
    const event = lastEvent;

    if (!event || handledSeq.current === event.seq) {
      return;
    }

    if (!TRIGGER_KINDS.includes(event.kind)) {
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

    const placement =
      derived?.placement ?? team?.placement ?? null;
    const placementPoints = derived?.placementPoints;

    setCard({
      key: event.seq,
      shortName:
        derived?.shortName ?? team?.shortName ?? "???",
      teamName: derived?.teamName ?? team?.teamName ?? "",
      placement: placement ?? null,
      placementPoints: placementPoints ?? undefined,
    });
  }, [lastEvent, state]);

  useEffect(() => {
    if (!card) {
      return;
    }

    const timer = setTimeout(() => setCard(null), HIDE_AFTER_MS);

    return () => clearTimeout(timer);
  }, [card]);

  return (
    <div className="gfx-hide-when-empty">
      {card && (
        <EliminationCard
          key={card.key}
          shortName={card.shortName}
          teamName={card.teamName}
          placement={card.placement}
          placementPoints={card.placementPoints}
        />
      )}

      {connected && !card && (
        <p className="pointer-events-none fixed bottom-3 right-4 text-xs uppercase tracking-[0.3em] text-white/25">
          Elimination overlay · armed
        </p>
      )}
    </div>
  );
}