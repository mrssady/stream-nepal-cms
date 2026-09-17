import api from "./api";

import {
  type CreateOcrProfileDto,
  type OcrProfile,
  type ScaledRoisPayload,
  type UpdateOcrProfileDto,
} from "@/types/ocr-profile";
import { type TournamentGame } from "@/types/tournament";

export async function getOcrProfiles(
  game?: TournamentGame,
): Promise<OcrProfile[]> {
  const response = await api.get(
    "/ocr-profiles",
    game ? { params: { game } } : undefined,
  );

  return response.data.data;
}

export async function getOcrProfile(id: string): Promise<OcrProfile> {
  const response = await api.get(`/ocr-profiles/${id}`);

  return response.data.data;
}

export async function createOcrProfile(
  data: CreateOcrProfileDto,
): Promise<OcrProfile> {
  const response = await api.post("/ocr-profiles", data);

  return response.data.data;
}

export async function updateOcrProfile(
  id: string,
  data: UpdateOcrProfileDto,
): Promise<OcrProfile> {
  const response = await api.patch(`/ocr-profiles/${id}`, data);

  return response.data.data;
}

export async function setDefaultOcrProfile(id: string): Promise<OcrProfile> {
  const response = await api.post(`/ocr-profiles/${id}/default`);

  return response.data.data;
}

export async function getScaledRois(
  id: string,
  width?: number,
  height?: number,
): Promise<ScaledRoisPayload> {
  const response = await api.get(`/ocr-profiles/${id}/rois`, {
    params: {
      width: width ?? undefined,
      height: height ?? undefined,
    },
  });

  return response.data.data;
}

export async function deleteOcrProfile(id: string): Promise<OcrProfile> {
  const response = await api.delete(`/ocr-profiles/${id}`);

  return response.data.data;
}