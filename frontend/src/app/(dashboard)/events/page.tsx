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

import {
  Event,
  CreateEventDto,
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

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [openModal, setOpenModal] =
    useState(false);

  const [mode, setMode] =
    useState<"create" | "edit">("create");

  const [selectedEvent, setSelectedEvent] =
    useState<Event | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [openDelete, setOpenDelete] =
    useState(false);

  const filteredEvents = useMemo(() => {
    const keyword = search.toLowerCase();

    return events.filter(
      (event) =>
        event.title
          .toLowerCase()
          .includes(keyword) ||
        event.game
          .toLowerCase()
          .includes(keyword) ||
        event.location
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

  const paginatedEvents = useMemo(() => {
    const start =
      (page - 1) * ITEMS_PER_PAGE;

    return filteredEvents.slice(
      start,
      start + ITEMS_PER_PAGE,
    );
  }, [filteredEvents, page]);

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
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedEvent) return;

    try {
      setDeleting(true);

      await removeEvent(
        selectedEvent.id,
      );

      setOpenDelete(false);
      setSelectedEvent(null);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        Loading events...
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Events"
          description="Manage tournaments and events."
          action={
            <button
              onClick={() => {
                setMode("create");
                setSelectedEvent(null);
                setOpenModal(true);
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white"
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
            description="Create your first event."
          />
        ) : (
          <>
            <EventsTable
              events={paginatedEvents}
              onEdit={(event) => {
                setMode("edit");
                setSelectedEvent(event);
                setOpenModal(true);
              }}
              onDelete={(event) => {
                setSelectedEvent(event);
                setOpenDelete(true);
              }}
            />

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <EventModal
        open={openModal}
        mode={mode}
        loading={saving}
        initialData={selectedEvent}
        onClose={() => {
          setOpenModal(false);
          setSelectedEvent(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={openDelete}
        loading={deleting}
        title="Delete Event"
        message={`Are you sure you want to delete "${selectedEvent?.title}"?`}
        onCancel={() => {
          setOpenDelete(false);
          setSelectedEvent(null);
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}