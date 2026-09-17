"use client";

import { useEffect, useState } from "react";

import { getLiveSocket } from "@/lib/socket";
import {
  MatchEventRecord,
  MatchState,
} from "@/types/live-match";

type LiveMatchHookResult = {
  state: MatchState | null;
  connected: boolean;
  lastEvent: MatchEventRecord | null;
};

export function useLiveMatch(
  matchId?: string | null,
): LiveMatchHookResult {
  const [state, setState] = useState<MatchState | null>(
    null,
  );
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] =
    useState<MatchEventRecord | null>(null);

  useEffect(() => {
    if (!matchId) {
      return;
    }

    const socket = getLiveSocket();

    const onInit = (data: { state: MatchState }) => {
      setState(data.state);
    };

    const onState = (nextState: MatchState) => {
      setState(nextState);
    };

    const onEvent = (event: MatchEventRecord) => {
      setLastEvent(event);
    };

    const onConnect = () => {
      setConnected(true);
      socket.emit("subscribe", matchId);
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    socket.on("match:init", onInit);
    socket.on("match:state", onState);
    socket.on("match:event", onEvent);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (socket.connected) {
      setConnected(true);
      socket.emit("subscribe", matchId);
    } else {
      socket.connect();
    }

    return () => {
      socket.emit("unsubscribe", matchId);

      socket.off("match:init", onInit);
      socket.off("match:state", onState);
      socket.off("match:event", onEvent);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [matchId]);

  return { state, connected, lastEvent };
}