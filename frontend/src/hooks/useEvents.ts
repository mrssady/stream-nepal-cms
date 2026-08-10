"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createTournament,
  deleteTournament,
  getTournaments,
  updateTournament,
} from "@/services/tournaments";

import {
  type CreateTournamentDto,
  type Tournament,
  type UpdateTournamentDto,
} from "@/types/tournament";

export function useEvents() {
  const [events, setEvents] =
    useState<Tournament[]>([]);

  const [loading, setLoading] =
    useState(true);

  const fetchEvents = useCallback(
    async () => {
      try {
        setLoading(true);

        const data =
          await getTournaments();

        setEvents(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  async function addEvent(
    data: CreateTournamentDto,
  ) {
    const created =
      await createTournament(data);

    setEvents((current) => [
      created,
      ...current,
    ]);
  }

  async function editEvent(
    id: string,
    data: UpdateTournamentDto,
  ) {
    const updated =
      await updateTournament(
        id,
        data,
      );

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
    await deleteTournament(id);

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