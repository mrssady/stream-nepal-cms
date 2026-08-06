import api from "./api";

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export async function login(
  data: LoginDto,
): Promise<LoginResponse> {
  const response = await api.post("/auth/login", data);

  return response.data;
}