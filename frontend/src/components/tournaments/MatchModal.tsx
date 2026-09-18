"use client";

import { useState } from "react";

import type {
  CreateMatchDto,
  Match,
  MatchStatus,
  MatchType,
  UpdateMatchDto,
} from "@/types/match";

import type { TournamentTeam } from "@/types/player";

const MATCH_TYPES: MatchType[] = ["BO1", "BO3", "BO5", "CUSTOM"];

const MATCH_STATUSES: MatchStatus[] = [
  "SCHEDULED",
  "LIVE",
  "COMPLETED",
  "CANCELLED",
];

function toDatetimeLocal(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  const pad = (number: number) =>
    String(number).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type MatchFormState = {
  title: string;
  round: string;
  matchType: MatchType;
  status: MatchStatus;
  scheduledAt: string;
  homeTeamId: string;
  awayTeamId: string;
  winnerTeamId: string;
  homeScore: string;
  awayScore: string;
  notes: string;
};

function buildForm(match?: Match | null): MatchFormState {
  return {
    title: match?.title ?? "",
    round: match?.round ?? "",
    matchType: match?.matchType ?? "BO1",
    status: match?.status ?? "SCHEDULED",
    scheduledAt: toDatetimeLocal(match?.scheduledAt),
    homeTeamId: match?.homeTeamId ?? "",
    awayTeamId: match?.awayTeamId ?? "",
    winnerTeamId: match?.winnerTeamId ?? "",
    homeScore: match?.homeScore?.toString() ?? "0",
    awayScore: match?.awayScore?.toString() ?? "0",
    notes: match?.notes ?? "",
  };
}

type MatchModalProps = {
  open: boolean;
  mode: "create" | "edit";
  loading?: boolean;
  tournamentId?: string;
  teams: TournamentTeam[];
  initialData?: Match | null;
  onClose: () => void;
  onSubmit: (
    data: CreateMatchDto | UpdateMatchDto,
  ) => void;
};

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function MatchModal({
  open,
  mode,
  loading = false,
  tournamentId,
  teams,
  initialData,
  onClose,
  onSubmit,
}: MatchModalProps) {
  const [form, setForm] = useState(buildForm(initialData));

  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);

    if (open) {
      setForm(buildForm(initialData));
    }
  }

  if (!open) {
    return null;
  }

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.scheduledAt ||
      !form.homeTeamId ||
      !form.awayTeamId ||
      form.homeTeamId === form.awayTeamId
    ) {
      alert(
        "Title, schedule, and two different teams are required.",
      );

      return;
    }

    const payload = {
      title: form.title.trim(),
      round: form.round.trim() || undefined,
      matchType: form.matchType,
      status: form.status,
      scheduledAt: new Date(
        form.scheduledAt,
      ).toISOString(),
      homeTeamId: form.homeTeamId,
      awayTeamId: form.awayTeamId,
      winnerTeamId:
        form.winnerTeamId || undefined,
      homeScore: Number(form.homeScore) || 0,
      awayScore: Number(form.awayScore) || 0,
      notes: form.notes.trim() || undefined,
    };

    if (mode === "create") {
      onSubmit({
        ...payload,
        tournamentId,
      } as CreateMatchDto);
    } else {
      onSubmit(payload as UpdateMatchDto);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl dark:border dark:border-border dark:bg-card">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-border">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {mode === "create"
              ? "Add Match"
              : "Edit Match"}
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Schedule a tournament fixture.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                Title
              </label>

              <input
                value={form.title}
                name="title"
                onChange={handleChange}
                placeholder="Upper Bracket Final"
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div>
              <label className={labelClass}>
                Round
              </label>

              <input
                value={form.round}
                name="round"
                onChange={handleChange}
                placeholder="Semi Final"
                className={inputClass}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>
                Match Type
              </label>

              <select
                value={form.matchType}
                name="matchType"
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              >
                {MATCH_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Status
              </label>

              <select
                value={form.status}
                name="status"
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              >
                {MATCH_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatLabel(status)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Scheduled At
              </label>

              <input
                type="datetime-local"
                value={form.scheduledAt}
                name="scheduledAt"
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                Home Team
              </label>

              <select
                value={form.homeTeamId}
                name="homeTeamId"
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              >
                <option value="">
                  Select home team
                </option>

                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.teamName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Away Team
              </label>

              <select
                value={form.awayTeamId}
                name="awayTeamId"
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              >
                <option value="">
                  Select away team
                </option>

                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.teamName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>
                Home Score
              </label>

              <input
                type="number"
                min={0}
                value={form.homeScore}
                name="homeScore"
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div>
              <label className={labelClass}>
                Away Score
              </label>

              <input
                type="number"
                min={0}
                value={form.awayScore}
                name="awayScore"
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div>
              <label className={labelClass}>
                Winner
              </label>

              <select
                value={form.winnerTeamId}
                name="winnerTeamId"
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              >
                <option value="">
                  No winner
                </option>

                {[form.homeTeamId, form.awayTeamId]
                  .filter(Boolean)
                  .map((teamId) => {
                    const team = teams.find(
                      (item) => item.id === teamId,
                    );

                    if (!team) {
                      return null;
                    }

                    return (
                      <option key={team.id} value={team.id}>
                        {team.teamName}
                      </option>
                    );
                  })}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Notes
            </label>

            <textarea
              value={form.notes}
              name="notes"
              onChange={handleChange}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-border dark:text-slate-300 dark:hover:bg-muted"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
            >
              {loading
                ? "Saving..."
                : mode === "create"
                  ? "Add Match"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}