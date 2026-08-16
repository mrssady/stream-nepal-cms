import api from "./api";

import type {
  EventPhoto,
  EventSponsor,
  EventSponsorTier,
  EventTimeline,
  EventVideo,
} from "./event";

export interface CreateEventPhotoDto {
  title?: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  featured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateEventPhotoDto {
  title?: string;
  description?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  featured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

export interface CreateEventVideoDto {
  title: string;
  description?: string;
  platform:
    | "YOUTUBE"
    | "FACEBOOK"
    | "VIMEO"
    | "OTHER";
  videoUrl: string;
  thumbnailUrl?: string;
  featured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateEventVideoDto {
  title?: string;
  description?: string;
  platform?:
    | "YOUTUBE"
    | "FACEBOOK"
    | "VIMEO"
    | "OTHER";
  videoUrl?: string;
  thumbnailUrl?: string;
  featured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

export interface CreateEventTimelineDto {
  title: string;
  description?: string;
  timelineDate: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
  featured?: boolean;
}

export interface UpdateEventTimelineDto {
  title?: string;
  description?: string;
  timelineDate?: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
  featured?: boolean;
}

export interface CreateEventSponsorDto {
  sponsorId: string;
  tier?: EventSponsorTier;
  featured?: boolean;
  displayOrder?: number;
}

export interface UpdateEventSponsorDto {
  sponsorId?: string;
  tier?: EventSponsorTier;
  featured?: boolean;
  displayOrder?: number;
}

/* PHOTOS */

export async function getEventPhotos(
  eventId: string,
): Promise<EventPhoto[]> {
  const response = await api.get(
    `/events/${eventId}/photos`,
  );

  return response.data.data;
}

export async function createEventPhoto(
  eventId: string,
  data: CreateEventPhotoDto,
): Promise<EventPhoto> {
  const response = await api.post(
    `/events/${eventId}/photos`,
    data,
  );

  return response.data.data;
}

export async function updateEventPhoto(
  eventId: string,
  id: string,
  data: UpdateEventPhotoDto,
): Promise<EventPhoto> {
  const response = await api.patch(
    `/events/${eventId}/photos/${id}`,
    data,
  );

  return response.data.data;
}

export async function deleteEventPhoto(
  eventId: string,
  id: string,
): Promise<void> {
  await api.delete(
    `/events/${eventId}/photos/${id}`,
  );
}

/* VIDEOS */

export async function getEventVideos(
  eventId: string,
): Promise<EventVideo[]> {
  const response = await api.get(
    `/events/${eventId}/videos`,
  );

  return response.data.data;
}

export async function createEventVideo(
  eventId: string,
  data: CreateEventVideoDto,
): Promise<EventVideo> {
  const response = await api.post(
    `/events/${eventId}/videos`,
    data,
  );

  return response.data.data;
}

export async function updateEventVideo(
  eventId: string,
  id: string,
  data: UpdateEventVideoDto,
): Promise<EventVideo> {
  const response = await api.patch(
    `/events/${eventId}/videos/${id}`,
    data,
  );

  return response.data.data;
}

export async function deleteEventVideo(
  eventId: string,
  id: string,
): Promise<void> {
  await api.delete(
    `/events/${eventId}/videos/${id}`,
  );
}

/* TIMELINE */

export async function getEventTimeline(
  eventId: string,
): Promise<EventTimeline[]> {
  const response = await api.get(
    `/events/${eventId}/timeline`,
  );

  return response.data.data;
}

export async function createEventTimeline(
  eventId: string,
  data: CreateEventTimelineDto,
): Promise<EventTimeline> {
  const response = await api.post(
    `/events/${eventId}/timeline`,
    data,
  );

  return response.data.data;
}

export async function updateEventTimeline(
  eventId: string,
  id: string,
  data: UpdateEventTimelineDto,
): Promise<EventTimeline> {
  const response = await api.patch(
    `/events/${eventId}/timeline/${id}`,
    data,
  );

  return response.data.data;
}

export async function deleteEventTimeline(
  eventId: string,
  id: string,
): Promise<void> {
  await api.delete(
    `/events/${eventId}/timeline/${id}`,
  );
}

/* SPONSORS */

export async function getEventSponsors(
  eventId: string,
): Promise<EventSponsor[]> {
  const response = await api.get(
    `/events/${eventId}/sponsors`,
  );

  return response.data.data;
}

export async function createEventSponsor(
  eventId: string,
  data: CreateEventSponsorDto,
): Promise<EventSponsor> {
  const response = await api.post(
    `/events/${eventId}/sponsors`,
    data,
  );

  return response.data.data;
}

export async function updateEventSponsor(
  eventId: string,
  id: string,
  data: UpdateEventSponsorDto,
): Promise<EventSponsor> {
  const response = await api.patch(
    `/events/${eventId}/sponsors/${id}`,
    data,
  );

  return response.data.data;
}

export async function deleteEventSponsor(
  eventId: string,
  id: string,
): Promise<void> {
  await api.delete(
    `/events/${eventId}/sponsors/${id}`,
  );
}