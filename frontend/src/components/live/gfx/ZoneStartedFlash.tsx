"use client";

export function ZoneStartedFlash({
  phase,
  zoneCount,
  seq,
}: {
  phase: number;
  zoneCount: number;
  seq: number;
}) {
  return (
    <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
      <div key={seq} className="gfx-enter-pop px-8 text-center">
        <div className="mx-auto mb-3 flex size-20 items-center justify-center rounded-full border border-red-400/50 bg-red-600/20 shadow-2xl shadow-red-900/50 backdrop-blur-sm">
          <span className="text-3xl font-black text-red-300">!</span>
        </div>

        <p className="text-2xl font-bold uppercase tracking-[0.5em] text-white/70">
          New zone
        </p>
        <p className="mt-2 text-7xl font-black uppercase tracking-tight text-white drop-shadow-2xl">
          Zone {phase}
          <span className="ml-3 text-3xl font-bold text-white/40">
            / {zoneCount}
          </span>
        </p>
      </div>
    </div>
  );
}