import { io, type Socket } from "socket.io-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

let liveSocket: Socket | null = null;

export function getLiveSocket(): Socket {
  if (!liveSocket) {
    liveSocket = io(`${API_ORIGIN}/live`);
  }

  return liveSocket;
}

export function liveApiOrigin(): string {
  return API_ORIGIN;
}