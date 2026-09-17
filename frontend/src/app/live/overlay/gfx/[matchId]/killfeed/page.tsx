"use client";

import { use } from "react";

import { KillFeed } from "@/components/live/gfx/KillFeed";
import { useGfxMatch } from "@/components/live/gfx/useGfxMatch";

export default function KillFeedGfxPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = use(params);
  const { state, connected } = useGfxMatch(matchId);

  const shortOf = (teamId: string | null): string =>
    (teamId ? state?.teams[teamId]?.shortName : null) ?? "";

  return (
    <div className="gfx-hide-when-empty">
      <KillFeed entries={state?.killFeed ?? []} shortOf={shortOf} />

      {connected && (
        <p className="pointer-events-none fixed bottom-3 right-4 text-xs uppercase tracking-[0.3em] text-white/25">
          Kill feed overlay · live
        </p>
      )}
    </div>
  );
}