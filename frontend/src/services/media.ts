import api from "./api";

import {
  type CreateMediaDto,
  type Media,
  type UpdateMediaDto,
} from "@/types/media";

export async function getMedia(): Promise<Media[]> {
  const response = await api.get("/media");

  return response.data.data;
}

export async function getMediaItem(
  id: string,
): Promise<Media> {
  const response = await api.get(
    `/media/${id}`,
  );

  return response.data.data;
}

export async function createMedia(
  data: CreateMediaDto,
): Promise<Media> {
  const response = await api.post(
    "/media",
    data,
  );

  return response.data.data;
}

export async function updateMedia(
  id: string,
  data: UpdateMediaDto,
): Promise<Media> {
  const response = await api.patch(
    `/media/${id}`,
    data,
  );

  return response.data.data;
}

export async function deleteMedia(
  id: string,
): Promise<void> {
  await api.delete(`/media/${id}`);
}