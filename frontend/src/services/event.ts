import api from "./api";

export interface Event {
  id: string;
  title: string;
  game: string;
  location: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface CreateEventDto {
  title: string;
  game: string;
  location: string;
  startDate: string;
  endDate: string;
}

export interface UpdateEventDto {
  title?: string;
  game?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
}

export async function getEvents(): Promise<Event[]> {
  const response = await api.get("/events");
  return response.data.data;
}

export async function createEvent(
  data: CreateEventDto,
): Promise<Event> {
  const response = await api.post("/events", data);
  return response.data.data;
}

export async function updateEvent(
  id: string,
  data: UpdateEventDto,
): Promise<Event> {
  const response = await api.patch(
    `/events/${id}`,
    data,
  );

  return response.data.data;
}

export async function deleteEvent(
  id: string,
): Promise<Event> {
  const response = await api.delete(
    `/events/${id}`,
  );

  return response.data.data;
}