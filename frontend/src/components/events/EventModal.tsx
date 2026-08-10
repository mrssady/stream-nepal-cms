"use client";

import { useEffect, useState } from "react";

import {
  type CreateTournamentDto,
  type Tournament,
  type TournamentGame,
  type TournamentStatus,
  type UpdateTournamentDto,
} from "@/types/tournament";

type EventModalProps = {
  open: boolean;
  mode: "create" | "edit";
  loading: boolean;
  initialData?: Tournament | null;
  onClose: () => void;
  onSubmit: (
    data:
      | CreateTournamentDto
      | UpdateTournamentDto,
  ) => Promise<void>;
};

const INITIAL_FORM: CreateTournamentDto = {
  name: "",
  slug: "",
  game: "PUBG_MOBILE",
  logo: "",
  banner: "",
  description: "",
  rules: "",
  organizer: "",
  registrationFee: 0,
  prizePool: "",
  maxTeams: 1,
  currentTeams: 0,
  registrationOpen: "",
  registrationClose: "",
  tournamentStart: "",
  tournamentEnd: "",
  discordUrl: "",
  whatsappUrl: "",
  streamUrl: "",
  websiteUrl: "",
  featured: false,
  isPublic: true,
  status: "DRAFT",
};

const GAME_OPTIONS: {
  value: TournamentGame;
  label: string;
}[] = [
  {
    value: "PUBG_MOBILE",
    label: "PUBG Mobile",
  },
  {
    value: "FREE_FIRE",
    label: "Free Fire",
  },
  {
    value: "VALORANT",
    label: "Valorant",
  },
  {
    value: "CS2",
    label: "CS2",
  },
  {
    value: "DOTA2",
    label: "Dota 2",
  },
  {
    value: "EA_FC",
    label: "EA FC",
  },
  {
    value: "EFOOTBALL",
    label: "eFootball",
  },
  {
    value: "MOBILE_LEGENDS",
    label: "Mobile Legends",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

const STATUS_OPTIONS: {
  value: TournamentStatus;
  label: string;
}[] = [
  {
    value: "DRAFT",
    label: "Draft",
  },
  {
    value: "PUBLISHED",
    label: "Published",
  },
  {
    value: "REGISTRATION_OPEN",
    label: "Registration Open",
  },
  {
    value: "REGISTRATION_CLOSED",
    label: "Registration Closed",
  },
  {
    value: "LIVE",
    label: "Live",
  },
  {
    value: "COMPLETED",
    label: "Completed",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
  },
];

function formatDateTimeLocal(
  value: string | null | undefined,
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  const hours = String(
    date.getHours(),
  ).padStart(2, "0");

  const minutes = String(
    date.getMinutes(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function EventModal({
  open,
  mode,
  loading,
  initialData,
  onClose,
  onSubmit,
}: EventModalProps) {
  const [form, setForm] =
    useState<CreateTournamentDto>(
      INITIAL_FORM,
    );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (
      mode === "edit" &&
      initialData
    ) {
      setForm({
        name: initialData.name,
        slug: initialData.slug,
        game: initialData.game,
        logo: initialData.logo ?? "",
        banner:
          initialData.banner ?? "",
        description:
          initialData.description ?? "",
        rules:
          initialData.rules ?? "",
        organizer:
          initialData.organizer,
        registrationFee:
          initialData.registrationFee,
        prizePool:
          initialData.prizePool ?? "",
        maxTeams:
          initialData.maxTeams,
        currentTeams:
          initialData.currentTeams,
        registrationOpen:
          formatDateTimeLocal(
            initialData.registrationOpen,
          ),
        registrationClose:
          formatDateTimeLocal(
            initialData.registrationClose,
          ),
        tournamentStart:
          formatDateTimeLocal(
            initialData.tournamentStart,
          ),
        tournamentEnd:
          formatDateTimeLocal(
            initialData.tournamentEnd,
          ),
        discordUrl:
          initialData.discordUrl ?? "",
        whatsappUrl:
          initialData.whatsappUrl ?? "",
        streamUrl:
          initialData.streamUrl ?? "",
        websiteUrl:
          initialData.websiteUrl ?? "",
        featured:
          initialData.featured,
        isPublic:
          initialData.isPublic,
        status:
          initialData.status,
      });
    } else {
      setForm({
        ...INITIAL_FORM,
      });
    }
  }, [
    open,
    mode,
    initialData,
  ]);

  if (!open) {
    return null;
  }

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const {
      name,
      value,
      type,
    } = event.target;

    if (type === "checkbox") {
      const checked = (
        event.target as HTMLInputElement
      ).checked;

      setForm((previous) => ({
        ...previous,
        [name]: checked,
      }));

      return;
    }

    if (
      name === "registrationFee"
    ) {
      setForm((previous) => ({
        ...previous,
        registrationFee:
          Number(value),
      }));

      return;
    }

    if (
      name === "maxTeams" ||
      name === "currentTeams"
    ) {
      setForm((previous) => ({
        ...previous,
        [name]: Number(value),
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    await onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold text-slate-900">
            {mode === "create"
              ? "Create Event"
              : "Edit Event"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage tournament and event
            information.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Event Name
              </label>

              <input
                required
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="PUBG Mobile Championship"
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Slug
              </label>

              <input
                required
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="pubg-mobile-championship"
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Game
              </label>

              <select
                required
                name="game"
                value={form.game}
                onChange={handleChange}
                className="w-full rounded-xl border bg-white px-3 py-2 outline-none focus:border-blue-500"
              >
                {GAME_OPTIONS.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Organizer
              </label>

              <input
                required
                name="organizer"
                value={
                  form.organizer
                }
                onChange={handleChange}
                placeholder="Stream Nepal"
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Status
              </label>

              <select
                name="status"
                value={
                  form.status ??
                  "DRAFT"
                }
                onChange={handleChange}
                className="w-full rounded-xl border bg-white px-3 py-2 outline-none focus:border-blue-500"
              >
                {STATUS_OPTIONS.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Logo URL
              </label>

              <input
                name="logo"
                value={
                  form.logo ?? ""
                }
                onChange={handleChange}
                placeholder="https://..."
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Banner URL
              </label>

              <input
                name="banner"
                value={
                  form.banner ?? ""
                }
                onChange={handleChange}
                placeholder="https://..."
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>

            <textarea
              name="description"
              rows={4}
              value={
                form.description ?? ""
              }
              onChange={handleChange}
              placeholder="Event description"
              className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Rules
            </label>

            <textarea
              name="rules"
              rows={4}
              value={
                form.rules ?? ""
              }
              onChange={handleChange}
              placeholder="Tournament rules"
              className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Registration Fee
              </label>

              <input
                type="number"
                min="0"
                name="registrationFee"
                value={
                  form.registrationFee ??
                  0
                }
                onChange={handleChange}
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Prize Pool
              </label>

              <input
                name="prizePool"
                value={
                  form.prizePool ?? ""
                }
                onChange={handleChange}
                placeholder="Rs. 100,000"
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Maximum Teams
              </label>

              <input
                required
                type="number"
                min="1"
                name="maxTeams"
                value={
                  form.maxTeams
                }
                onChange={handleChange}
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Registration Open
              </label>

              <input
                required
                type="datetime-local"
                name="registrationOpen"
                value={
                  form.registrationOpen
                }
                onChange={handleChange}
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Registration Close
              </label>

              <input
                required
                type="datetime-local"
                name="registrationClose"
                value={
                  form.registrationClose
                }
                onChange={handleChange}
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Tournament Start
              </label>

              <input
                required
                type="datetime-local"
                name="tournamentStart"
                value={
                  form.tournamentStart
                }
                onChange={handleChange}
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Tournament End
              </label>

              <input
                required
                type="datetime-local"
                name="tournamentEnd"
                value={
                  form.tournamentEnd
                }
                onChange={handleChange}
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Discord URL
              </label>

              <input
                type="url"
                name="discordUrl"
                value={
                  form.discordUrl ?? ""
                }
                onChange={handleChange}
                placeholder="https://discord.gg/..."
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                WhatsApp URL
              </label>

              <input
                type="url"
                name="whatsappUrl"
                value={
                  form.whatsappUrl ?? ""
                }
                onChange={handleChange}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Stream URL
              </label>

              <input
                type="url"
                name="streamUrl"
                value={
                  form.streamUrl ?? ""
                }
                onChange={handleChange}
                placeholder="https://..."
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Website URL
              </label>

              <input
                type="url"
                name="websiteUrl"
                value={
                  form.websiteUrl ?? ""
                }
                onChange={handleChange}
                placeholder="https://..."
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                checked={
                  form.featured ??
                  false
                }
                onChange={handleChange}
              />

              <span className="text-sm">
                Featured
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isPublic"
                checked={
                  form.isPublic ??
                  true
                }
                onChange={handleChange}
              />

              <span className="text-sm">
                Public
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border px-5 py-2 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : mode === "create"
                  ? "Create Event"
                  : "Update Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}