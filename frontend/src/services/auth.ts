import api from "./api";

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId?: string | null;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export async function login(
  data: LoginDto,
): Promise<LoginResponse> {
  const response = await api.post(
    "/auth/login",
    data,
  );

  return response.data.data;
}

export async function getMe(): Promise<AuthUser> {
  const response = await api.get("/auth/me");

  return response.data.data;
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email });
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  await api.post("/auth/reset-password", { token, newPassword });
}

export async function verifyEmail(token: string): Promise<void> {
  await api.post("/auth/verify-email", { token });
}

export async function resendVerification(email: string): Promise<void> {
  await api.post("/auth/resend-verification", { email });
}
