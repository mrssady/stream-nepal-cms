import { api } from "./api";

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const response = await api.post("/auth/login", credentials);

  // Backend response:
  // {
  //   success: true,
  //   statusCode: 201,
  //   data: {
  //     access_token: "...",
  //     user: {...}
  //   }
  // }

  return response.data.data;
}

export async function getProfile() {
  const response = await api.get("/auth/me");

  return response.data;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
  }
}