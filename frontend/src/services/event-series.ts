import api from "./api";

import type {
  CreateEventSeriesDto,
  EventSeries,
  UpdateEventSeriesDto,
} from "@/types/event-series";

export async function getEventSeries(): Promise<
  EventSeries[]
> {
  const response = await api.get("/event-series");

  return response.data.data;
}

export async function getEventSeriesById(
  id: string,
): Promise<EventSeries> {
  const response = await api.get(
    `/event-series/${id}`,
  );

  return response.data.data;
}

export async function createEventSeries(
  data: CreateEventSeriesDto,
): Promise<EventSeries> {
  const response = await api.post(
    "/event-series",
    data,
  );

  return response.data.data;
}

export async function updateEventSeries(
  id: string,
  data: UpdateEventSeriesDto,
): Promise<EventSeries> {
  const response = await api.patch(
    `/event-series/${id}`,
    data,
  );

  return response.data.data;
}

export async function deleteEventSeries(
  id: string,
): Promise<void> {
  await api.delete(`/event-series/${id}`);
}