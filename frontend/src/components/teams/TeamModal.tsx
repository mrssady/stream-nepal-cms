"use client";

import { useEffect, useState } from "react";

import {
  CreateTeamDto,
  Team,
  UpdateTeamDto,
} from "@/services/team";

type TeamModalProps = {
  open: boolean;
  mode: "create" | "edit";
  loading: boolean;
  initialData?: Team | null;
  onClose: () => void;
  onSubmit: (
    data: CreateTeamDto | UpdateTeamDto,
  ) => Promise<void>;
};

const INITIAL_FORM: CreateTeamDto = {
  name: "",
  logo: "",
  description: "",
};

export default function TeamModal({
  open,
  mode,
  loading,
  initialData,
  onClose,
  onSubmit,
}: TeamModalProps) {
  const [form, setForm] =
    useState<CreateTeamDto>(INITIAL_FORM);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialData) {
      setForm({
        name: initialData.name,
        logo: initialData.logo ?? "",
        description:
          initialData.description ?? "",
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [open, mode, initialData]);

  if (!open) return null;

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    await onSubmit(form);

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="border-b px-6 py-4">
          <h2 className="text-xl font-semibold">
            {mode === "create"
              ? "Create Team"
              : "Edit Team"}
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-6"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">
              Team Name
            </label>

            <input
              required
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Logo URL
            </label>

            <input
              name="logo"
              value={form.logo}
              onChange={handleChange}
              className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>

            <textarea
              rows={4}
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                ? "Create Team"
                : "Update Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}