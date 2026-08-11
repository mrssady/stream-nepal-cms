"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  type CreateEventDto,
  type Event,
  type UpdateEventDto,
} from "@/services/event";

type EventModalProps = {
  open: boolean;
  mode: "create" | "edit";
  loading: boolean;
  initialData?: Event | null;
  onClose: () => void;
  onSubmit: (
    data:
      | CreateEventDto
      | UpdateEventDto,
  ) => Promise<void>;
};

const INITIAL_FORM: CreateEventDto = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  coverImage: "",
  category: "",
  client: "",
  organizer: "",
  location: "",
  eventDate: "",
  eventUrl: "",
  eventSeriesId: "",
  featured: false,
  isActive: true,
  displayOrder: 0,
};

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
    useState<CreateEventDto>(
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
        title: initialData.title,
        slug: initialData.slug,
        shortDescription:
          initialData.shortDescription ??
          "",
        description:
          initialData.description ??
          "",
        coverImage:
          initialData.coverImage ??
          "",
        category:
          initialData.category ??
          "",
        client:
          initialData.client ?? "",
        organizer:
          initialData.organizer ??
          "",
        location:
          initialData.location ??
          "",
        eventDate:
          formatDateTimeLocal(
            initialData.eventDate,
          ),
        eventUrl:
          initialData.eventUrl ?? "",
        eventSeriesId:
          initialData.eventSeriesId ??
          "",
        featured:
          initialData.featured,
        isActive:
          initialData.isActive,
        displayOrder:
          initialData.displayOrder,
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
      HTMLInputElement |
        HTMLTextAreaElement
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

    if (name === "displayOrder") {
      setForm((previous) => ({
        ...previous,
        displayOrder: Number(value),
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
            Add an event to the Stream Nepal
            portfolio.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Event Title
              </label>

              <input
                required
                name="title"
                value={form.title}
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

          <div>
            <label className="mb-1 block text-sm font-medium">
              Short Description
            </label>

            <input
              name="shortDescription"
              value={
                form.shortDescription ??
                ""
              }
              onChange={handleChange}
              placeholder="A short description of the event"
              className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>

            <textarea
              name="description"
              rows={5}
              value={
                form.description ?? ""
              }
              onChange={handleChange}
              placeholder="Detailed event description"
              className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Category
              </label>

              <input
                name="category"
                value={
                  form.category ?? ""
                }
                onChange={handleChange}
                placeholder="Esports / Broadcast / Event"
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Client
              </label>

              <input
                name="client"
                value={
                  form.client ?? ""
                }
                onChange={handleChange}
                placeholder="Client or organization"
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Organizer
              </label>

              <input
                name="organizer"
                value={
                  form.organizer ?? ""
                }
                onChange={handleChange}
                placeholder="Stream Nepal"
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Location
              </label>

              <input
                name="location"
                value={
                  form.location ?? ""
                }
                onChange={handleChange}
                placeholder="Biratnagar, Nepal"
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Event Date
              </label>

              <input
                required
                type="datetime-local"
                name="eventDate"
                value={
                  form.eventDate
                }
                onChange={handleChange}
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Display Order
              </label>

              <input
                type="number"
                min="0"
                name="displayOrder"
                value={
                  form.displayOrder ??
                  0
                }
                onChange={handleChange}
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Cover Image URL
            </label>

            <input
              type="url"
              name="coverImage"
              value={
                form.coverImage ?? ""
              }
              onChange={handleChange}
              placeholder="https://..."
              className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Event URL
            </label>

            <input
              type="url"
              name="eventUrl"
              value={
                form.eventUrl ?? ""
              }
              onChange={handleChange}
              placeholder="https://..."
              className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl border p-4">
              <input
                type="checkbox"
                name="featured"
                checked={
                  form.featured ??
                  false
                }
                onChange={handleChange}
              />

              <div>
                <p className="text-sm font-medium">
                  Featured Event
                </p>

                <p className="text-xs text-slate-500">
                  Highlight this event on the
                  public website.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-xl border p-4">
              <input
                type="checkbox"
                name="isActive"
                checked={
                  form.isActive ??
                  true
                }
                onChange={handleChange}
              />

              <div>
                <p className="text-sm font-medium">
                  Active
                </p>

                <p className="text-xs text-slate-500">
                  Make this event visible publicly.
                </p>
              </div>
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