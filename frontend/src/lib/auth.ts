import Cookies from "js-cookie";

const TOKEN_KEY = "access_token";

export function saveToken(token: string) {
  Cookies.set(TOKEN_KEY, token, {
    expires: 7,
    sameSite: "Lax",
  });
}

export function getToken() {
  return Cookies.get(TOKEN_KEY);
}

export function removeToken() {
  Cookies.remove(TOKEN_KEY);
} 