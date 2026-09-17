"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  Plus,
  Radio,
  RefreshCw,
  Copy,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  createLiveMatch,
  getLiveMatches,
} from "@/services/liveMatches";
import { getTournaments } from "@/services/tournaments";

import {
  LiveMatch,
  LiveMatchStatus,
} from "@/types/live-match";
import { Tournament } from "@/types/tournament";

const statusVariant: Record<
  LiveMatchStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  SCHEDULED: "secondary",
  READY: "outline",
  LIVE: "default",
  PAUSED: "secondary",
  FINISHED: "outline",
  CANCELLED: "destructive",
};

export default function LiveMatchesPage() {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    tournamentId: "",
    matchNumber: "1",
    round: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      setError(null);
      const data = await getLiveMatches();
      setMatches(data);
    } catch (err) {
      setError("Failed to load live matches");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  useEffect(() => {
    getTournaments()
      .then(setTournaments)
      .catch((err) => console.error(err));
  }, []);

  async function handleCreate() {
    setFormError(null);

    if (
      !form.name.trim() ||
      !form.tournamentId ||
      !form.matchNumber.trim()
    ) {
      setFormError("Name, tournament and match number are required");
      return;
    }

    try {
      const match = await createLiveMatch({
        name: form.name.trim(),
        tournamentId: form.tournamentId,
        matchNumber: Number(form.matchNumber),
        round: form.round.trim() || undefined,
      });

      setCreated(`Created "${match.name}"`);
      setCreateOpen(false);
      setForm({ name: "", tournamentId: "", matchNumber: "1", round: "" });

      await fetchMatches();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? "Failed to create live match";
      setFormError(message);
      console.error(err);
    }
  }

  async function handleCopyOverlay(id: string) {
    const url = `${window.location.origin}/live/overlay/${id}`;
    await navigator.clipboard.writeText(url);
    setCreated("Overlay URL copied");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Live Matches</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Control center for battle royale live scoring
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={fetchMatches}
          >
            <RefreshCw className="size-4" />
            Refresh
          </Button>

          <Button onClick={() => setCreateOpen((value) => !value)}>
            <Plus className="size-4" />
            New Match
          </Button>
        </div>
      </div>

      {created && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
          {created}
        </div>
      )}

      {createOpen && (
        <div className="rounded-xl border p-5">
          <h2 className="mb-4 font-semibold">Create Live Match</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Match name
              </label>
              <input
                className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="Match 1 - Erangel"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Tournament
              </label>
              <select
                className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                value={form.tournamentId}
                onChange={(event) =>
                  setForm({ ...form, tournamentId: event.target.value })
                }
              >
                <option value="">Select a tournament...</option>
                {tournaments.map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name} ({tournament.game})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Match number
              </label>
              <input
                type="number"
                min={1}
                className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                value={form.matchNumber}
                onChange={(event) =>
                  setForm({ ...form, matchNumber: event.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Round (optional)
              </label>
              <input
                className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="Group A"
                value={form.round}
                onChange={(event) =>
                  setForm({ ...form, round: event.target.value })
                }
              />
            </div>
          </div>

          {formError && (
            <p className="mt-3 text-sm text-destructive">{formError}</p>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border p-8 text-center text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
          Loading live matches...
        </div>
      )}

      {!loading && !error && matches.length === 0 && (
        <div className="rounded-xl border p-10 text-center">
          <p className="font-medium">No live matches yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first match to start scoring.
          </p>
        </div>
      )}

      {!loading && matches.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {matches.map((match) => (
            <div
              key={match.id}
              className="flex flex-col gap-3 rounded-xl border p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{match.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Match #{match.matchNumber}
                    {match.round ? ` · ${match.round}` : ""}
                  </p>
                </div>
                <Badge variant={statusVariant[match.status]}>
                  {match.status}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground">
                Events: {match.eventSeq}
              </p>

              <div className="mt-auto flex flex-wrap gap-2">
                <Link
                  href={`/live/${match.id}`}
                  className={buttonVariants({ variant: "default", size: "sm" })}
                >
                  <Radio className="size-4" />
                  Control
                </Link>

                <Link
                  href={`/live/overlay/${match.id}`}
                  target="_blank"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Overlay
                </Link>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyOverlay(match.id)}
                >
                  <Copy className="size-4" />
                  URL
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}