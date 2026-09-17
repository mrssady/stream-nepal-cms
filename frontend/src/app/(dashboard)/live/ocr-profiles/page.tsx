"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  Check,
  ChevronRight,
  FileJson,
  MonitorUp,
  Pencil,
  Plus,
  RefreshCw,
  ScanLine,
  Star,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  createOcrProfile,
  deleteOcrProfile,
  getOcrProfiles,
  setDefaultOcrProfile,
  updateOcrProfile,
} from "@/services/ocrProfiles";

import {
  type CreateOcrProfileDto,
  type OcrProfile,
} from "@/types/ocr-profile";
import { type TournamentGame } from "@/types/tournament";

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

const DEFAULT_CONFIG = {
  resolution: { width: 1920, height: 1080 },
  rois: [],
  preprocessing: {},
};

type FormState = {
  game: TournamentGame;
  name: string;
  width: string;
  height: string;
  configText: string;
  isDefault: boolean;
};

function emptyForm(game: TournamentGame = "PUBG_MOBILE"): FormState {
  return {
    game,
    name: "",
    width: "1920",
    height: "1080",
    configText: JSON.stringify(DEFAULT_CONFIG, null, 2),
    isDefault: false,
  };
}

function roisInConfig(config: Record<string, unknown>): number {
  const rois = config.rois;
  return Array.isArray(rois) ? rois.length : 0;
}

export default function OcrProfilesPage() {
  const [profiles, setProfiles] = useState<OcrProfile[]>([]);
  const [filter, setFilter] = useState<TournamentGame | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(emptyForm());
  const [createBusy, setCreateBusy] = useState(false);

  const [editing, setEditing] = useState<OcrProfile | null>(null);
  const [editForm, setEditForm] = useState<FormState | null>(null);
  const [editBusy, setEditBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    try {
      const data = await getOcrProfiles(filter || undefined);
      setProfiles(data);
      setError(null);
    } catch (err) {
      setError("Failed to load OCR profiles");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfiles();
  }, [fetchProfiles]);

  function report(value: { kind: "ok" | "err"; text: string }) {
    setMessage(value);
    window.setTimeout(() => setMessage(null), 4000);
  }

  function errorMessage(err: unknown): string {
    const message =
      (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
    if (typeof message === "string") {
      return message;
    }
    return "Request failed";
  }

  function parseConfig(text: string): Record<string, unknown> {
    const parsed = JSON.parse(text) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Config must be a JSON object");
    }

    return parsed as Record<string, unknown>;
  }

  function validateForm(form: FormState): string | null {
    if (!form.name.trim()) {
      return "Profile name is required";
    }

    const width = Number(form.width);
    const height = Number(form.height);

    if (!Number.isInteger(width) || width < 1) {
      return "Width must be a positive integer";
    }

    if (!Number.isInteger(height) || height < 1) {
      return "Height must be a positive integer";
    }

    try {
      parseConfig(form.configText);
    } catch (err) {
      return err instanceof Error ? err.message : "Invalid config JSON";
    }

    return null;
  }

  function toCreateDto(form: FormState): CreateOcrProfileDto {
    return {
      game: form.game,
      name: form.name.trim(),
      width: Number(form.width),
      height: Number(form.height),
      config: parseConfig(form.configText),
      isDefault: form.isDefault,
    };
  }

  async function handleCreate() {
    setCreateBusy(true);

    const validation = validateForm(createForm);
    if (validation) {
      report({ kind: "err", text: validation });
      setCreateBusy(false);
      return;
    }

    try {
      await createOcrProfile(toCreateDto(createForm));
      setCreateOpen(false);
      setCreateForm(emptyForm(createForm.game));
      report({ kind: "ok", text: "OCR profile created" });
      await fetchProfiles();
    } catch (err) {
      report({ kind: "err", text: errorMessage(err) });
    } finally {
      setCreateBusy(false);
    }
  }

  function startEdit(profile: OcrProfile) {
    setEditing(profile);
    setEditForm({
      game: profile.game,
      name: profile.name,
      width: String(profile.width),
      height: String(profile.height),
      configText: JSON.stringify(profile.config, null, 2),
      isDefault: profile.isDefault,
    });
  }

  async function handleUpdate() {
    if (!editing || !editForm) {
      return;
    }

    setEditBusy(true);

    const validation = validateForm(editForm);
    if (validation) {
      report({ kind: "err", text: validation });
      setEditBusy(false);
      return;
    }

    try {
      const updated = await updateOcrProfile(editing.id, {
        ...toCreateDto(editForm),
        isDefault: undefined,
      });
      await fetchProfiles();
      setEditing(null);
      setEditForm(null);
      report({ kind: "ok", text: `Updated "${updated.name}"` });
    } catch (err) {
      report({ kind: "err", text: errorMessage(err) });
    } finally {
      setEditBusy(false);
    }
  }

  async function handleSetDefault(profile: OcrProfile) {
    setBusyId(profile.id);

    try {
      await setDefaultOcrProfile(profile.id);
      report({ kind: "ok", text: `"${profile.name}" is now the default` });
      await fetchProfiles();
    } catch (err) {
      report({ kind: "err", text: errorMessage(err) });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(profile: OcrProfile) {
    if (!window.confirm(`Delete OCR profile "${profile.name}"?`)) {
      return;
    }

    setBusyId(profile.id);

    try {
      await deleteOcrProfile(profile.id);
      report({ kind: "ok", text: `Deleted "${profile.name}"` });
      await fetchProfiles();
    } catch (err) {
      report({ kind: "err", text: errorMessage(err) });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">OCR Profiles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Screen-analysis calibration profiles per game (zone HUD capture)
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={fetchProfiles}>
            <RefreshCw className="size-4" />
            Refresh
          </Button>

          <Button onClick={() => setCreateOpen((value) => !value)}>
            <Plus className="size-4" />
            New Profile
          </Button>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.kind === "ok"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge
          variant={filter === "" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilter("")}
        >
          All games
        </Badge>

        {GAMES.map((game) => (
          <Badge
            key={game}
            variant={filter === game ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter(game)}
          >
            {game === "PUBG_MOBILE" ? "PUBG Mobile" : humanize(game)}
          </Badge>
        ))}
      </div>

      {createOpen && (
        <div className="rounded-xl border p-5">
          <h2 className="mb-4 font-semibold">Create OCR Profile</h2>
          <ProfileForm
            form={createForm}
            onChange={setCreateForm}
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createBusy}>
              {createBusy ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      )}

      {editing && editForm && (
        <div className="rounded-xl border p-5">
          <h2 className="mb-4 font-semibold">
            Edit OCR Profile — {editing.name}
          </h2>
          <ProfileForm
            form={editForm}
            onChange={setEditForm}
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={editBusy}>
              {editBusy ? "Saving..." : "Save"}
            </Button>
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
          Loading OCR profiles...
        </div>
      )}

      {!loading && !error && profiles.length === 0 && (
        <div className="rounded-xl border p-10 text-center">
          <p className="font-medium">No OCR profiles yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a profile for the game to calibrate the zone HUD capture.
          </p>
        </div>
      )}

      {!loading && profiles.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="flex flex-col gap-3 rounded-xl border p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{profile.name}</p>
                    {profile.isDefault && (
                      <Badge variant="default">
                        <Star className="size-3" />
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {profile.game === "PUBG_MOBILE"
                      ? "PUBG Mobile"
                      : humanize(profile.game)}
                  </p>
                </div>
                <ScanLine className="size-4 shrink-0 text-muted-foreground" />
              </div>

              <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                <Badge variant="secondary" className="gap-1">
                  <MonitorUp className="size-3" />
                  {profile.width}×{profile.height}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <FileJson className="size-3" />
                  {roisInConfig(profile.config)} ROI
                  {roisInConfig(profile.config) === 1 ? "" : "s"}
                </Badge>
              </div>

              <div className="mt-auto flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="default"
                  disabled={
                    profile.isDefault || busyId === profile.id
                  }
                  onClick={() => handleSetDefault(profile)}
                  title="Make default for this game"
                >
                  <Check className="size-4" />
                  Set default
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={busyId === profile.id}
                  onClick={() => startEdit(profile)}
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busyId === profile.id}
                  onClick={() => handleDelete(profile)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <Link
          href="/live"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="size-4 -scale-x-100" />
          Back to Live Control Center
        </Link>
      </div>
    </div>
  );
}

function humanize(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function ProfileForm({
  form,
  onChange,
}: {
  form: FormState;
  onChange: (form: FormState) => void;
}) {
  function update(patch: Partial<FormState>) {
    onChange({
      ...form,
      ...patch,
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Game</label>
        <select
          className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
          value={form.game}
          onChange={(event) =>
            update({ game: event.target.value as TournamentGame })
          }
        >
          {GAMES.map((game) => (
            <option key={game} value={game}>
              {game === "PUBG_MOBILE" ? "PUBG Mobile" : humanize(game)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Profile name
        </label>
        <input
          className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
          placeholder="PUBG Mobile 1080p"
          value={form.name}
          onChange={(event) => update({ name: event.target.value })}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Capture width
        </label>
        <input
          type="number"
          min={1}
          className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
          value={form.width}
          onChange={(event) => update({ width: event.target.value })}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Capture height
        </label>
        <input
          type="number"
          min={1}
          className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
          value={form.height}
          onChange={(event) => update({ height: event.target.value })}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2 sm:col-span-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Config (JSON)
          </label>
          <textarea
            rows={8}
            spellCheck={false}
            className="w-full rounded-lg border bg-background px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-ring/20"
            value={form.configText}
            onChange={(event) => update({ configText: event.target.value })}
          />
        </div>

        <div className="flex flex-col justify-end gap-3 rounded-lg bg-muted/30 p-4 text-xs text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">resolution</span> —
            base capture resolution (use width/height)
          </p>
          <p>
            <span className="font-medium text-foreground">rois</span> —
            screen regions captured for OCR, e.g.{" "}
            <code className="rounded bg-muted px-1">
              {"{ name: \"zone-timer\", x, y, w, h }"}
            </code>
          </p>
          <p>
            <span className="font-medium text-foreground">preprocessing</span>
            {" — per-ROI transforms applied before reading (grayscale, threshold, scale)"}
          </p>
          <p>
            ROI anchors are positions in the capture frame; real footage
            calibration will populate these.
          </p>
        </div>
      </div>
    </div>
  );
}