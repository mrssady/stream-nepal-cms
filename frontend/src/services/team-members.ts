import api from "./api";

import type {
  CreateTeamMemberDto,
  TeamMember,
  UpdateTeamMemberDto,
} from "@/types/team-member";

export async function getTeamMembers(): Promise<
  TeamMember[]
> {
  const response = await api.get("/team");

  return response.data.data;
}

export async function createTeamMember(
  data: CreateTeamMemberDto,
): Promise<TeamMember> {
  const response = await api.post(
    "/team",
    data,
  );

  return response.data.data;
}

export async function updateTeamMember(
  id: string,
  data: UpdateTeamMemberDto,
): Promise<TeamMember> {
  const response = await api.patch(
    `/team/${id}`,
    data,
  );

  return response.data.data;
}

export async function deleteTeamMember(
  id: string,
): Promise<void> {
  await api.delete(`/team/${id}`);
}