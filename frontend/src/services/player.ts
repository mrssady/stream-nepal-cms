import api from "./api";

export interface Player {
  id: string;
  name: string;
  gameName: string;
  teamId?: string;
  createdAt: string;
}

export interface CreatePlayerDto {
  name: string;
  gameName: string;
  teamId?: string;
}

export interface UpdatePlayerDto {
  name?: string;
  gameName?: string;
  teamId?: string;
}

export async function getPlayers(): Promise<Player[]> {
  const response = await api.get("/players");
  return response.data.data;
}

export async function createPlayer(
  data: CreatePlayerDto,
): Promise<Player> {
  const response = await api.post("/players", data);
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
): Promise<Player> {
  const response = await api.delete(
    `/players/${id}`,
  );

  return response.data.data;
}