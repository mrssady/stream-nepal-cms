"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createEventSeries,
  deleteEventSeries,
  getEventSeries,
  updateEventSeries,
} from "@/services/event-series";

import type {
  CreateEventSeriesDto,
  EventSeries,
  UpdateEventSeriesDto,
} from "@/types/event-series";

export function useEventSeries() {
  const [series, setSeries] = useState<
    EventSeries[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const fetchSeries = useCallback(
    async () => {
      try {
        setLoading(true);

        const data =
          await getEventSeries();

        setSeries(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchSeries();
  }, [fetchSeries]);

  async function addSeries(
    data: CreateEventSeriesDto,
  ) {
    const created =
      await createEventSeries(data);

    setSeries((current) => [
      created,
      ...current,
    ]);
  }

  async function editSeries(
    id: string,
    data: UpdateEventSeriesDto,
  ) {
    const updated =
      await updateEventSeries(
        id,
        data,
      );

    setSeries((current) =>
      current.map((item) =>
        item.id === id
          ? updated
          : item,
      ),
    );
  }

  async function removeSeries(
    id: string,
  ) {
    await deleteEventSeries(id);

    setSeries((current) =>
      current.filter(
        (item) => item.id !== id,
      ),
    );
  }

  return {
    series,
    loading,
    fetchSeries,
    addSeries,
    editSeries,
    removeSeries,
  };
}