"use client";

const PLACEMENT_SUFFIX: Record<number, string> = {
  1: "st",
  2: "nd",
  3: "rd",
};

export function placementLabel(
  placement: number | null | undefined,
): string {
  if (!placement || placement < 1) {
    return "";
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

export function ordinalWord(placement: number): string {
  const words = [
    "Champion",
    "2nd",
    "3rd",
    "4th",
    "5th",
    "6th",
    "7th",
    "8th",
    "9th",
    "10th",
    "11th",
    "12th",
    "13th",
    "14th",
    "15th",
    "16th",
    "17th",
    "18th",
    "19th",
    "20th",
  ];

  return words[placement - 1] ?? `${placement}th`;
}

export function EliminationCard({
  shortName,
  teamName,
  placement,
  placementPoints,
  kicker,
}: {
  shortName: string;
  teamName: string;
  placement: number | null | undefined;
  placementPoints?: number | null;
  kicker?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-24 flex justify-center">
      <div className="gfx-enter-pop w-[520px] overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-slate-900/95 via-black/90 to-slate-900/95 shadow-2xl shadow-black/70 backdrop-blur-sm">
        <div className="flex items-center justify-between bg-gradient-to-r from-red-600/90 to-red-500/70 px-6 py-2.5">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-white">
            {kicker ?? "Team Eliminated"}
          </p>
          <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
            Out of the fight
          </p>
        </div>

        <div className="flex items-center gap-6 px-6 py-8">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl border border-red-400/40 bg-red-500/15 text-2xl font-black tracking-tight text-white">
            {shortName}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-3xl font-bold uppercase leading-none text-white">
              {shortName}
            </p>
            <p className="mt-1 truncate text-lg font-medium text-white/60">
              {teamName}
            </p>
          </div>

          <div className="shrink-0 rounded-xl bg-white/5 px-5 py-3 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">
              Finished
            </p>
            <p className="text-3xl font-black text-red-300">
              {placementLabel(placement)}
            </p>
            {placementPoints ? (
              <p className="mt-0.5 text-xs font-semibold text-white/50">
                +{placementPoints} pts
              </p>
            ) : null}
          </div>
        </div>

        <div className="h-1 w-full bg-gradient-to-r from-red-600 via-amber-400 to-red-600" />
      </div>
    </div>
  );
}