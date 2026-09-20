import Cookies from "js-cookie";

const TOKEN_KEY = "access_token";
const USER_KEY = "user";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId?: string | null;
}

export function saveToken(token: string) {
  if (!token || token === "undefined" || token === "null") {
    throw new Error("Invalid access token");
  }

  Cookies.set(TOKEN_KEY, token, {
    expires: 7,
    sameSite: "Lax",
  });
}

export function getToken() {
  const token = Cookies.get(TOKEN_KEY);

  if (!token || token === "undefined" || token === "null") {
    return undefined;
  }

  return token;
}

export function removeToken() {
  Cookies.remove(TOKEN_KEY);
}

export function saveUser(user: StoredUser) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): StoredUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(USER_KEY);

  if (!raw || raw === "undefined" || raw === "null") {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function removeUser() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(USER_KEY);
}

export function logout(redirect = "/login") {
  removeToken();
  removeUser();

  if (typeof window === "undefined") {
    return;
  }

  const target =
    typeof redirect === "string" &&
    redirect.length > 0
      ? redirect
      : "/login";

  if (window.location.pathname !== target) {
    window.location.href = target;
  }
}
