import api from "./api";

export interface Service {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  image: string | null;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDto {
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
  featured?: boolean;
}

export type UpdateServiceDto =
  Partial<CreateServiceDto>;

export async function getServices(): Promise<Service[]> {
  const response = await api.get("/services");
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
): Promise<Service> {
  const response = await api.delete(
    `/services/${id}`,
  );

  return response.data.data;
}