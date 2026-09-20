import api from "./api";

import {
  type Organization,
  type CreateOrganizationDto,
  type UpdateOrganizationDto,
} from "@/types/organization";

export async function getOrganizations(): Promise<Organization[]> {
  const response = await api.get("/organizations");

  return response.data.data;
}

export async function getOrganization(
  id: string,
): Promise<Organization> {
  const response = await api.get(
    `/organizations/${id}`,
  );

  return response.data.data;
}

export async function createOrganization(
  data: CreateOrganizationDto,
): Promise<Organization> {
  const response = await api.post(
    "/organizations",
    data,
  );

  return response.data.data;
}

export async function updateOrganization(
  id: string,
  data: UpdateOrganizationDto,
): Promise<Organization> {
  const response = await api.patch(
    `/organizations/${id}`,
    data,
  );

  return response.data.data;
}

export async function deleteOrganization(
  id: string,
): Promise<void> {
  await api.delete(`/organizations/${id}`);
}