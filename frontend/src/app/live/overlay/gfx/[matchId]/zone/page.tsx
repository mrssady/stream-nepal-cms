"use client";

import { use, useEffect, useRef, useState } from "react";

import { ZoneStartedFlash } from "@/components/live/gfx/ZoneStartedFlash";
import { ZoneTimer } from "@/components/live/gfx/ZoneTimer";
import { useGfxMatch } from "@/components/live/gfx/useGfxMatch";

const FLASH_MS = 4200;

export default function ZoneGfxPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = use(params);
  const { state, lastEvent, connected } = useGfxMatch(matchId);

  const zone = state?.zone ?? null;
  const zoneCount = state?.zoneCount ?? 8;

  const [flash, setFlash] = useState<{
    phase: number;
    seq: number;
  } | null>(null);
  const handledSeq = useRef<number | null>(null);

  useEffect(() => {
    const event = lastEvent;

    if (
      !event ||
      event.kind !== "ZONE_STARTED" ||
      handledSeq.current === event.seq
    ) {
      return;
    }

    handledSeq.current = event.seq;

    const phase =
      typeof event.payload.phase === "number"
        ? event.payload.phase
        : zone?.phase;

    if (phase && phase >= 1) {
      setFlash({ phase, seq: event.seq });
    }
  }, [lastEvent, zone?.phase]);

  useEffect(() => {
    if (!flash) {
      return;
    }

    const timer = setTimeout(() => setFlash(null), FLASH_MS);

    return () => clearTimeout(timer);
  }, [flash]);

  return (
    <div className="gfx-hide-when-empty">
      <ZoneTimer
        phase={zone?.phase ?? null}
        zoneCount={zoneCount}
        timerSeconds={zone?.timerSeconds ?? null}
        timerSetAt={zone?.timerSetAt ?? null}
      />

      {flash && (
        <ZoneStartedFlash
          key={flash.seq}
          phase={flash.phase}
          zoneCount={zoneCount}
          seq={flash.seq}
        />
      )}

      {connected && (
        <p className="pointer-events-none fixed bottom-3 right-4 text-xs uppercase tracking-[0.3em] text-white/25">
          Zone overlay · live
        </p>
      )}
    </div>
  );
}