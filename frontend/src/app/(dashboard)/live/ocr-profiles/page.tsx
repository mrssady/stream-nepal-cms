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
  RotateCcw,
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
  type OcrRoiConfig,
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

// Built-in ROI template (PUBG Mobile 1920x1080 spectator HUD) —
// mirrors the backend ocr-config.ts template.
const ROIS_TEMPLATE: Record<string, OcrRoiConfig> = {
  matchHeader: {
    x: 0,
    y: 0,
    width: 300,
    height: 65,
    enabled: true,
    ocr: true,
    label: "Match header",
    purpose: "Remaining players + observed team count",
    preprocessing: { scale: 2, grayscale: true, contrast: 1.5, threshold: 120, denoise: false },
  },
  teamEliminations: {
    x: 0,
    y: 45,
    width: 250,
    height: 35,
    enabled: true,
    ocr: true,
    label: "Team eliminations",
    purpose: "Informational elimination counter (not primary placement source)",
    preprocessing: { scale: 2, grayscale: true, contrast: 1.5, threshold: 120, denoise: false },
  },
  observerPlayerList: {
    x: 0,
    y: 75,
    width: 260,
    height: 180,
    enabled: true,
    ocr: true,
    label: "Observer player list",
    purpose: "Currently observed team/player markers",
    preprocessing: { scale: 2, grayscale: true, contrast: 1.5, threshold: 140, denoise: false },
  },
  killFeed: {
    x: 0,
    y: 250,
    width: 500,
    height: 300,
    enabled: false,
    ocr: true,
    label: "Kill feed",
    purpose: "Kill/elimination events - disabled until confirmed on real footage",
    preprocessing: { scale: 2, grayscale: true, contrast: 1.5, threshold: 120, denoise: false },
  },
  minimap: {
    x: 1740,
    y: 0,
    width: 180,
    height: 180,
    enabled: false,
    ocr: false,
    label: "Minimap",
    purpose: "Computer vision (markers / zone). Ignored for OCR MVP.",
    preprocessing: { scale: 1, grayscale: false, contrast: 1, threshold: 0, denoise: false },
  },
  zoneInfo: {
    x: 1730,
    y: 145,
    width: 190,
    height: 90,
    enabled: true,
    ocr: true,
    label: "Zone / stage information",
    purpose: "Zone timer + stage number (optional match state)",
    preprocessing: { scale: 3, grayscale: true, contrast: 1.6, threshold: 140, denoise: false },
  },
  currentTeam: {
    x: 580,
    y: 735,
    width: 380,
    height: 100,
    enabled: true,
    ocr: true,
    label: "Current observed team",
    purpose: "Observer \"Teams N\" counter + current team tag (observerTeamsValue)",
    preprocessing: { scale: 2, grayscale: true, contrast: 1.5, threshold: 120, denoise: false },
  },
  playerStats: {
    x: 950,
    y: 760,
    width: 300,
    height: 150,
    enabled: true,
    ocr: true,
    label: "Player statistics",
    purpose: "Eliminations / damage / assists of observed player",
    preprocessing: { scale: 2, grayscale: true, contrast: 1.5, threshold: 120, denoise: false },
  },
};

const ROI_ORDER = Object.keys(ROIS_TEMPLATE);

type RoiFormValue = {
  x: string;
  y: string;
  width: string;
  height: string;
  enabled: boolean;
  ocr: boolean;
  preprocessing: Record<string, unknown>;
};

type RoiFormMap = Record<string, RoiFormValue>;

type ProfileFormState = {
  game: TournamentGame;
  name: string;
  width: string;
  height: string;
  isDefault: boolean;
  rois: RoiFormMap;
};

// Merge stored config over the built-in template so unknown/partial
// ROIs degrade gracefully (matches backend normalizeOcrConfig).
function normalizeRois(input: unknown, fallback: RoiFormMap): RoiFormMap {
  const source =
    input && typeof input === "object" && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};

  const normalized: RoiFormMap = { ...fallback };

  for (const key of Object.keys(source)) {
    const value = source[key];

    if (!value || typeof value !== "object" || Array.isArray(value)) {
      continue;
    }

    const roi = value as Record<string, unknown>;
    const template = ROIS_TEMPLATE[key];
    const base = template
      ? (fallback[key] ?? toRoiValue(template))
      : {
          x: "0",
          y: "0",
          width: "100",
          height: "50",
          enabled: true,
          ocr: true,
          preprocessing: {},
        };

    normalized[key] = {
      x: String(roi.x ?? base.x),
      y: String(roi.y ?? base.y),
      width: String(roi.width ?? base.width),
      height: String(roi.height ?? base.height),
      enabled: toBool(roi.enabled, base.enabled),
      ocr: toBool(roi.ocr, base.ocr),
      preprocessing:
        roi.preprocessing &&
        typeof roi.preprocessing === "object" &&
        !Array.isArray(roi.preprocessing)
          ? (roi.preprocessing as Record<string, unknown>)
          : base.preprocessing,
    };
  }

  return normalized;
}

function toRoiValue(roi: OcrRoiConfig): RoiFormValue {
  return {
    x: String(roi.x),
    y: String(roi.y),
    width: String(roi.width),
    height: String(roi.height),
    enabled: roi.enabled,
    ocr: roi.ocr,
    preprocessing: { ...roi.preprocessing },
  };
}

function toBool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function emptyForm(game: TournamentGame = "PUBG_MOBILE"): ProfileFormState {
  const rois: RoiFormMap = {};

  for (const key of ROI_ORDER) {
    rois[key] = toRoiValue(ROIS_TEMPLATE[key]);
  }

  return {
    game,
    name: "",
    width: "1920",
    height: "1080",
    isDefault: false,
    rois,
  };
}

function intOrNull(value: string): number | null {
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}

function buildConfig(form: ProfileFormState): CreateOcrProfileDto["config"] {
  const width = intOrNull(form.width) ?? 1920;
  const height = intOrNull(form.height) ?? 1080;

  const rois: Record<string, OcrRoiConfig> = {};

  for (const key of ROI_ORDER) {
    const roi = form.rois[key];
    const template = ROIS_TEMPLATE[key];

    if (!roi || !template) {
      continue;
    }

    rois[key] = {
      ...template,
      x: intOrNull(roi.x) ?? template.x,
      y: intOrNull(roi.y) ?? template.y,
      width: Math.max(1, intOrNull(roi.width) ?? template.width),
      height: Math.max(1, intOrNull(roi.height) ?? template.height),
      enabled: roi.enabled,
      ocr: roi.ocr,
      preprocessing: { ...roi.preprocessing },
    };
  }

  return {
    resolution: { width, height },
    rois,
    preprocessing: {},
  };
}

function validateForm(form: ProfileFormState): string | null {
  if (!form.name.trim()) {
    return "Profile name is required";
  }

  if (intOrNull(form.width) === null || Number(form.width) < 1) {
    return "Width must be a positive integer";
  }

  if (intOrNull(form.height) === null || Number(form.height) < 1) {
    return "Height must be a positive integer";
  }

  for (const key of ROI_ORDER) {
    const roi = form.rois[key];

    if (!roi) {
      continue;
    }

    const check: Array<[string, number | null]> = [
      ["x", intOrNull(roi.x)],
      ["y", intOrNull(roi.y)],
      ["width", intOrNull(roi.width)],
      ["height", intOrNull(roi.height)],
    ];

    for (const [field, value] of check) {
      if (value === null || value < 0) {
        return `${ROIS_TEMPLATE[key].label}: ${field} must be a non-negative integer`;
      }
    }
  }

  return null;
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
  const [createForm, setCreateForm] = useState<ProfileFormState>(emptyForm());
  const [createBusy, setCreateBusy] = useState(false);

  const [editing, setEditing] = useState<OcrProfile | null>(null);
  const [editForm, setEditForm] = useState<ProfileFormState | null>(null);
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

  async function handleCreate() {
    setCreateBusy(true);

    const validation = validateForm(createForm);
    if (validation) {
      report({ kind: "err", text: validation });
      setCreateBusy(false);
      return;
    }

    try {
      const dto: CreateOcrProfileDto = {
        game: createForm.game,
        name: createForm.name.trim(),
        width: intOrNull(createForm.width) ?? 1920,
        height: intOrNull(createForm.height) ?? 1080,
        config: buildConfig(createForm),
        isDefault: createForm.isDefault,
      };

      await createOcrProfile(dto);
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
      isDefault: profile.isDefault,
      rois: tokenRois(profile.config?.rois),
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
      await updateOcrProfile(editing.id, {
        name: editForm.name.trim(),
        width: intOrNull(editForm.width) ?? editing.width,
        height: intOrNull(editForm.height) ?? editing.height,
        config: buildConfig(editForm),
      });
      setEditing(null);
      setEditForm(null);
      report({ kind: "ok", text: "OCR profile updated" });
      await fetchProfiles();
    } catch (err) {
      report({ kind: "err", text: errorMessage(err) });
    } finally {
      setEditBusy(false);
    }
  }

  function resetRois(form: ProfileFormState, set: (f: ProfileFormState) => void) {
    const rois: RoiFormMap = {};

    for (const key of ROI_ORDER) {
      rois[key] = toRoiValue(ROIS_TEMPLATE[key]);
    }

    set({
      ...form,
      rois,
    });
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
            Per-game screen-analysis calibration — PUBG Mobile spectator HUD ROI layout works at 1920×1080 and scales to any source
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
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Create OCR Profile</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => resetRois(createForm, setCreateForm)}
            >
              <RotateCcw className="size-4" />
              Reset ROI layout
            </Button>
          </div>
          <RoiEditor
            form={createForm}
            onChange={setCreateForm}
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
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
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Edit OCR Profile — {editing.name}</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => resetRois(editForm, setEditForm)}
            >
              <RotateCcw className="size-4" />
              Reset ROI layout
            </Button>
          </div>
          <RoiEditor
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
            Create a profile for the game to calibrate the screen-analysis layout.
          </p>
        </div>
      )}

      {!loading && profiles.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => {
            const rois = tokenRois(profile.config?.rois);
            const enabledCount = Object.values(rois).filter(
              (roi) => roi.enabled && roi.ocr,
            ).length;

            return (
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
                    {enabledCount} OCR ROI
                    {enabledCount === 1 ? "" : "s"}
                  </Badge>
                </div>

                <div className="mt-auto flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    disabled={profile.isDefault || busyId === profile.id}
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
            );
          })}
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

function tokenRois(source: unknown): RoiFormMap {
  const fallback: RoiFormMap = {};

  for (const key of ROI_ORDER) {
    fallback[key] = toRoiValue(ROIS_TEMPLATE[key]);
  }

  return normalizeRois(source, fallback);
}

function humanize(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// ------------------------------------------------------------
// Structured ROI editor
// ------------------------------------------------------------

function RoiEditor({
  form,
  onChange,
}: {
  form: ProfileFormState;
  onChange: (form: ProfileFormState) => void;
}) {
  function update(patch: Partial<ProfileFormState>) {
    onChange({
      ...form,
      ...patch,
    });
  }

  function updateRoi(key: string, patch: Partial<RoiFormValue>) {
    onChange({
      ...form,
      rois: {
        ...form.rois,
        [key]: {
          ...form.rois[key],
          ...patch,
        },
      },
    });
  }

  function updatePreprocessing(
    key: string,
    field: string,
    value: unknown,
  ) {
    const roi = form.rois[key] ?? form.rois[ROI_ORDER[0]];

    updateRoi(key, {
      preprocessing: {
        ...roi.preprocessing,
        [field]: value,
      },
    });
  }

  const preview = JSON.stringify(buildConfig(form), null, 2);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            placeholder="PUBG Mobile Spectator HUD"
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
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          ROI layout (reference coordinate space, scaled to capture)
        </label>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-3 py-2 text-left font-medium">ROI</th>
                <th className="px-2 py-2 text-center font-medium">X</th>
                <th className="px-2 py-2 text-center font-medium">Y</th>
                <th className="px-2 py-2 text-center font-medium">W</th>
                <th className="px-2 py-2 text-center font-medium">H</th>
                <th className="px-2 py-2 text-center font-medium">OCR</th>
                <th className="px-3 py-2 text-left font-medium">
                  Preprocessing
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ROI_ORDER.map((key) => {
                const roi = form.rois[key];
                const template = ROIS_TEMPLATE[key];

                if (!roi || !template) {
                  return null;
                }

                const pre = roi.preprocessing as {
                  scale?: number;
                  grayscale?: boolean;
                  contrast?: number;
                  threshold?: number;
                  denoise?: boolean;
                };

                return (
                  <tr key={key}>
                    <td className="px-3 py-2 align-top">
                      <p className="font-medium">{template.label}</p>
                      <p className="max-w-[200px] text-[11px] text-muted-foreground">
                        {template.purpose}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            className="size-3.5"
                            checked={roi.enabled}
                            onChange={(event) =>
                              updateRoi(key, {
                                enabled: event.target.checked,
                              })
                            }
                          />
                          Enabled
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            className="size-3.5"
                            checked={roi.ocr}
                            disabled={!template.ocr}
                            onChange={(event) =>
                              updateRoi(key, {
                                ocr: event.target.checked,
                              })
                            }
                          />
                          OCR
                        </label>
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <NumberCell
                        value={roi.x}
                        onChange={(value) => updateRoi(key, { x: value })}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <NumberCell
                        value={roi.y}
                        onChange={(value) => updateRoi(key, { y: value })}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <NumberCell
                        value={roi.width}
                        onChange={(value) => updateRoi(key, { width: value })}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <NumberCell
                        value={roi.height}
                        onChange={(value) => updateRoi(key, { height: value })}
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span
                        className={`text-xl ${
                          roi.enabled && roi.ocr
                            ? "text-emerald-500"
                            : "text-muted-foreground/40"
                        }`}
                      >
                        {roi.enabled && roi.ocr ? "●" : "○"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <details>
                        <summary className="cursor-pointer text-[11px] text-muted-foreground">
                          Configure
                        </summary>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                            Scale
                            <input
                              type="number"
                              min={1}
                              max={5}
                              className="h-8 w-full rounded-md border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring/20"
                              value={String(pre.scale ?? 2)}
                              onChange={(event) =>
                                updatePreprocessing(key, "scale", Number(event.target.value))
                              }
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                            Contrast
                            <input
                              type="number"
                              min={1}
                              max={5}
                              step={0.1}
                              className="h-8 w-full rounded-md border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring/20"
                              value={String(pre.contrast ?? 1.5)}
                              onChange={(event) =>
                                updatePreprocessing(key, "contrast", Number(event.target.value))
                              }
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                            Threshold
                            <input
                              type="number"
                              min={0}
                              max={255}
                              className="h-8 w-full rounded-md border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring/20"
                              value={String(pre.threshold ?? 120)}
                              onChange={(event) =>
                                updatePreprocessing(key, "threshold", Number(event.target.value))
                              }
                            />
                          </label>
                          <div className="flex items-end gap-2 pb-1 text-[11px] text-muted-foreground">
                            <label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                className="size-3.5"
                                checked={Boolean(pre.grayscale)}
                                onChange={(event) =>
                                  updatePreprocessing(key, "grayscale", event.target.checked)
                                }
                              />
                              Gray
                            </label>
                            <label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                className="size-3.5"
                                checked={Boolean(pre.denoise)}
                                onChange={(event) =>
                                  updatePreprocessing(key, "denoise", event.target.checked)
                                }
                              />
                              Denoise
                            </label>
                          </div>
                        </div>
                      </details>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <details>
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
          Config JSON preview
        </summary>
        <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-muted/40 p-3 font-mono text-[11px]">
          {preview}
        </pre>
      </details>
    </div>
  );
}

function NumberCell({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="number"
      min={0}
      className="h-9 w-16 rounded-md border bg-background px-2 text-center text-sm outline-none focus:ring-2 focus:ring-ring/20"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}