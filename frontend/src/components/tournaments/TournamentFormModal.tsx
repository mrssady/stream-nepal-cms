"use client";

import { useState } from "react";

import ImageUpload from "@/components/media/ImageUpload";

import type {
  CreateTournamentDto,
  Tournament,
  TournamentGame,
  TournamentStatus,
  UpdateTournamentDto,
} from "@/types/tournament";

const GAMES: TournamentGame[] = [
  "PUBG_MOBILE",
  "FREE_FIRE",
  "VALORANT",
  "CS2",
  "DOTA2",
  "EA_FC",
  "EFOOTBALL",
  "MOBILE_LEGENDS",
  "OTHER",
];

const STATUSES: TournamentStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "REGISTRATION_OPEN",
  "REGISTRATION_CLOSED",
  "LIVE",
  "COMPLETED",
  "CANCELLED",
];

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
}

function toDatetimeLocal(
  value?: string | null,
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  const pad = (number: number) =>
    String(number).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type TournamentFormState = {
  name: string;
  slug: string;
  game: TournamentGame;
  organizer: string;
  registrationFee: string;
  prizePool: string;
  maxTeams: string;
  currentTeams: string;
  registrationOpen: string;
  registrationClose: string;
  tournamentStart: string;
  tournamentEnd: string;
  description: string;
  rules: string;
  logo: string;
  banner: string;
  discordUrl: string;
  whatsappUrl: string;
  streamUrl: string;
  websiteUrl: string;
  featured: boolean;
  isPublic: boolean;
  status: TournamentStatus;
};

function buildForm(
  tournament?: Tournament | null,
): TournamentFormState {
  return {
    name: tournament?.name ?? "",
    slug: tournament?.slug ?? "",
    game: tournament?.game ?? "PUBG_MOBILE",
    organizer: tournament?.organizer ?? "",
    registrationFee:
      tournament?.registrationFee?.toString() ?? "0",
    prizePool: tournament?.prizePool ?? "",
    maxTeams: tournament?.maxTeams?.toString() ?? "16",
    currentTeams:
      tournament?.currentTeams?.toString() ?? "0",
    registrationOpen: toDatetimeLocal(
      tournament?.registrationOpen,
    ),
    registrationClose: toDatetimeLocal(
      tournament?.registrationClose,
    ),
    tournamentStart: toDatetimeLocal(
      tournament?.tournamentStart,
    ),
    tournamentEnd: toDatetimeLocal(
      tournament?.tournamentEnd,
    ),
    description: tournament?.description ?? "",
    rules: tournament?.rules ?? "",
    logo: tournament?.logo ?? "",
    banner: tournament?.banner ?? "",
    discordUrl: tournament?.discordUrl ?? "",
    whatsappUrl: tournament?.whatsappUrl ?? "",
    streamUrl: tournament?.streamUrl ?? "",
    websiteUrl: tournament?.websiteUrl ?? "",
    featured: tournament?.featured ?? false,
    isPublic: tournament?.isPublic ?? true,
    status: tournament?.status ?? "DRAFT",
  };
}

type TournamentFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  loading?: boolean;
  initialData?: Tournament | null;
  onClose: () => void;
  onSubmit: (
    data:
      | CreateTournamentDto
      | UpdateTournamentDto,
  ) => void;
};

export default function TournamentFormModal({
  open,
  mode,
  loading = false,
  initialData,
  onClose,
  onSubmit,
}: TournamentFormModalProps) {
  const [form, setForm] = useState(
    buildForm(initialData),
  );

  const [prevOpen, setPrevOpen] =
    useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);

    if (open) {
      setForm(buildForm(initialData));
    }
  }

  if (!open) {
    return null;
  }

  const isEdit = mode === "edit";

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleCheckboxChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const { name, checked } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: checked,
    }));
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.slug.trim() ||
      !form.organizer.trim()
    ) {
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      game: form.game,
      organizer: form.organizer.trim(),
      registrationFee:
        Number(form.registrationFee) || 0,
      prizePool:
        form.prizePool.trim() || undefined,
      maxTeams:
        Number(form.maxTeams) || 0,
      currentTeams:
        Number(form.currentTeams) || 0,
      registrationOpen:
        form.registrationOpen
          ? new Date(form.registrationOpen).toISOString()
          : undefined,
      registrationClose:
        form.registrationClose
          ? new Date(form.registrationClose).toISOString()
          : undefined,
      tournamentStart:
        form.tournamentStart
          ? new Date(form.tournamentStart).toISOString()
          : undefined,
      tournamentEnd:
        form.tournamentEnd
          ? new Date(form.tournamentEnd).toISOString()
          : undefined,
      description:
        form.description.trim() ||
        undefined,
      rules:
        form.rules.trim() || undefined,
      logo:
        form.logo.trim() || undefined,
      banner:
        form.banner.trim() || undefined,
      discordUrl:
        form.discordUrl.trim() ||
        undefined,
      whatsappUrl:
        form.whatsappUrl.trim() ||
        undefined,
      streamUrl:
        form.streamUrl.trim() || undefined,
      websiteUrl:
        form.websiteUrl.trim() ||
        undefined,
      featured: form.featured,
      isPublic: form.isPublic,
      status: form.status,
    };

    if (isEdit) {
      const update: UpdateTournamentDto = {
        ...payload,
      };

      onSubmit(update);
    } else {
      onSubmit(
        payload as CreateTournamentDto,
      );
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl dark:border dark:border-border dark:bg-card">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-border">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {isEdit
              ? "Edit Tournament"
              : "Create Tournament"}
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tournament details, schedule and
            registration window.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >
          {/* BASIC */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Basic Info
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Name
                </label>

                <input
                  value={form.name}
                  name="name"
                  onChange={handleChange}
                  placeholder="PMBC 2026"
                  className={inputClass}
                  disabled={loading}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Slug
                </label>

                <input
                  value={form.slug}
                  name="slug"
                  onChange={handleChange}
                  placeholder="pmbc-2026"
                  className={inputClass}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>
                  Game
                </label>

                <select
                  value={form.game}
                  name="game"
                  onChange={handleChange}
                  className={inputClass}
                  disabled={loading}
                >
                  {GAMES.map((game) => (
                    <option key={game} value={game}>
                      {formatLabel(game)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Organizer
                </label>

                <input
                  value={form.organizer}
                  name="organizer"
                  onChange={handleChange}
                  placeholder="Stream Nepal"
                  className={inputClass}
                  disabled={loading}
                />
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
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {formatLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>
                  Max Teams
                </label>

                <input
                  type="number"
                  min={1}
                  value={form.maxTeams}
                  name="maxTeams"
                  onChange={handleChange}
                  className={inputClass}
                  disabled={loading}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Current Teams
                </label>

                <input
                  type="number"
                  min={0}
                  value={form.currentTeams}
                  name="currentTeams"
                  onChange={handleChange}
                  className={inputClass}
                  disabled={loading}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Registration Fee (NPR)
                </label>

                <input
                  type="number"
                  min={0}
                  value={form.registrationFee}
                  name="registrationFee"
                  onChange={handleChange}
                  className={inputClass}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Prize Pool
                </label>

                <input
                  value={form.prizePool}
                  name="prizePool"
                  onChange={handleChange}
                  placeholder="Rs. 500,000 + trophy"
                  className={inputClass}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 dark:border-border">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={form.featured}
                    onChange={handleCheckboxChange}
                    disabled={loading}
                  />

                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Featured
                  </span>
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 dark:border-border">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={form.isPublic}
                    onChange={handleCheckboxChange}
                    disabled={loading}
                  />

                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Public
                  </span>
                </label>
              </div>
            </div>
          </section>

          {/* SCHEDULE */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Schedule
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Registration Opens
                </label>

                <input
                  type="datetime-local"
                  value={form.registrationOpen}
                  name="registrationOpen"
                  onChange={handleChange}
                  className={inputClass}
                  disabled={loading}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Registration Closes
                </label>

                <input
                  type="datetime-local"
                  value={form.registrationClose}
                  name="registrationClose"
                  onChange={handleChange}
                  className={inputClass}
                  disabled={loading}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Tournament Starts
                </label>

                <input
                  type="datetime-local"
                  value={form.tournamentStart}
                  name="tournamentStart"
                  onChange={handleChange}
                  className={inputClass}
                  disabled={loading}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Tournament Ends
                </label>

                <input
                  type="datetime-local"
                  value={form.tournamentEnd}
                  name="tournamentEnd"
                  onChange={handleChange}
                  className={inputClass}
                  disabled={loading}
                />
              </div>
            </div>
          </section>

          {/* LINKS */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Links
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Discord URL
                </label>

                <input
                  value={form.discordUrl}
                  name="discordUrl"
                  onChange={handleChange}
                  placeholder="https://discord.gg/..."
                  className={inputClass}
                  disabled={loading}
                />
              </div>

              <div>
                <label className={labelClass}>
                  WhatsApp URL
                </label>

                <input
                  value={form.whatsappUrl}
                  name="whatsappUrl"
                  onChange={handleChange}
                  placeholder="https://chat.whatsapp.com/..."
                  className={inputClass}
                  disabled={loading}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Stream URL
                </label>

                <input
                  value={form.streamUrl}
                  name="streamUrl"
                  onChange={handleChange}
                  placeholder="https://youtube.com/@streamnepal"
                  className={inputClass}
                  disabled={loading}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Website URL
                </label>

                <input
                  value={form.websiteUrl}
                  name="websiteUrl"
                  onChange={handleChange}
                  placeholder="https://streamnepal.com"
                  className={inputClass}
                  disabled={loading}
                />
              </div>
            </div>
          </section>

          {/* MEDIA */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Media
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Logo
                </label>

                <ImageUpload
                  value={form.logo}
                  folder="tournaments"
                  onChange={(result) =>
                    setForm((previous) => ({
                      ...previous,
                      logo: result?.url ?? "",
                    }))
                  }
                  disabled={loading}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Banner
                </label>

                <ImageUpload
                  value={form.banner}
                  folder="tournaments"
                  onChange={(result) =>
                    setForm((previous) => ({
                      ...previous,
                      banner: result?.url ?? "",
                    }))
                  }
                  disabled={loading}
                />
              </div>
            </div>
          </section>

          {/* CONTENT */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Content
            </h3>

            <div>
              <label className={labelClass}>
                Description
              </label>

              <textarea
                value={form.description}
                name="description"
                onChange={handleChange}
                rows={4}
                placeholder="About this tournament..."
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white"
                disabled={loading}
              />
            </div>

            <div>
              <label className={labelClass}>
                Rules
              </label>

              <textarea
                value={form.rules}
                name="rules"
                onChange={handleChange}
                rows={4}
                placeholder="Rules, format, points..."
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white"
                disabled={loading}
              />
            </div>
          </section>

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
              disabled={
                loading ||
                !form.name.trim() ||
                !form.slug.trim() ||
                !form.organizer.trim()
              }
              className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
            >
              {loading
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Create Tournament"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}