import { api } from "./api";
import {
  User,
  CreateUserDto,
  UpdateUserDto,
} from "@/types/user";

export async function getUsers(): Promise<User[]> {
  const response = await api.get("/users");
  return response.data.data;
}

export async function getUser(
  id: string,
): Promise<User> {
  const response = await api.get(`/users/${id}`);
  return response.data.data;
}

export async function createUser(
  data: CreateUserDto,
): Promise<User> {
  const response = await api.post("/users", data);
  return response.data.data;
}

export async function updateUser(
  id: string,
  data: UpdateUserDto,
): Promise<User> {
  const response = await api.patch(
    `/users/${id}`,
    data,
  );

  return response.data.data;
}

export async function deleteUser(
  id: string,
): Promise<User> {
  const response = await api.delete(
    `/users/${id}`,
  );

  return response.data.data;
}