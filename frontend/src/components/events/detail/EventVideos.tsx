"use client";

import {
  Pencil,
  Play,
  Plus,
  Star,
  Trash2,
} from "lucide-react";

import { useState } from "react";

import type {
  EventVideo,
} from "@/services/event";

import ImageUpload from "@/components/media/ImageUpload";

import {
  createEventVideo,
  deleteEventVideo,
  updateEventVideo,
} from "@/services/event-content";

type VideoPlatform =
  | "YOUTUBE"
  | "FACEBOOK"
  | "VIMEO"
  | "OTHER";

type EventVideosProps = {
  eventId: string;
  videos: EventVideo[];
  onChange: (
    videos: EventVideo[],
  ) => void;
};

export default function EventVideos({
  eventId,
  videos,
  onChange,
}: EventVideosProps) {
  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [videoUrl, setVideoUrl] =
    useState("");

  const [platform, setPlatform] =
    useState<VideoPlatform>(
      "YOUTUBE",
    );

  const [thumbnailUrl, setThumbnailUrl] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  function resetForm() {
    setTitle("");
    setDescription("");
    setVideoUrl("");
    setPlatform("YOUTUBE");
    setThumbnailUrl("");
    setEditingId(null);
  }

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    if (
      !title.trim() ||
      !videoUrl.trim()
    ) {
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        const updated =
          await updateEventVideo(
            eventId,
            editingId,
            {
              title:
                title.trim(),
              description:
                description.trim() ||
                undefined,
              platform,
              videoUrl:
                videoUrl.trim(),
              thumbnailUrl:
                thumbnailUrl.trim() ||
                undefined,
            },
          );

        onChange(
          videos.map((video) =>
            video.id === editingId
              ? updated
              : video,
          ),
        );
      } else {
        const created =
          await createEventVideo(
            eventId,
            {
              title:
                title.trim(),
              description:
                description.trim() ||
                undefined,
              platform,
              videoUrl:
                videoUrl.trim(),
              thumbnailUrl:
                thumbnailUrl.trim() ||
                undefined,
            },
          );

        onChange([
          ...videos,
          created,
        ]);
      }

      resetForm();
    } catch (error) {
      console.error(
        "Failed to save video:",
        error,
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(
    video: EventVideo,
  ) {
    setEditingId(video.id);
    setTitle(video.title);
    setDescription(
      video.description ?? "",
    );
    setVideoUrl(video.videoUrl);
    setPlatform(video.platform);
    setThumbnailUrl(
      video.thumbnailUrl ?? "",
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
        "Delete this video?",
      )
    ) {
      return;
    }

    try {
      await deleteEventVideo(
        eventId,
        id,
      );

      onChange(
        videos.filter(
          (video) =>
            video.id !== id,
        ),
      );

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error(
        "Failed to delete video:",
        error,
      );
    }
  }

  async function toggleFeatured(
    video: EventVideo,
  ) {
    try {
      const updated =
        await updateEventVideo(
          eventId,
          video.id,
          {
            featured:
              !video.featured,
          },
        );

      onChange(
        videos.map((item) =>
          item.id === video.id
            ? updated
            : item,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to update video:",
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
            <Play size={20} />

            <h2 className="font-semibold">
              {editingId
                ? "Edit Video"
                : "Add Video"}
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

        <div className="grid gap-3 md:grid-cols-2">
          <input
            required
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value,
              )
            }
            placeholder="Video title"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-slate-700"
          />

          <select
            value={platform}
            onChange={(e) =>
              setPlatform(
                e.target
                  .value as VideoPlatform,
              )
            }
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="YOUTUBE">
              YouTube
            </option>

            <option value="FACEBOOK">
              Facebook
            </option>

            <option value="VIMEO">
              Vimeo
            </option>

            <option value="OTHER">
              Other
            </option>
          </select>

          <input
            required
            type="url"
            value={videoUrl}
            onChange={(e) =>
              setVideoUrl(
                e.target.value,
              )
            }
            placeholder="Video URL"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-slate-700"
          />
        </div>

        <label className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
          Thumbnail (optional — upload or paste a link)
        </label>

        <ImageUpload
          value={thumbnailUrl}
          folder="gallery"
          onChange={(result) =>
            setThumbnailUrl(
              result?.url ?? "",
            )
          }
        />

        <textarea
          rows={3}
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value,
            )
          }
          placeholder="Description (optional)"
          className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-slate-700"
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
              ? "Update Video"
              : "Add Video"}
        </button>
      </form>

      {videos.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          No videos added yet.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {videos.map(
            (video) => (
              <div
                key={video.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                {video.thumbnailUrl ? (
                  <div className="aspect-video bg-slate-100 dark:bg-slate-800">
                    <img
                      src={
                        video.thumbnailUrl
                      }
                      alt={
                        video.title
                      }
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-slate-100 dark:bg-slate-800">
                    <Play
                      size={42}
                      className="text-slate-300 dark:text-slate-600"
                    />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">
                        {
                          video.title
                        }
                      </h3>

                      <p className="mt-1 text-xs uppercase text-slate-400">
                        {
                          video.platform
                        }
                      </p>
                    </div>

                    {video.featured && (
                      <Star
                        size={16}
                        className="text-amber-500"
                        fill="currentColor"
                      />
                    )}
                  </div>

                  {video.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                      {
                        video.description
                      }
                    </p>
                  )}

                  <a
                    href={
                      video.videoUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 block truncate text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {
                      video.videoUrl
                    }
                  </a>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void toggleFeatured(
                          video,
                        )
                      }
                      className={`rounded-lg border border-slate-300 dark:border-slate-700 ${
                        video.featured
                          ? "text-amber-500"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                      title={
                        video.featured
                          ? "Remove featured"
                          : "Make featured"
                      }
                    >
                      <Star
                        size={15}
                        fill={
                          video.featured
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        startEdit(
                          video,
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
                          video.id,
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