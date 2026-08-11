"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
  type CreateEventDto,
  type Event,
  type UpdateEventDto,
} from "@/services/event";

export function useEvents() {
  const [events, setEvents] =
    useState<Event[]>([]);

  const [loading, setLoading] =
    useState(true);

  const fetchEvents =
    useCallback(async () => {
      try {
        setLoading(true);

        const data =
          await getEvents();

        setEvents(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  async function addEvent(
    data: CreateEventDto,
  ) {
    const created =
      await createEvent(data);

    setEvents((current) => [
      created,
      ...current,
    ]);
  }

  async function editEvent(
    id: string,
    data: UpdateEventDto,
  ) {
    const updated =
      await updateEvent(id, data);

    setEvents((current) =>
      current.map((event) =>
        event.id === id
          ? updated
          : event,
      ),
    );
  }

  async function removeEvent(
    id: string,
  ) {
    await deleteEvent(id);

    setEvents((current) =>
      current.filter(
        (event) => event.id !== id,
      ),
    );
  }

  return {
    events,
    loading,
    fetchEvents,
    addEvent,
    editEvent,
    removeEvent,
  };
}