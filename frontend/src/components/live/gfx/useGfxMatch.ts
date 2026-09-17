"use client";

import { useCallback, useEffect, useState } from "react";

import { useLiveMatch } from "@/hooks/useLiveMatch";
import { getLiveMatchSnapshot } from "@/services/liveMatches";

import {
  MatchEventRecord,
  MatchState,
  SnapshotPayload,
} from "@/types/live-match";

export type GfxMatchContext = {
  match: SnapshotPayload["match"] | null;
  rule: SnapshotPayload["rule"] | null;
  state: MatchState | null;
  lastEvent: MatchEventRecord | null;
  connected: boolean;
};

export function useGfxMatch(
  matchId?: string | null,
): GfxMatchContext {
  const [snapshot, setSnapshot] = useState<SnapshotPayload | null>(
    null,
  );

  const fetchSnapshot = useCallback(async () => {
    if (!matchId) {
      return;
    }

    setSnapshot(await getLiveMatchSnapshot(matchId).catch(() => null));
  }, [matchId]);

  useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  const socket = useLiveMatch(matchId || undefined);

  return {
    match: snapshot?.match ?? null,
    rule: snapshot?.rule ?? null,
    state: socket.state ?? snapshot?.state ?? null,
    lastEvent: socket.lastEvent,
    connected: socket.connected,
  };
}