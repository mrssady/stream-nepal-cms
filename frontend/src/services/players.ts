import api from "./api";

import type {
  CreatePlayerDto,
  Player,
  TournamentTeam,
  UpdatePlayerDto,
} from "@/types/player";

export async function getPlayers(): Promise<
  Player[]
> {
  const response = await api.get("/players");

  return response.data.data;
}

export async function createPlayer(
  data: CreatePlayerDto,
): Promise<Player> {
  const response = await api.post(
    "/players",
    data,
  );

  return response.data.data;
}

export async function updatePlayer(
  id: string,
  data: UpdatePlayerDto,
): Promise<Player> {
  const response = await api.patch(
    `/players/${id}`,
    data,
  );

  return response.data.data;
}

export async function deletePlayer(
  id: string,
): Promise<void> {
  await api.delete(`/players/${id}`);
}

export async function getTournamentTeams(): Promise<
  TournamentTeam[]
> {
  const response = await api.get(
    "/tournament-teams",
  );

  return response.data.data;
}