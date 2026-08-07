"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  Event,
  CreateEventDto,
  UpdateEventDto,
} from "@/services/event";

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getEvents();

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
    await createEvent(data);
    await fetchEvents();
  }

  async function editEvent(
    id: string,
    data: UpdateEventDto,
  ) {
    await updateEvent(id, data);
    await fetchEvents();
  }

  async function removeEvent(id: string) {
    await deleteEvent(id);
    await fetchEvents();
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