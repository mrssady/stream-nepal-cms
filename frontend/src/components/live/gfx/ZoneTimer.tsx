"use client";

import { useEffect, useState } from "react";

function parseDate(value: string | null): number {
  return value ? Date.parse(value) : 0;
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function ZoneTimer({
  phase,
  zoneCount,
  timerSeconds,
  timerSetAt,
}: {
  phase: number | null;
  zoneCount: number;
  timerSeconds: number | null;
  timerSetAt: string | null;
}) {
  const setAt = parseDate(timerSetAt);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!timerSeconds || !setAt) {
      return;
    }

    const remaining =
      timerSeconds - Math.floor((Date.now() - setAt) / 1000);

    if (remaining <= 0) {
      return;
    }

    const interval = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(interval);
  }, [timerSeconds, setAt]);

  const remaining =
    timerSeconds && setAt
      ? Math.max(0, timerSeconds - Math.floor((now - setAt) / 1000))
      : null;

  const pips = Array.from({ length: zoneCount }, (_, i) => i + 1);
  const hasPhase = phase !== null && phase >= 1;

  return (
    <div className="pointer-events-none fixed bottom-20 left-10">
      <div className="overflow-hidden rounded-xl border border-white/15 bg-black/75 px-7 py-5 backdrop-blur-sm">
        {remaining !== null && remaining > 0 && (
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/55">
            {phase !== null && phase < zoneCount
              ? `Zone ${phase + 1} closes in`
              : "Final zone in"}
          </p>
        )}

        <div className="mt-0.5 flex items-baseline gap-3">
          <span className="text-6xl font-black tracking-tight text-white drop-shadow-lg">
            {hasPhase ? phase : "–"}
          </span>
          <span className="text-xl font-bold uppercase tracking-widest text-white/50">
            / {zoneCount}
          </span>

          {remaining !== null && (
            <span
              key={remaining}
              className="gfx-tick ml-3 text-6xl font-black tracking-tight text-red-400 drop-shadow-lg"
            >
              {formatClock(remaining)}
            </span>
          )}
        </div>

        <div className="mt-4 flex gap-1.5">
          {pips.map((pip) => (
            <span
              key={pip}
              className={`h-2 w-6 rounded-full ${
                hasPhase && pip <= phase
                  ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                  : pip === (phase ?? 0) + 1 && remaining !== null
                    ? "bg-amber-400"
                    : "bg-white/15"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}