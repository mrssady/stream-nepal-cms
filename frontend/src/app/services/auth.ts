import { api } from "./api";

export async function login(email: string, password: string) {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  const { access_token, user } = response.data;

  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", access_token);
    localStorage.setItem("user", JSON.stringify(user));
  }

  return user;
}

export async function getProfile() {
  const response = await api.get("/auth/me");
  return response.data;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  }
}