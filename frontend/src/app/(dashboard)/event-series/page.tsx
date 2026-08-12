"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import {
  useEventSeries,
} from "@/hooks/useEventSeries";

import type {
  CreateEventSeriesDto,
  EventSeries,
  UpdateEventSeriesDto,
} from "@/types/event-series";

import EventSeriesModal from "@/components/event-series/EventSeriesModal";

export default function EventSeriesPage() {
  const {
    series,
    loading,
    addSeries,
    editSeries,
    removeSeries,
  } = useEventSeries();

  const [search, setSearch] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [modalMode, setModalMode] =
    useState<"create" | "edit">(
      "create",
    );

  const [
    selectedSeries,
    setSelectedSeries,
  ] = useState<EventSeries | null>(
    null,
  );

  const [saving, setSaving] =
    useState(false);

  const filteredSeries = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return series;
    }

    return series.filter(
      (item) =>
        item.title
          .toLowerCase()
          .includes(query) ||
        item.slug
          .toLowerCase()
          .includes(query) ||
        (
          item.description ?? ""
        )
          .toLowerCase()
          .includes(query),
    );
  }, [series, search]);

  function openCreate() {
    setSelectedSeries(null);
    setModalMode("create");
    setModalOpen(true);
  }

  function openEdit(
    item: EventSeries,
  ) {
    setSelectedSeries(item);
    setModalMode("edit");
    setModalOpen(true);
  }

  async function handleSubmit(
    data:
      | CreateEventSeriesDto
      | UpdateEventSeriesDto,
  ) {
    try {
      setSaving(true);

      if (
        modalMode === "create"
      ) {
        await addSeries(
          data as CreateEventSeriesDto,
        );
      } else if (
        selectedSeries
      ) {
        await editSeries(
          selectedSeries.id,
          data as UpdateEventSeriesDto,
        );
      }

      setModalOpen(false);
      setSelectedSeries(null);
    } catch (error) {
      console.error(error);

      alert(
        "Unable to save the event series.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    item: EventSeries,
  ) {
    const eventCount =
      item._count?.events ?? 0;

    if (eventCount > 0) {
      alert(
        "This series contains events. Remove the events from this series before deleting it.",
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${item.title}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await removeSeries(item.id);
    } catch (error) {
      console.error(error);

      alert(
        "Unable to delete the event series.",
      );
    }
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Event Series
          </h1>

          <p className="mt-1 text-slate-500">
            Group related Stream Nepal events
            into a single history or portfolio
            series.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <Plus size={18} />
          Create Series
        </button>
      </div>

      <div>
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search event series..."
          className="w-full max-w-md rounded-xl border bg-white px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      {loading ? (
        <div className="rounded-2xl border bg-white p-12 text-center text-slate-500">
          Loading event series...
        </div>
      ) : filteredSeries.length ===
        0 ? (
        <div className="rounded-2xl border border-dashed bg-white p-16 text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            No Event Series Found
          </h2>

          <p className="mt-2 text-slate-500">
            Create your first event series.
          </p>

          <button
            type="button"
            onClick={openCreate}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            Create Series
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredSeries.map(
            (item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                {item.coverImage ? (
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-slate-100 text-3xl font-bold text-slate-300">
                    SN
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {item.title}
                      </h2>

                      <p className="mt-1 text-xs text-slate-400">
                        /{item.slug}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEdit(item)
                        }
                        className="rounded-lg border p-2 hover:bg-slate-50"
                        title="Edit"
                      >
                        <Pencil
                          size={16}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(item)
                        }
                        className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2
                          size={16}
                        />
                      </button>
                    </div>
                  </div>

                  {item.description && (
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {item._count?.events ??
                        0}{" "}
                      Events
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        item.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>

                    {item.featured && (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ),
          )}
        </div>
      )}

      <EventSeriesModal
        open={modalOpen}
        mode={modalMode}
        loading={saving}
        initialData={selectedSeries}
        onClose={() => {
          if (!saving) {
            setModalOpen(false);
            setSelectedSeries(null);
          }
        }}
        onSubmit={handleSubmit}
      />
    </main>
  );
}