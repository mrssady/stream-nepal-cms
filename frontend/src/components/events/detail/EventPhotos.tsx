"use client";

import {
  Image as ImageIcon,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";

import { useState } from "react";

import type { EventPhoto } from "@/services/event";

import ImageUpload from "@/components/media/ImageUpload";

import {
  createEventPhoto,
  deleteEventPhoto,
  updateEventPhoto,
} from "@/services/event-content";

type EventPhotosProps = {
  eventId: string;
  photos: EventPhoto[];
  onChange: (photos: EventPhoto[]) => void;
};

export default function EventPhotos({
  eventId,
  photos,
  onChange,
}: EventPhotosProps) {
  const [title, setTitle] =
    useState("");

  const [imageUrl, setImageUrl] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    if (!imageUrl.trim()) {
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        const updated =
          await updateEventPhoto(
            eventId,
            editingId,
            {
              title:
                title.trim() ||
                undefined,
              imageUrl:
                imageUrl.trim(),
            },
          );

        onChange(
          photos.map((photo) =>
            photo.id === editingId
              ? updated
              : photo,
          ),
        );
      } else {
        const created =
          await createEventPhoto(
            eventId,
            {
              title:
                title.trim() ||
                undefined,
              imageUrl:
                imageUrl.trim(),
            },
          );

        onChange([
          ...photos,
          created,
        ]);
      }

      resetForm();
    } catch (error) {
      console.error(
        "Failed to save photo:",
        error,
      );
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setTitle("");
    setImageUrl("");
    setEditingId(null);
  }

  function startEdit(
    photo: EventPhoto,
  ) {
    setEditingId(photo.id);
    setTitle(
      photo.title ?? "",
    );
    setImageUrl(photo.imageUrl);

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
        "Delete this photo?",
      )
    ) {
      return;
    }

    try {
      await deleteEventPhoto(
        eventId,
        id,
      );

      onChange(
        photos.filter(
          (photo) =>
            photo.id !== id,
        ),
      );

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error(
        "Failed to delete photo:",
        error,
      );
    }
  }

  async function toggleFeatured(
    photo: EventPhoto,
  ) {
    try {
      const updated =
        await updateEventPhoto(
          eventId,
          photo.id,
          {
            featured:
              !photo.featured,
          },
        );

      onChange(
        photos.map((item) =>
          item.id === photo.id
            ? updated
            : item,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to update featured state:",
        error,
      );
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon
              size={20}
            />

            <h2 className="font-semibold">
              {editingId
                ? "Edit Photo"
                : "Add Photo"}
            </h2>
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

        <input
          value={title}
          onChange={(e) =>
            setTitle(
              e.target.value,
            )
          }
          placeholder="Photo title"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-slate-700"
        />

        <label className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
          Image (upload or paste a link)
        </label>

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
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {editingId ? (
            <Pencil size={16} />
          ) : (
            <Plus size={16} />
          )}

          {saving
            ? "Saving..."
            : editingId
              ? "Update Photo"
              : "Add Photo"}
        </button>
      </form>

      {photos.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          No photos added yet.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {photos.map(
            (photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
                  <img
                    src={
                      photo.imageUrl
                    }
                    alt={
                      photo.title ||
                      "Event photo"
                    }
                    className="h-full w-full object-cover"
                  />

                  {photo.featured && (
                    <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-amber-600 dark:bg-slate-900/90">
                      <Star
                        size={12}
                        fill="currentColor"
                      />
                      Featured
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <p className="truncate font-medium">
                    {photo.title ||
                      "Untitled Photo"}
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void toggleFeatured(
                          photo,
                        )
                      }
                      className={`rounded-lg border border-slate-300 dark:border-slate-700 ${
                        photo.featured
                          ? "text-amber-500"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                      title={
                        photo.featured
                          ? "Remove featured"
                          : "Make featured"
                      }
                    >
                      <Star
                        size={15}
                        fill={
                          photo.featured
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        startEdit(
                          photo,
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
                          photo.id,
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
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}