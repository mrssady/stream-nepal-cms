import api from "./api";

import {
  type Project,
  type CreateProjectDto,
  type UpdateProjectDto,
} from "@/types/project";

export async function getProjects(): Promise<Project[]> {
  const response = await api.get("/projects");

  return response.data.data;
}

export async function getProject(
  id: string,
): Promise<Project> {
  const response = await api.get(
    `/projects/${id}`,
  );

  return response.data.data;
}

export async function createProject(
  data: CreateProjectDto,
): Promise<Project> {
  const response = await api.post(
    "/projects",
    data,
  );

  return response.data.data;
}

export async function updateProject(
  id: string,
  data: UpdateProjectDto,
): Promise<Project> {
  const response = await api.patch(
    `/projects/${id}`,
    data,
  );

  return response.data.data;
}

export async function deleteProject(
  id: string,
): Promise<void> {
  await api.delete(`/projects/${id}`);
}