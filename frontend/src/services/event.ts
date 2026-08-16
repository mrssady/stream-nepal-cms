import api from "./api";

export interface EventSeries {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
}

export interface EventPhoto {
  id: string;
  eventId: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
  thumbnailUrl: string | null;
  featured: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type EventVideoPlatform =
  | "YOUTUBE"
  | "FACEBOOK"
  | "VIMEO"
  | "OTHER";

export interface EventVideo {
  id: string;
  eventId: string;
  title: string;
  description: string | null;
  platform: EventVideoPlatform;
  videoUrl: string;
  thumbnailUrl: string | null;
  featured: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventTimeline {
  id: string;
  eventId: string;
  title: string;
  description: string | null;
  timelineDate: string;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EventSponsorTier =
  | "TITLE"
  | "GOLD"
  | "SILVER"
  | "BRONZE"
  | "MEDIA_PARTNER"
  | "PARTNER";

export interface EventSponsor {
  id: string;
  eventId: string;
  sponsorId: string;
  tier: EventSponsorTier;
  featured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  sponsor: {
    id: string;
    name: string;
    logo: string | null;
    website: string | null;
  };
}

export interface Event {
  id: string;

  organizationId: string;

  eventSeriesId: string | null;
  eventSeries: EventSeries | null;

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

  featured: boolean;
  isActive: boolean;
  displayOrder: number;

  photos?: EventPhoto[];
  videos?: EventVideo[];
  timeline?: EventTimeline[];
  sponsors?: EventSponsor[];

  _count?: {
    photos: number;
    videos: number;
  };

  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDto {
  title: string;
  slug: string;

  eventSeriesId?: string;

  shortDescription?: string;
  description?: string;

  coverImage?: string;

  category?: string;
  client?: string;
  organizer?: string;
  location?: string;

  eventDate: string;

  eventUrl?: string;

  featured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateEventDto {
  title?: string;
  slug?: string;

  eventSeriesId?: string | null;

  shortDescription?: string;
  description?: string;

  coverImage?: string;

  category?: string;
  client?: string;
  organizer?: string;
  location?: string;

  eventDate?: string;

  eventUrl?: string;

  featured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

export async function getEvents(): Promise<Event[]> {
  const response = await api.get("/events");

  return response.data.data;
}

export async function getEventById(
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