import Cookies from "js-cookie";

const TOKEN_KEY = "access_token";

export function saveToken(token: string) {
  if (
    !token ||
    token === "undefined" ||
    token === "null"
  ) {
    throw new Error("Invalid access token");
  }

  Cookies.set(TOKEN_KEY, token, {
    expires: 7,
    sameSite: "Lax",
  });
}

export function getToken() {
  const token = Cookies.get(TOKEN_KEY);

  if (
    !token ||
    token === "undefined" ||
    token === "null"
  ) {
    return undefined;
  }

  return token;
}

export function removeToken() {
  Cookies.remove(TOKEN_KEY);
}