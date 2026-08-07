"use client";

import { useEffect, useState } from "react";

import {
  CreateEventDto,
  Event,
  UpdateEventDto,
} from "@/services/event";

type EventModalProps = {
  open: boolean;
  mode: "create" | "edit";
  loading: boolean;
  initialData?: Event | null;
  onClose: () => void;
  onSubmit: (
    data: CreateEventDto | UpdateEventDto,
  ) => Promise<void>;
};

const INITIAL_FORM: CreateEventDto = {
  title: "",
  game: "",
  location: "",
  startDate: "",
  endDate: "",
};

export default function EventModal({
  open,
  mode,
  loading,
  initialData,
  onClose,
  onSubmit,
}: EventModalProps) {
  const [form, setForm] =
    useState<CreateEventDto>(INITIAL_FORM);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialData) {
      setForm({
        title: initialData.title,
        game: initialData.game,
        location: initialData.location,
        startDate: initialData.startDate,
        endDate: initialData.endDate,
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [open, mode, initialData]);

  if (!open) return null;

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement
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
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        <div className="border-b px-6 py-4">
          <h2 className="text-xl font-semibold">
            {mode === "create"
              ? "Create Event"
              : "Edit Event"}
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-6"
        >
          <input
            required
            name="title"
            placeholder="Event Title"
            value={form.title}
            onChange={handleChange}
            className="w-full rounded-xl border px-3 py-2"
          />

          <input
            required
            name="game"
            placeholder="Game"
            value={form.game}
            onChange={handleChange}
            className="w-full rounded-xl border px-3 py-2"
          />

          <input
            required
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            className="w-full rounded-xl border px-3 py-2"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              required
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="rounded-xl border px-3 py-2"
            />

            <input
              required
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className="rounded-xl border px-3 py-2"
            />
          </div>

          <div className="flex justify-end gap-3">
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
              className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {loading
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
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