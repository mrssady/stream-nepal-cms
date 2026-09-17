"use client";

import { useEffect, useRef, useState } from "react";

import { KillFeedEntry } from "@/types/live-match";

type KillRow = {
  entry: KillFeedEntry;
  leaving: boolean;
};

const ROW_TTL_MS = 6000;
const EXIT_MS = 450;

export function KillFeed({
  entries,
  shortOf,
  maxRows = 6,
}: {
  entries: KillFeedEntry[];
  shortOf: (teamId: string | null) => string;
  maxRows?: number;
}) {
  const [rows, setRows] = useState<KillRow[]>([]);
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fresh = entries.filter((entry) => !seen.current.has(entry.id));

    if (fresh.length === 0) {
      return;
    }

    for (const entry of fresh) {
      seen.current.add(entry.id);
    }

    setRows((current) => {
      const added: KillRow[] = fresh.map((entry) => ({
        entry,
        leaving: false,
      }));
      return [...added, ...current].slice(0, maxRows);
    });

    for (const entry of fresh) {
      setTimeout(() => {
        setRows((current) =>
          current.map((row) =>
            row.entry.id === entry.id
              ? { ...row, leaving: true }
              : row,
          ),
        );

        setTimeout(() => {
          setRows((current) =>
            current.filter((row) => row.entry.id !== entry.id),
          );
        }, EXIT_MS);
      }, ROW_TTL_MS);
    }
  }, [entries, maxRows]);

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-10 left-10 flex w-[460px] flex-col gap-1.5">
      {rows.map(({ entry, leaving }) => (
        <div
          key={entry.id}
          className={`${
            leaving ? "gfx-row-leaving" : "gfx-enter-row"
          } gfx-exit-row flex items-center gap-3 rounded-md border border-white/10 bg-black/70 px-4 py-2.5 backdrop-blur-sm`}
        >
          <span className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-white">
              {entry.killerInGameName ?? "Zone"}
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
              {shortOf(entry.killerTeamId)}
            </span>
          </span>

          <span className="px-1 text-white/40">►</span>

          <span className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-red-300">
              {entry.victimInGameName ?? "??"}
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
              {shortOf(entry.victimTeamId)}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}