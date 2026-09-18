"use client";

import { useState } from "react";

import ImageUpload from "@/components/media/ImageUpload";

import type {
  CreateTeamMemberDto,
  Department,
  TeamMember,
  TeamPosition,
  UpdateTeamMemberDto,
} from "@/types/team-member";

const DEPARTMENTS: Department[] = [
  "MANAGEMENT",
  "ESPORTS",
  "BROADCAST",
  "PRODUCTION",
  "MEDIA",
  "MARKETING",
];

const POSITIONS: TeamPosition[] = [
  "OWNER",
  "CO_OWNER",
  "MANAGER",
  "OBSERVER",
  "CASTER",
  "HOST",
  "CAMERA_OPERATOR",
  "GRAPHICS_OPERATOR",
  "VIDEO_EDITOR",
  "SOCIAL_MEDIA_MANAGER",
  "TOURNAMENT_ADMIN",
  "REFEREE",
];

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
}

type TeamMemberModalProps = {
  open: boolean;
  mode: "create" | "edit";
  loading?: boolean;
  initialData?: TeamMember | null;
  onClose: () => void;
  onSubmit: (
    data:
      | CreateTeamMemberDto
      | UpdateTeamMemberDto,
  ) => void;
};

function buildForm(initialData?: TeamMember | null) {
  return {
    fullName: initialData?.fullName ?? "",
    nickname: initialData?.nickname ?? "",
    position: initialData?.position ?? "MANAGER",
    department: initialData?.department ?? "MANAGEMENT",
    bio: initialData?.bio ?? "",
    profileImage: initialData?.profileImage ?? "",
    facebook: initialData?.facebook ?? "",
    instagram: initialData?.instagram ?? "",
    youtube: initialData?.youtube ?? "",
    discord: initialData?.discord ?? "",
    phone: initialData?.phone ?? "",
    email: initialData?.email ?? "",
    displayOrder: initialData?.displayOrder?.toString() ?? "0",
    isActive: initialData?.isActive ?? true,
  };
}

export default function TeamMemberModal({
  open,
  mode,
  loading = false,
  initialData,
  onClose,
  onSubmit,
}: TeamMemberModalProps) {
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
      [name]:
        name === "isActive" ? value === "true" : value,
    }));
  }

  function handleCheckboxChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setForm((previous) => ({
      ...previous,
      isActive: event.target.checked,
    }));
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const { fullName, displayOrder, ...rest } = form;

    if (!fullName.trim()) {
      return;
    }

    onSubmit({
      fullName: fullName.trim(),
      displayOrder: Number(displayOrder) || 0,
      ...rest,
    });
  }

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl dark:border dark:border-border dark:bg-card">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-border">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {mode === "create"
              ? "Add Team Member"
              : "Edit Team Member"}
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage the Stream Nepal crew
            shown on the public website.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Full Name
            </label>

            <input
              value={form.fullName}
              name="fullName"
              onChange={handleChange}
              placeholder="Jane Doe"
              className={inputClass}
              disabled={loading}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Nickname
              </label>

              <input
                value={form.nickname}
                name="nickname"
                onChange={handleChange}
                placeholder="PDX"
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Position
              </label>

              <select
                value={form.position}
                name="position"
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              >
                {POSITIONS.map((position) => (
                  <option key={position} value={position}>
                    {formatLabel(position)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Department
              </label>

              <select
                value={form.department}
                name="department"
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              >
                {DEPARTMENTS.map((department) => (
                  <option key={department} value={department}>
                    {formatLabel(department)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Bio
            </label>

            <textarea
              value={form.bio}
              name="bio"
              onChange={handleChange}
              rows={3}
              placeholder="Short bio about this crew member."
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white"
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Profile Image
            </label>

            <ImageUpload
              value={form.profileImage}
              folder="team"
              onChange={(result) =>
                setForm((previous) => ({
                  ...previous,
                  profileImage: result?.url ?? "",
                }))
              }
              disabled={loading}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Phone
              </label>

              <input
                value={form.phone}
                name="phone"
                onChange={handleChange}
                placeholder="+977 98..."
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>

              <input
                value={form.email}
                name="email"
                type="email"
                onChange={handleChange}
                placeholder="crew@streamnepal.com"
                className={inputClass}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Social Links
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={form.facebook}
                name="facebook"
                onChange={handleChange}
                placeholder="Facebook URL"
                className={inputClass}
                disabled={loading}
              />

              <input
                value={form.instagram}
                name="instagram"
                onChange={handleChange}
                placeholder="Instagram URL"
                className={inputClass}
                disabled={loading}
              />

              <input
                value={form.youtube}
                name="youtube"
                onChange={handleChange}
                placeholder="YouTube URL"
                className={inputClass}
                disabled={loading}
              />

              <input
                value={form.discord}
                name="discord"
                onChange={handleChange}
                placeholder="Discord handle"
                className={inputClass}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 dark:border-border">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={handleCheckboxChange}
                disabled={loading}
              />

              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Active
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 dark:border-border">
              <input
                type="number"
                min={0}
                value={form.displayOrder}
                name="displayOrder"
                onChange={handleChange}
                className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none dark:border-border dark:bg-muted dark:text-white"
                disabled={loading}
              />

              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Display Order
              </span>
            </label>
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
              disabled={loading || !form.fullName.trim()}
              className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
            >
              {loading
                ? "Saving..."
                : mode === "create"
                  ? "Add Member"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}