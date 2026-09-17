"use client";

import { Trophy } from "lucide-react";

import { ordinalWord } from "./EliminationCard";

export function WinnerCard({
  shortName,
  teamName,
  points,
}: {
  shortName: string;
  teamName: string;
  points?: number;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="gfx-enter-pop flex flex-col items-center px-8 text-center">
        <div className="gfx-live-dot mb-2 flex size-24 items-center justify-center rounded-full bg-gradient-to-b from-amber-300 to-amber-500 shadow-2xl shadow-amber-500/50">
          <Trophy className="size-12 text-black" strokeWidth={2.5} />
        </div>

        <div className="w-[720px] overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-b from-slate-900/95 via-black/95 to-amber-950/60 shadow-2xl shadow-amber-900/40 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 px-6 py-3">
            <p className="text-center text-3xl font-black uppercase tracking-[0.3em] text-black">
              Booyah! Winner
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 px-8 py-10">
            <div className="flex size-24 shrink-0 items-center justify-center rounded-2xl border border-amber-300/50 bg-amber-400/15 text-3xl font-black tracking-tight text-amber-200">
              {shortName}
            </div>

            <div className="text-left">
              <p className="text-6xl font-black uppercase leading-none tracking-tight text-white drop-shadow-lg">
                {shortName}
              </p>
              <p className="mt-2 text-2xl font-semibold text-white/70">
                {teamName}
              </p>
              <p className="mt-1 text-lg font-bold uppercase tracking-[0.35em] text-amber-300">
                {ordinalWord(1)} · Match Winner
              </p>
            </div>
          </div>

          {points !== undefined && (
            <div className="pb-6 text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-5 py-2 text-lg font-bold text-amber-200">
                +{points} points
              </span>
            </div>
          )}

          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-yellow-200 to-amber-500" />
        </div>
      </div>
    </div>
  );
}