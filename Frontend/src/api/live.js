import { getToken } from "./auth";

const WS_URL =
  import.meta.env.VITE_WS_URL ||
  "ws://localhost:8000/live/ws";

export function createLiveSocket(since) {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated.");
  }

  const params = new URLSearchParams({
    token,
    since: since.toISOString(),
  });

  return new WebSocket(
    `${WS_URL}?${params.toString()}`
  );
}