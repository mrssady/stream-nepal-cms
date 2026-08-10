import api from "./api";

export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  coverImage: string | null;
  client: string | null;
  category: string | null;
  projectDate: string | null;
  projectUrl: string | null;
  featured: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  coverImage?: string;
  client?: string;
  category?: string;
  projectDate?: string;
  projectUrl?: string;
  featured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

export type UpdateProjectDto =
  Partial<CreateProjectDto>;

export async function getProjects(): Promise<
  Project[]
> {
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
): Promise<Project> {
  const response = await api.delete(
    `/projects/${id}`,
  );
  return response.data.data;
}