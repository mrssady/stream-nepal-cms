import api from "./api";

export interface Team {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  createdAt: string;
}

export interface CreateTeamDto {
  name: string;
  logo?: string;
  description?: string;
}

export interface UpdateTeamDto {
  name?: string;
  logo?: string;
  description?: string;
}

export async function getTeams(): Promise<Team[]> {
  const response = await api.get("/teams");
  return response.data.data;
}

export async function getTeam(
  id: string,
): Promise<Team> {
  const response = await api.get(`/teams/${id}`);
  return response.data.data;
}

export async function createTeam(
  data: CreateTeamDto,
): Promise<Team> {
  const response = await api.post("/teams", data);
  return response.data.data;
}

export async function updateTeam(
  id: string,
  data: UpdateTeamDto,
): Promise<Team> {
  const response = await api.patch(
    `/teams/${id}`,
    data,
  );

  return response.data.data;
}

export async function deleteTeam(
  id: string,
): Promise<Team> {
  const response = await api.delete(`/teams/${id}`);
  return response.data.data;
}