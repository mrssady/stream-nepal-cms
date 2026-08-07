"use client";

import { useEffect, useState } from "react";

import {
  CreatePlayerDto,
  Player,
  UpdatePlayerDto,
} from "@/services/player";

type PlayerModalProps = {
  open: boolean;
  mode: "create" | "edit";
  loading: boolean;
  initialData?: Player | null;
  onClose: () => void;
  onSubmit: (
    data: CreatePlayerDto | UpdatePlayerDto,
  ) => Promise<void>;
};

const INITIAL_FORM: CreatePlayerDto = {
  name: "",
  gameName: "",
  teamId: "",
};

export default function PlayerModal({
  open,
  mode,
  loading,
  initialData,
  onClose,
  onSubmit,
}: PlayerModalProps) {
  const [form, setForm] =
    useState<CreatePlayerDto>(INITIAL_FORM);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialData) {
      setForm({
        name: initialData.name,
        gameName: initialData.gameName,
        teamId: initialData.teamId ?? "",
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [open, mode, initialData]);

  if (!open) return null;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>,
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
              ? "Create Player"
              : "Edit Player"}
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-6"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">
              Full Name
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
              In-Game Name
            </label>

            <input
              required
              name="gameName"
              value={form.gameName}
              onChange={handleChange}
              className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Team ID
            </label>

            <input
              name="teamId"
              value={form.teamId}
              onChange={handleChange}
              placeholder="Optional"
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
                ? "Create Player"
                : "Update Player"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}