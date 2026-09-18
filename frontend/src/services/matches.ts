import api from "./api";

import type {
  CreateMatchDto,
  Match,
  UpdateMatchDto,
} from "@/types/match";

export async function getMatches(): Promise<
  Match[]
> {
  const response = await api.get("/matches");

  return response.data.data;
}

export async function createMatch(
  data: CreateMatchDto,
): Promise<Match> {
  const response = await api.post(
    "/matches",
    data,
  );

  return response.data.data;
}

export async function updateMatch(
  id: string,
  data: UpdateMatchDto,
): Promise<Match> {
  const response = await api.patch(
    `/matches/${id}`,
    data,
  );

  return response.data.data;
}

export async function deleteMatch(
  id: string,
): Promise<void> {
  await api.delete(`/matches/${id}`);
}