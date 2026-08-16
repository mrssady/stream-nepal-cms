"use client";

import { useEffect, useState } from "react";

import ImageUpload from "@/components/media/ImageUpload";

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

function buildForm(
  mode: "create" | "edit",
  initialData?: Event | null,
): CreateEventDto {
  if (mode === "edit" && initialData) {
    return {
      title: initialData.title,
      slug: initialData.slug,
      eventSeriesId:
        initialData.eventSeriesId ?? "",
      shortDescription:
        initialData.shortDescription ?? "",
      description:
        initialData.description ?? "",
      coverImage:
        initialData.coverImage ?? "",
      category:
        initialData.category ?? "",
      client:
        initialData.client ?? "",
      organizer:
        initialData.organizer ?? "",
      location:
        initialData.location ?? "",
      eventDate:
        formatDateTimeLocal(
          initialData.eventDate,
        ),
      eventUrl:
        initialData.eventUrl ?? "",
      featured:
        initialData.featured,
      isActive:
        initialData.isActive,
      displayOrder:
        initialData.displayOrder,
    };
  }

  return { ...INITIAL_FORM };
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
    useState<CreateEventDto>(() =>
      buildForm(mode, initialData),
    );

  const [eventSeries, setEventSeries] =
    useState<EventSeries[]>([]);

  const [seriesLoading, setSeriesLoading] =
    useState(false);

  const [prevOpen, setPrevOpen] =
    useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);

    if (open) {
      setSeriesLoading(true);
      setForm(
        buildForm(mode, initialData),
      );
    }
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    getEventSeries()
      .then((data) => {
        if (cancelled) {
          return;
        }

        setEventSeries(
          data.filter(
            (series) =>
              series.isActive,
          ),
        );
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load event series:",
          error,
        );
      })
      .finally(() => {
        if (cancelled) {
          return;
        }

        setSeriesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

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
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl dark:border dark:border-border dark:bg-card">
        <div className="border-b border-slate-200 p-6 dark:border-border">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {mode === "create"
              ? "Create Event"
              : "Edit Event"}
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Event Title
              </label>

              <input
                required
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="PUBG Mobile Championship"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Slug
              </label>

              <input
                required
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="pubg-mobile-championship"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white dark:focus:border-blue-400"
              />
            </div>
          </div>

          {/* EVENT SERIES */}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-border dark:bg-muted/60">
            <label className="mb-1 block text-sm font-medium text-slate-900 dark:text-white">
              Event Series
            </label>

            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
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
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-border dark:bg-muted dark:text-white dark:focus:border-blue-400 dark:disabled:bg-muted"
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
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  No active event series found.
                  You can create one from the
                  Event Series section.
                </p>
              )}
          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white dark:focus:border-blue-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white dark:focus:border-blue-400"
            />
          </div>

          {/* CATEGORY / CLIENT / ORGANIZER / LOCATION */}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Category
              </label>

              <input
                name="category"
                value={
                  form.category ?? ""
                }
                onChange={handleChange}
                placeholder="Esports / Broadcast / Event"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Client
              </label>

              <input
                name="client"
                value={
                  form.client ?? ""
                }
                onChange={handleChange}
                placeholder="Client or organization"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Organizer
              </label>

              <input
                name="organizer"
                value={
                  form.organizer ?? ""
                }
                onChange={handleChange}
                placeholder="Stream Nepal"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Location
              </label>

              <input
                name="location"
                value={
                  form.location ?? ""
                }
                onChange={handleChange}
                placeholder="Biratnagar, Nepal"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white dark:focus:border-blue-400"
              />
            </div>
          </div>

          {/* DATE */}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white dark:focus:border-blue-400"
              />
            </div>
          </div>

          {/* IMAGES / URL */}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Cover Image
            </label>

            <ImageUpload
              value={
                form.coverImage ?? ""
              }
              folder="events"
              onChange={(result) =>
                setForm((current) => ({
                  ...current,
                  coverImage:
                    result?.url ?? "",
                }))
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white dark:focus:border-blue-400"
            />
          </div>

          {/* SETTINGS */}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl border border-slate-300 p-4 dark:border-slate-700">
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
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Featured Event
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Highlight this event on the
                  public website.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-300 p-4 dark:border-slate-700">
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
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Active
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Make this event visible publicly.
                </p>
              </div>
            </label>
          </div>

          {/* ACTIONS */}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-300 px-5 py-2 text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-border dark:text-slate-300 dark:hover:bg-muted"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                seriesLoading
              }
              className="rounded-xl bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
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
