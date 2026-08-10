"use client";

import { useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  Trash2,
  ExternalLink,
} from "lucide-react";

import { useMedia } from "@/hooks/useMedia";

import {
  type CreateMediaDto,
  type Media,
  type MediaPlatform,
  type UpdateMediaDto,
} from "@/types/media";

const ITEMS_PER_PAGE = 9;

const PLATFORM_OPTIONS: {
  value: MediaPlatform;
  label: string;
}[] = [
  {
    value: "FACEBOOK",
    label: "Facebook",
  },
  {
    value: "YOUTUBE",
    label: "YouTube",
  },
  {
    value: "IMAGE",
    label: "Image",
  },
  {
    value: "VIDEO",
    label: "Video",
  },
];

function formatPlatform(
  platform: MediaPlatform,
) {
  return (
    platform.charAt(0) +
    platform.slice(1).toLowerCase()
  );
}

export default function GalleryPage() {
  const {
    media,
    loading,
    error,
    addMedia,
    editMedia,
    removeMedia,
  } = useMedia();

  const [search, setSearch] =
    useState("");

  const [platformFilter, setPlatformFilter] =
    useState<"ALL" | MediaPlatform>(
      "ALL",
    );

  const [page, setPage] =
    useState(1);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [modalMode, setModalMode] =
    useState<"create" | "edit">(
      "create",
    );

  const [selectedMedia, setSelectedMedia] =
    useState<Media | null>(null);

  const [saving, setSaving] =
    useState(false);

  const filteredMedia = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return media.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.title
          .toLowerCase()
          .includes(keyword) ||
        (
          item.description ?? ""
        )
          .toLowerCase()
          .includes(keyword) ||
        (
          item.category ?? ""
        )
          .toLowerCase()
          .includes(keyword);

      const matchesPlatform =
        platformFilter === "ALL" ||
        item.platform ===
          platformFilter;

      return (
        matchesSearch &&
        matchesPlatform
      );
    });
  }, [
    media,
    search,
    platformFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredMedia.length /
        ITEMS_PER_PAGE,
    ),
  );

  const currentPage = Math.min(
    page,
    totalPages,
  );

  const paginatedMedia =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        ITEMS_PER_PAGE;

      return filteredMedia.slice(
        start,
        start + ITEMS_PER_PAGE,
      );
    }, [
      filteredMedia,
      currentPage,
    ]);

  function openCreate() {
    setModalMode("create");
    setSelectedMedia(null);
    setModalOpen(true);
  }

  function openEdit(
    item: Media,
  ) {
    setModalMode("edit");
    setSelectedMedia(item);
    setModalOpen(true);
  }

  async function handleSubmit(
    data:
      | CreateMediaDto
      | UpdateMediaDto,
  ) {
    try {
      setSaving(true);

      if (modalMode === "create") {
        await addMedia(
          data as CreateMediaDto,
        );
      } else if (selectedMedia) {
        await editMedia(
          selectedMedia.id,
          data as UpdateMediaDto,
        );
      }

      setModalOpen(false);
      setSelectedMedia(null);
    } catch (error) {
      console.error(error);

      alert(
        "Unable to save media.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    item: Media,
  ) {
    const confirmed =
      window.confirm(
        `Delete "${item.title}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await removeMedia(item.id);
    } catch (error) {
      console.error(error);

      alert(
        "Unable to delete media.",
      );
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl border bg-white p-12 text-center text-slate-500">
          Loading gallery...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Gallery
          </h1>

          <p className="mt-1 text-slate-500">
            Manage Stream Nepal media,
            social posts, and portfolio
            content.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Media
        </button>
      </div>

      {/* Error */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}

      <div className="flex flex-col gap-3 md:flex-row">
        <input
          type="text"
          value={search}
          onChange={(event) => {
            setSearch(
              event.target.value,
            );
            setPage(1);
          }}
          placeholder="Search media..."
          className="h-11 w-full rounded-xl border bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 md:max-w-md"
        />

        <select
          value={platformFilter}
          onChange={(event) => {
            setPlatformFilter(
              event.target
                .value as
                | "ALL"
                | MediaPlatform,
            );
            setPage(1);
          }}
          className="h-11 rounded-xl border bg-white px-4 text-sm outline-none focus:border-blue-500"
        >
          <option value="ALL">
            All Platforms
          </option>

          {PLATFORM_OPTIONS.map(
            (option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ),
          )}
        </select>
      </div>

      {/* Empty */}

      {filteredMedia.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white p-16 text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            {search ||
            platformFilter !== "ALL"
              ? "No Media Found"
              : "No Media Yet"}
          </h2>

          <p className="mt-2 text-slate-500">
            {search ||
            platformFilter !== "ALL"
              ? "Try changing your search or filter."
              : "Add your first Facebook post, YouTube video, or media item."}
          </p>

          {!search &&
            platformFilter ===
              "ALL" && (
              <button
                type="button"
                onClick={openCreate}
                className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
              >
                Add Media
              </button>
            )}
        </div>
      ) : (
        <>
          {/* Media Grid */}

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {paginatedMedia.map(
              (item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl border bg-white shadow-sm"
                >
                  {/* Preview */}

                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    {item.thumbnailUrl ? (
                      <img
                        src={
                          item.thumbnailUrl
                        }
                        alt={
                          item.title
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-2xl font-bold text-slate-300">
                          {formatPlatform(
                            item.platform,
                          )}
                        </span>
                      </div>
                    )}

                    <div className="absolute left-3 top-3">
                      <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
                        {formatPlatform(
                          item.platform,
                        )}
                      </span>
                    </div>

                    {item.featured && (
                      <div className="absolute right-3 top-3">
                        <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-medium text-white">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate font-semibold text-slate-900">
                          {item.title}
                        </h2>

                        {item.category && (
                          <p className="mt-1 text-xs text-blue-600">
                            {
                              item.category
                            }
                          </p>
                        )}
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                          item.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {item.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    {item.description && (
                      <p className="mt-3 line-clamp-2 text-sm text-slate-500">
                        {
                          item.description
                        }
                      </p>
                    )}

                    <div className="mt-5 flex items-center justify-between gap-2">
                      <a
                        href={
                          item.sourceUrl
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Open Source
                        <ExternalLink
                          size={14}
                        />
                      </a>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEdit(
                              item,
                            )
                          }
                          className="rounded-lg border p-2 text-slate-600 hover:bg-slate-50"
                          title="Edit media"
                        >
                          <Pencil
                            size={16}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              item,
                            )
                          }
                          className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                          title="Delete media"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* Pagination */}

          <div className="flex items-center justify-between rounded-xl border bg-white px-5 py-3">
            <p className="text-xs text-slate-500">
              Showing{" "}
              {(currentPage - 1) *
                ITEMS_PER_PAGE +
                1}{" "}
              to{" "}
              {Math.min(
                currentPage *
                  ITEMS_PER_PAGE,
                filteredMedia.length,
              )}{" "}
              of{" "}
              {filteredMedia.length}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  setPage(
                    (value) =>
                      value - 1,
                  )
                }
                className="rounded-lg border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  setPage(
                    (value) =>
                      value + 1,
                  )
                }
                className="rounded-lg border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal */}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="border-b p-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {modalMode === "create"
                  ? "Add Media"
                  : "Edit Media"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add a Facebook post,
                YouTube video, image, or
                video.
              </p>
            </div>

            <form
              onSubmit={async (
                event,
              ) => {
                event.preventDefault();

                const form =
                  new FormData(
                    event.currentTarget,
                  );

                await handleSubmit({
                  title: String(
                    form.get(
                      "title",
                    ) || "",
                  ),

                  description:
                    String(
                      form.get(
                        "description",
                      ) || "",
                    ) || undefined,

                  platform:
                    String(
                      form.get(
                        "platform",
                      ) || "FACEBOOK",
                    ) as MediaPlatform,

                  sourceUrl:
                    String(
                      form.get(
                        "sourceUrl",
                      ) || "",
                    ),

                  thumbnailUrl:
                    String(
                      form.get(
                        "thumbnailUrl",
                      ) || "",
                    ) || undefined,

                  category:
                    String(
                      form.get(
                        "category",
                      ) || "",
                    ) || undefined,

                  featured:
                    form.get(
                      "featured",
                    ) === "on",

                  isActive:
                    form.get(
                      "isActive",
                    ) === "on",

                  displayOrder:
                    Number(
                      form.get(
                        "displayOrder",
                      ) || 0,
                    ),
                });
              }}
              className="space-y-5 p-6"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Title
                </label>

                <input
                  required
                  name="title"
                  defaultValue={
                    selectedMedia?.title ??
                    ""
                  }
                  placeholder="PMBC 2026 Grand Finals"
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Platform
                </label>

                <select
                  name="platform"
                  defaultValue={
                    selectedMedia?.platform ??
                    "FACEBOOK"
                  }
                  className="w-full rounded-xl border bg-white px-3 py-2 outline-none focus:border-blue-500"
                >
                  {PLATFORM_OPTIONS.map(
                    (option) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {
                          option.label
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Source URL
                </label>

                <input
                  required
                  type="url"
                  name="sourceUrl"
                  defaultValue={
                    selectedMedia?.sourceUrl ??
                    ""
                  }
                  placeholder="https://www.facebook.com/..."
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
                />

                <p className="mt-1 text-xs text-slate-500">
                  Paste the public Facebook
                  post/video URL here.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Thumbnail URL
                </label>

                <input
                  type="url"
                  name="thumbnailUrl"
                  defaultValue={
                    selectedMedia?.thumbnailUrl ??
                    ""
                  }
                  placeholder="https://..."
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
                />

                <p className="mt-1 text-xs text-slate-500">
                  Optional fallback image
                  for the gallery preview.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Category
                </label>

                <input
                  name="category"
                  defaultValue={
                    selectedMedia?.category ??
                    ""
                  }
                  placeholder="Tournament / Event / Portfolio"
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  name="description"
                  rows={4}
                  defaultValue={
                    selectedMedia?.description ??
                    ""
                  }
                  placeholder="Short description..."
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
                  defaultValue={
                    selectedMedia?.displayOrder ??
                    0
                  }
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={
                      selectedMedia?.isActive ??
                      true
                    }
                  />

                  <span className="text-sm">
                    Active
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={
                      selectedMedia?.featured ??
                      false
                    }
                  />

                  <span className="text-sm">
                    Featured
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={() => {
                    if (!saving) {
                      setModalOpen(
                        false,
                      );
                      setSelectedMedia(
                        null,
                      );
                    }
                  }}
                  disabled={saving}
                  className="rounded-xl border px-5 py-2 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : modalMode ===
                        "create"
                      ? "Add Media"
                      : "Update Media"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}