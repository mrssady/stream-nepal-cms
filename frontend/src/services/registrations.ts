import api from "./api";

import type {
  CreateRegistrationDto,
  Registration,
  UpdateRegistrationDto,
} from "@/types/registration";

export async function getRegistrations(): Promise<
  Registration[]
> {
  const response = await api.get("/registrations");

  return response.data.data;
}

export async function createRegistration(
  data: CreateRegistrationDto,
): Promise<Registration> {
  const response = await api.post(
    "/registrations",
    data,
  );

  return response.data.data;
}

export async function updateRegistration(
  id: string,
  data: UpdateRegistrationDto,
): Promise<Registration> {
  const response = await api.patch(
    `/registrations/${id}`,
    data,
  );

  return response.data.data;
}

export async function deleteRegistration(
  id: string,
): Promise<void> {
  await api.delete(`/registrations/${id}`);
}