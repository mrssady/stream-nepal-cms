import api from "./api";

export interface PublicEventSeries {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
}

export interface PublicEventPhoto {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
  thumbnailUrl: string | null;
  featured: boolean;
  displayOrder: number;
}

export interface PublicEventVideo {
  id: string;
  title: string;
  description: string | null;
  platform:
    | "YOUTUBE"
    | "FACEBOOK"
    | "VIMEO"
    | "OTHER";
  videoUrl: string;
  thumbnailUrl: string | null;
  featured: boolean;
  displayOrder: number;
}

export interface PublicEventTimeline {
  id: string;
  title: string;
  description: string | null;
  timelineDate: string;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  featured: boolean;
}

export interface PublicEvent {
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

  featured: boolean;
  isActive: boolean;
  displayOrder: number;

  eventSeries: PublicEventSeries | null;

  photos: PublicEventPhoto[];
  videos: PublicEventVideo[];
  timeline: PublicEventTimeline[];

  createdAt: string;
  updatedAt: string;
}

export async function getPublicEvents(): Promise<
  PublicEvent[]
> {
  const response = await api.get(
    "/public/events",
  );

  return response.data.data;
}

export async function getPublicEventBySlug(
  slug: string,
): Promise<PublicEvent> {
  const response = await api.get(
    `/public/events/${slug}`,
  );

  return response.data.data;
}