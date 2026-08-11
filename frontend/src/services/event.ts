import api from "./api";

export interface EventSeries {
  id: string;
  title: string;
  slug: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  coverImage: string | null;
  category: string | null;
  client: string | null;
  organizer: string | null;
  location: string | null;
  eventDate: string;
  eventUrl: string | null;
  eventSeriesId: string | null;
  featured: boolean;
  isActive: boolean;
  displayOrder: number;
  eventSeries?: EventSeries | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDto {
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  coverImage?: string;
  category?: string;
  client?: string;
  organizer?: string;
  location?: string;
  eventDate: string;
  eventUrl?: string;
  eventSeriesId?: string;
  featured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateEventDto {
  title?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  coverImage?: string;
  category?: string;
  client?: string;
  organizer?: string;
  location?: string;
  eventDate?: string;
  eventUrl?: string;
  eventSeriesId?: string;
  featured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

export async function getEvents(): Promise<Event[]> {
  const response = await api.get("/events");

  return response.data.data;
}

export async function getEvent(
  id: string,
): Promise<Event> {
  const response = await api.get(
    `/events/${id}`,
  );

  return response.data.data;
}

export async function createEvent(
  data: CreateEventDto,
): Promise<Event> {
  const response = await api.post(
    "/events",
    data,
  );

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
): Promise<void> {
  await api.delete(`/events/${id}`);
}