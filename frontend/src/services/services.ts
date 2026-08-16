import api from "./api";

import {
  type Service,
  type CreateServiceDto,
  type UpdateServiceDto,
} from "@/types/service";

export async function getServices(): Promise<Service[]> {
  const response = await api.get("/services");

  return response.data.data;
}

export async function getService(
  id: string,
): Promise<Service> {
  const response = await api.get(
    `/services/${id}`,
  );

  return response.data.data;
}

export async function getPublicServices(): Promise<
  Service[]
> {
  const response = await api.get(
    "/public/services",
  );

  return response.data.data;
}

export async function getPublicService(
  slug: string,
): Promise<Service> {
  const response = await api.get(
    `/public/services/${slug}`,
  );

  return response.data.data;
}

export async function createService(
  data: CreateServiceDto,
): Promise<Service> {
  const response = await api.post(
    "/services",
    data,
  );

  return response.data.data;
}

export async function updateService(
  id: string,
  data: UpdateServiceDto,
): Promise<Service> {
  const response = await api.patch(
    `/services/${id}`,
    data,
  );

  return response.data.data;
}

export async function deleteService(
  id: string,
): Promise<void> {
  await api.delete(`/services/${id}`);
}