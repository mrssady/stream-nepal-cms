"use client";

import { useMemo, useState } from "react";

import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import SearchBar from "@/components/common/SearchBar";
import Pagination from "@/components/common/Pagination";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import EventModal from "@/components/events/EventModal";
import EventsTable from "@/components/events/EventsTable";

import { useEvents } from "@/hooks/useEvents";

import type {
  CreateEventDto,
  Event,
  UpdateEventDto,
} from "@/services/event";

const ITEMS_PER_PAGE = 10;

export default function EventsPage() {
  const {
    events,
    loading,
    addEvent,
    editEvent,
    removeEvent,
  } = useEvents();

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [openModal, setOpenModal] =
    useState(false);

  const [mode, setMode] =
    useState<"create" | "edit">(
      "create",
    );

  const [selectedEvent, setSelectedEvent] =
    useState<Event | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [openDelete, setOpenDelete] =
    useState(false);

  const filteredEvents = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return events;
    }

    return events.filter(
      (event) =>
        event.title
          .toLowerCase()
          .includes(keyword) ||
        event.slug
          .toLowerCase()
          .includes(keyword) ||
        (event.category ?? "")
          .toLowerCase()
          .includes(keyword) ||
        (event.client ?? "")
          .toLowerCase()
          .includes(keyword) ||
        (event.organizer ?? "")
          .toLowerCase()
          .includes(keyword) ||
        (event.location ?? "")
          .toLowerCase()
          .includes(keyword),
    );
  }, [events, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredEvents.length /
        ITEMS_PER_PAGE,
    ),
  );

  const currentPage = Math.min(
    page,
    totalPages,
  );

  const paginatedEvents = useMemo(() => {
    const start =
      (currentPage - 1) *
      ITEMS_PER_PAGE;

    return filteredEvents.slice(
      start,
      start + ITEMS_PER_PAGE,
    );
  }, [
    filteredEvents,
    currentPage,
  ]);

  function openCreate() {
    setMode("create");
    setSelectedEvent(null);
    setOpenModal(true);
  }

  function openEdit(
    event: Event,
  ) {
    setMode("edit");
    setSelectedEvent(event);
    setOpenModal(true);
  }

  async function handleSubmit(
    data:
      | CreateEventDto
      | UpdateEventDto,
  ) {
    try {
      setSaving(true);

      if (mode === "create") {
        await addEvent(
          data as CreateEventDto,
        );
      } else if (selectedEvent) {
        await editEvent(
          selectedEvent.id,
          data as UpdateEventDto,
        );
      }

      setOpenModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error(error);

      alert(
        "Unable to save the event.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedEvent) {
      return;
    }

    try {
      setDeleting(true);

      await removeEvent(
        selectedEvent.id,
      );

      setOpenDelete(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error(error);

      alert(
        "Unable to delete the event.",
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl border bg-white p-12 text-center text-slate-500">
          Loading events...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        description="Manage Stream Nepal events and portfolio history."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Create Event
          </button>
        }
      />

      <SearchBar
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search events..."
      />

      {filteredEvents.length === 0 ? (
        <EmptyState
          title="No Events Found"
          description="Create your first Stream Nepal event."
        />
      ) : (
        <>
          <EventsTable
            events={paginatedEvents}
            onEdit={openEdit}
            onDelete={(event) => {
              setSelectedEvent(event);
              setOpenDelete(true);
            }}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      <EventModal
        open={openModal}
        mode={mode}
        loading={saving}
        initialData={selectedEvent}
        onClose={() => {
          if (!saving) {
            setOpenModal(false);
            setSelectedEvent(null);
          }
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={openDelete}
        loading={deleting}
        title="Delete Event"
        message={`Are you sure you want to delete "${selectedEvent?.title}"?`}
        onCancel={() => {
          if (!deleting) {
            setOpenDelete(false);
            setSelectedEvent(null);
          }
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}