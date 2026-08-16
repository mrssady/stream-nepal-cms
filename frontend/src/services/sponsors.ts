import api from "./api";

import {
  type CreateSponsorDto,
  type Sponsor,
  type UpdateSponsorDto,
} from "@/types/sponsors";

export async function getSponsors(): Promise<Sponsor[]> {
  const response = await api.get("/sponsors");

  return response.data.data;
}

export async function getSponsor(
  id: string,
): Promise<Sponsor> {
  const response = await api.get(
    `/sponsors/${id}`,
  );

  return response.data.data;
}

export async function createSponsor(
  data: CreateSponsorDto,
): Promise<Sponsor> {
  const response = await api.post(
    "/sponsors",
    data,
  );

  return response.data.data;
}

export async function updateSponsor(
  id: string,
  data: UpdateSponsorDto,
): Promise<Sponsor> {
  const response = await api.patch(
    `/sponsors/${id}`,
    data,
  );

  return response.data.data;
}

export async function deleteSponsor(
  id: string,
): Promise<void> {
  await api.delete(`/sponsors/${id}`);
}
