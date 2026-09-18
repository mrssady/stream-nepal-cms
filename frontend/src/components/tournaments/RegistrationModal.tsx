"use client";

import { useState } from "react";

import ImageUpload from "@/components/media/ImageUpload";

import type {
  CreateRegistrationDto,
  PaymentStatus,
  Registration,
  RegistrationStatus,
  UpdateRegistrationDto,
} from "@/types/registration";

const PAYMENT_STATUSES: PaymentStatus[] = [
  "UNPAID",
  "PENDING",
  "PAID",
  "REFUNDED",
];

const REGISTRATION_STATUSES: RegistrationStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "WAITLIST",
];

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
}

type RegistrationFormState = {
  teamName: string;
  teamLogo: string;
  captainName: string;
  captainEmail: string;
  captainPhone: string;
  managerName: string;
  managerPhone: string;
  discordUsername: string;
  gameUID: string;
  gameIGN: string;
  rosterSize: string;
  paymentStatus: PaymentStatus;
  registrationStatus: RegistrationStatus;
  remarks: string;
};

function buildForm(
  registration?: Registration | null,
): RegistrationFormState {
  return {
    teamName: registration?.teamName ?? "",
    teamLogo: registration?.teamLogo ?? "",
    captainName: registration?.captainName ?? "",
    captainEmail: registration?.captainEmail ?? "",
    captainPhone: registration?.captainPhone ?? "",
    managerName: registration?.managerName ?? "",
    managerPhone: registration?.managerPhone ?? "",
    discordUsername: registration?.discordUsername ?? "",
    gameUID: registration?.gameUID ?? "",
    gameIGN: registration?.gameIGN ?? "",
    rosterSize: registration?.rosterSize?.toString() ?? "4",
    paymentStatus: registration?.paymentStatus ?? "UNPAID",
    registrationStatus: registration?.registrationStatus ?? "PENDING",
    remarks: registration?.remarks ?? "",
  };
}

type RegistrationModalProps = {
  open: boolean;
  mode: "create" | "edit";
  loading?: boolean;
  tournamentId?: string;
  initialData?: Registration | null;
  onClose: () => void;
  onSubmit: (
    data:
      | CreateRegistrationDto
      | UpdateRegistrationDto,
  ) => void;
};

export default function RegistrationModal({
  open,
  mode,
  loading = false,
  tournamentId,
  initialData,
  onClose,
  onSubmit,
}: RegistrationModalProps) {
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

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !form.teamName.trim() ||
      !form.captainName.trim() ||
      !form.captainEmail.trim() ||
      !form.captainPhone.trim() ||
      !form.gameUID.trim() ||
      !form.gameIGN.trim()
    ) {
      return;
    }

    const payload = {
      teamName: form.teamName.trim(),
      teamLogo: form.teamLogo.trim() || undefined,
      captainName: form.captainName.trim(),
      captainEmail: form.captainEmail.trim(),
      captainPhone: form.captainPhone.trim(),
      managerName: form.managerName.trim() || undefined,
      managerPhone: form.managerPhone.trim() || undefined,
      discordUsername: form.discordUsername.trim() || undefined,
      gameUID: form.gameUID.trim(),
      gameIGN: form.gameIGN.trim(),
      rosterSize: Number(form.rosterSize) || 1,
      paymentStatus: form.paymentStatus,
      registrationStatus: form.registrationStatus,
      remarks: form.remarks.trim() || undefined,
    };

    if (mode === "create") {
      onSubmit({
        ...payload,
        tournamentId,
      } as CreateRegistrationDto);
    } else {
      onSubmit(payload as UpdateRegistrationDto);
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
              ? "Add Registration"
              : "Edit Registration"}
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Register a team for this
            tournament.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          <div>
            <label className={labelClass}>
              Team Name
            </label>

            <input
              value={form.teamName}
              name="teamName"
              onChange={handleChange}
              placeholder="Nepal Warriors"
              className={inputClass}
              disabled={loading}
            />
          </div>

          <div>
            <label className={labelClass}>
              Team Logo
            </label>

            <ImageUpload
              value={form.teamLogo}
              folder="teams"
              onChange={(result) =>
                setForm((previous) => ({
                  ...previous,
                  teamLogo: result?.url ?? "",
                }))
              }
              disabled={loading}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>
                Captain Name
              </label>

              <input
                value={form.captainName}
                name="captainName"
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div>
              <label className={labelClass}>
                Captain Email
              </label>

              <input
                type="email"
                value={form.captainEmail}
                name="captainEmail"
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div>
              <label className={labelClass}>
                Captain Phone
              </label>

              <input
                value={form.captainPhone}
                name="captainPhone"
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                Manager Name
              </label>

              <input
                value={form.managerName}
                name="managerName"
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div>
              <label className={labelClass}>
                Manager Phone
              </label>

              <input
                value={form.managerPhone}
                name="managerPhone"
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>
                Game UID
              </label>

              <input
                value={form.gameUID}
                name="gameUID"
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div>
              <label className={labelClass}>
                Game IGN
              </label>

              <input
                value={form.gameIGN}
                name="gameIGN"
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div>
              <label className={labelClass}>
                Roster Size
              </label>

              <input
                type="number"
                min={1}
                value={form.rosterSize}
                name="rosterSize"
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Discord Username
            </label>

            <input
              value={form.discordUsername}
              name="discordUsername"
              onChange={handleChange}
              placeholder="discordusername"
              className={inputClass}
              disabled={loading}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                Registration Status
              </label>

              <select
                value={form.registrationStatus}
                name="registrationStatus"
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              >
                {REGISTRATION_STATUSES.map(
                  (status) => (
                    <option key={status} value={status}>
                      {formatLabel(status)}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Payment Status
              </label>

              <select
                value={form.paymentStatus}
                name="paymentStatus"
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              >
                {PAYMENT_STATUSES.map(
                  (status) => (
                    <option key={status} value={status}>
                      {formatLabel(status)}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Remarks
            </label>

            <textarea
              value={form.remarks}
              name="remarks"
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
              disabled={
                loading ||
                !form.teamName.trim() ||
                !form.captainName.trim() ||
                !form.captainEmail.trim() ||
                !form.captainPhone.trim() ||
                !form.gameUID.trim() ||
                !form.gameIGN.trim()
              }
              className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
            >
              {loading
                ? "Saving..."
                : mode === "create"
                  ? "Add Registration"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}