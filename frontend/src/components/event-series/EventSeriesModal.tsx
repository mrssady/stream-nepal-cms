"use client";

import { useState } from "react";

import ImageUpload from "@/components/media/ImageUpload";

import type {
  CreateEventSeriesDto,
  EventSeries,
  UpdateEventSeriesDto,
} from "@/types/event-series";

type EventSeriesModalProps = {
  open: boolean;
  mode: "create" | "edit";
  loading?: boolean;
  initialData?: EventSeries | null;
  onClose: () => void;
  onSubmit: (
    data:
      | CreateEventSeriesDto
      | UpdateEventSeriesDto,
  ) => void;
};

export default function EventSeriesModal({
  open,
  mode,
  loading = false,
  initialData,
  onClose,
  onSubmit,
}: EventSeriesModalProps) {
  const [title, setTitle] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [coverImage, setCoverImage] =
    useState("");

  const [isActive, setIsActive] =
    useState(true);

  const [featured, setFeatured] =
    useState(false);

  const [displayOrder, setDisplayOrder] =
    useState(0);

  const [prevOpen, setPrevOpen] =
    useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);

    if (open) {
      setTitle(
        initialData?.title ?? "",
      );

      setSlug(
        initialData?.slug ?? "",
      );

      setDescription(
        initialData?.description ?? "",
      );

      setCoverImage(
        initialData?.coverImage ?? "",
      );

      setIsActive(
        initialData?.isActive ?? true,
      );

      setFeatured(
        initialData?.featured ?? false,
      );

      setDisplayOrder(
        initialData?.displayOrder ?? 0,
      );
    }
  }

  if (!open) {
    return null;
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    if (!slug.trim()) {
      return;
    }

    onSubmit({
      title: title.trim(),
      slug: slug.trim(),
      description:
        description.trim() || undefined,
      coverImage:
        coverImage.trim() || undefined,
      isActive,
      featured,
      displayOrder,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl dark:border dark:border-border dark:bg-card">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-border">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {mode === "create"
              ? "Create Event Series"
              : "Edit Event Series"}
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Group related events such as
            PMBC 2019, PMBC 2.0 and future
            editions.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Title
            </label>

            <input
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="PMBC"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white"
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Slug
            </label>

            <input
              value={slug}
              onChange={(event) =>
                setSlug(event.target.value)
              }
              placeholder="pmbc"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white"
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              rows={4}
              placeholder="A series of PUBG Mobile events organized by Stream Nepal."
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white"
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Cover Image
            </label>

            <ImageUpload
              value={coverImage}
              folder="event-series"
              onChange={(result) =>
                setCoverImage(
                  result?.url ?? "",
                )
              }
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Display Order
            </label>

            <input
              type="number"
              min={0}
              value={displayOrder}
              onChange={(event) =>
                setDisplayOrder(
                  Number(event.target.value),
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 dark:border-border">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) =>
                  setIsActive(
                    event.target.checked,
                  )
                }
                disabled={loading}
              />

              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Active
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 dark:border-border">
              <input
                type="checkbox"
                checked={featured}
                onChange={(event) =>
                  setFeatured(
                    event.target.checked,
                  )
                }
                disabled={loading}
              />

              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Featured
              </span>
            </label>
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
                !title.trim() ||
                !slug.trim()
              }
              className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
            >
              {loading
                ? "Saving..."
                : mode === "create"
                  ? "Create Series"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}