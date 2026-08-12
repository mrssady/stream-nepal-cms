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

import { getEventSeries } from "@/services/event-series";

import type { EventSeries } from "@/types/event-series";

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
  eventSeriesId: "",
  shortDescription: "",
  description: "",
  coverImage: "",
  category: "",
  client: "",
  organizer: "",
  location: "",
  eventDate: "",
  eventUrl: "",
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

  const year = date.getFullYear();

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

  const [eventSeries, setEventSeries] =
    useState<EventSeries[]>([]);

  const [seriesLoading, setSeriesLoading] =
    useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    async function loadEventSeries() {
      try {
        setSeriesLoading(true);

        const data =
          await getEventSeries();

        setEventSeries(
          data.filter(
            (series) =>
              series.isActive,
          ),
        );
      } catch (error) {
        console.error(
          "Failed to load event series:",
          error,
        );
      } finally {
        setSeriesLoading(false);
      }
    }

    void loadEventSeries();
  }, [open]);

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

        eventSeriesId:
          initialData.eventSeriesId ??
          "",

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
          initialData.client ??
          "",

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
          initialData.eventUrl ??
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
        HTMLTextAreaElement |
        HTMLSelectElement
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
        displayOrder:
          Number(value),
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

    const cleanedData = {
      ...form,

      eventSeriesId:
        form.eventSeriesId?.trim()
          ? form.eventSeriesId
          : undefined,
    };

    await onSubmit(cleanedData);
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
          {/* BASIC INFORMATION */}

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

          {/* EVENT SERIES */}

          <div className="rounded-xl border bg-slate-50 p-4">
            <label className="mb-1 block text-sm font-medium text-slate-900">
              Event Series
            </label>

            <p className="mb-3 text-xs text-slate-500">
              Group this event with previous or
              future editions of the same event.
            </p>

            <select
              name="eventSeriesId"
              value={
                form.eventSeriesId ?? ""
              }
              onChange={handleChange}
              disabled={seriesLoading}
              className="w-full rounded-xl border bg-white px-3 py-2 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">
                {seriesLoading
                  ? "Loading event series..."
                  : "No Event Series"}
              </option>

              {eventSeries.map(
                (series) => (
                  <option
                    key={series.id}
                    value={series.id}
                  >
                    {series.title}
                  </option>
                ),
              )}
            </select>

            {eventSeries.length ===
              0 &&
              !seriesLoading && (
                <p className="mt-2 text-xs text-amber-600">
                  No active event series found.
                  You can create one from the
                  Event Series section.
                </p>
              )}
          </div>

          {/* DESCRIPTION */}

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

          {/* CATEGORY / CLIENT / ORGANIZER / LOCATION */}

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

          {/* DATE */}

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

          {/* IMAGES / URL */}

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

          {/* SETTINGS */}

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

          {/* ACTIONS */}

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
              disabled={
                loading ||
                seriesLoading
              }
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