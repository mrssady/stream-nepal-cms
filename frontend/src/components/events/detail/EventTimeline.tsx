"use client";

import {
  CalendarDays,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";

import { useState } from "react";

import type {
  EventTimeline as EventTimelineItem,
} from "@/services/event";

import ImageUpload from "@/components/media/ImageUpload";

import {
  createEventTimeline,
  deleteEventTimeline,
  updateEventTimeline,
} from "@/services/event-content";

type EventTimelineProps = {
  eventId: string;
  timeline: EventTimelineItem[];
  onChange: (
    timeline: EventTimelineItem[],
  ) => void;
};

function formatDate(
  value: string,
) {
  return new Date(
    value,
  ).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
}

export default function EventTimeline({
  eventId,
  timeline,
  onChange,
}: EventTimelineProps) {
  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [timelineDate, setTimelineDate] =
    useState("");

  const [imageUrl, setImageUrl] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  function resetForm() {
    setTitle("");
    setDescription("");
    setTimelineDate("");
    setImageUrl("");
    setEditingId(null);
  }

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    if (
      !title.trim() ||
      !timelineDate
    ) {
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        const updated =
          await updateEventTimeline(
            eventId,
            editingId,
            {
              title:
                title.trim(),
              description:
                description.trim() ||
                undefined,
              timelineDate:
                new Date(
                  timelineDate,
                ).toISOString(),
              imageUrl:
                imageUrl.trim() ||
                undefined,
            },
          );

        onChange(
          timeline
            .map((item) =>
              item.id === editingId
                ? updated
                : item,
            )
            .sort(
              (a, b) =>
                new Date(
                  a.timelineDate,
                ).getTime() -
                new Date(
                  b.timelineDate,
                ).getTime(),
            ),
        );
      } else {
        const created =
          await createEventTimeline(
            eventId,
            {
              title:
                title.trim(),
              description:
                description.trim() ||
                undefined,
              timelineDate:
                new Date(
                  timelineDate,
                ).toISOString(),
              imageUrl:
                imageUrl.trim() ||
                undefined,
            },
          );

        onChange(
          [
            ...timeline,
            created,
          ].sort(
            (a, b) =>
              new Date(
                a.timelineDate,
              ).getTime() -
              new Date(
                b.timelineDate,
              ).getTime(),
          ),
        );
      }

      resetForm();
    } catch (error) {
      console.error(
        "Failed to save timeline entry:",
        error,
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(
    item: EventTimelineItem,
  ) {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(
      item.description ?? "",
    );

    const date =
      new Date(item.timelineDate);

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1,
      ).padStart(2, "0");

    const day =
      String(
        date.getDate(),
      ).padStart(2, "0");

    const hours =
      String(
        date.getHours(),
      ).padStart(2, "0");

    const minutes =
      String(
        date.getMinutes(),
      ).padStart(2, "0");

    setTimelineDate(
      `${year}-${month}-${day}T${hours}:${minutes}`,
    );

    setImageUrl(
      item.imageUrl ?? "",
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(
    id: string,
  ) {
    if (
      !window.confirm(
        "Delete this timeline entry?",
      )
    ) {
      return;
    }

    try {
      await deleteEventTimeline(
        eventId,
        id,
      );

      onChange(
        timeline.filter(
          (item) =>
            item.id !== id,
        ),
      );

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error(
        "Failed to delete timeline entry:",
        error,
      );
    }
  }

  async function toggleFeatured(
    item: EventTimelineItem,
  ) {
    try {
      const updated =
        await updateEventTimeline(
          eventId,
          item.id,
          {
            featured:
              !item.featured,
          },
        );

      onChange(
        timeline.map(
          (current) =>
            current.id === item.id
              ? updated
              : current,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to update timeline entry:",
        error,
      );
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">
              {editingId
                ? "Edit Timeline Entry"
                : "Add Timeline Entry"}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Use any date, month, or year.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="space-y-3">
          <input
            required
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value,
              )
            }
            placeholder="Timeline title"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-slate-700"
          />

          <input
            required
            type="datetime-local"
            value={timelineDate}
            onChange={(e) =>
              setTimelineDate(
                e.target.value,
              )
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-slate-700"
          />

          <textarea
            rows={4}
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value,
              )
            }
            placeholder="Description"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-slate-700"
          />

          <ImageUpload
            value={imageUrl}
            folder="events"
            onChange={(result) =>
              setImageUrl(
                result?.url ?? "",
              )
            }
          />

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {editingId ? (
              <Pencil size={16} />
            ) : (
              <Plus size={16} />
            )}

            {saving
              ? "Saving..."
              : editingId
                ? "Update Entry"
                : "Add Entry"}
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold">
          Event Timeline
        </h2>

        {timeline.length ===
        0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400">
            No timeline entries yet.
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            {timeline.map(
              (item) => (
                <div
                  key={item.id}
                  className="relative border-l-2 border-slate-200 pl-7 dark:border-slate-700"
                >
                  <div className="absolute -left-[7px] top-1 size-3 rounded-full bg-slate-900 dark:bg-blue-600" />

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                          <CalendarDays
                            size={13}
                          />

                          {formatDate(
                            item.timelineDate,
                          )}
                        </span>

                        {item.featured && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                            <Star
                              size={11}
                              fill="currentColor"
                            />
                            Featured
                          </span>
                        )}
                      </div>

                      <h3 className="mt-2 text-lg font-semibold">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-500 dark:text-slate-400">
                          {
                            item.description
                          }
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          void toggleFeatured(
                            item,
                          )
                        }
                        className={`rounded-lg border border-slate-300 dark:border-slate-700 ${
                          item.featured
                            ? "text-amber-500"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                        title={
                          item.featured
                            ? "Remove featured"
                            : "Make featured"
                        }
                      >
                        <Star
                          size={15}
                          fill={
                            item.featured
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          startEdit(
                            item,
                          )
                        }
                        className="rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        title="Edit"
                      >
                        <Pencil
                          size={15}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void handleDelete(
                            item.id,
                          )
                        }
                        className="rounded-lg border border-slate-300 p-2 text-red-600 transition hover:bg-red-50 dark:border-slate-700 dark:text-red-400 dark:hover:bg-red-500/10"
                        title="Delete"
                      >
                        <Trash2
                          size={15}
                        />
                      </button>
                    </div>
                  </div>

                  {item.imageUrl && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                      <img
                        src={
                          item.imageUrl
                        }
                        alt={
                          item.title
                        }
                        className="max-h-64 w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}