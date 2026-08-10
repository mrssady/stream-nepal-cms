import api from "./api";

import {
  type CreateTournamentDto,
  type Tournament,
  type UpdateTournamentDto,
} from "@/types/tournament";

export async function getTournaments(): Promise<
  Tournament[]
> {
  const response = await api.get(
    "/tournaments",
  );

  return response.data.data;
}

export async function getTournament(
  id: string,
): Promise<Tournament> {
  const response = await api.get(
    `/tournaments/${id}`,
  );

  return response.data.data;
}

export async function createTournament(
  data: CreateTournamentDto,
): Promise<Tournament> {
  const response = await api.post(
    "/tournaments",
    data,
  );

  return response.data.data;
}

export async function updateTournament(
  id: string,
  data: UpdateTournamentDto,
): Promise<Tournament> {
  const response = await api.patch(
    `/tournaments/${id}`,
    data,
  );

  return response.data.data;
}

export async function deleteTournament(
  id: string,
): Promise<void> {
  await api.delete(
    `/tournaments/${id}`,
  );
}