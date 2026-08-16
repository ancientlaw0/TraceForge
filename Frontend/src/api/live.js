import api from "./client";


// Initial snapshot from the database
export async function getLive(since) {
    const response = await api.get("/live", {
        params: {
            since,
        },
    });

    return response.data;
}


// WebSocket connection
export function createLiveWebSocket(token, since) {

    const protocol =
        window.location.protocol === "https:"
            ? "wss:"
            : "ws:";

    const host =
        window.location.host;

    const url =
        `ws://localhost:8000/live/ws` +
        `?token=${encodeURIComponent(token)}` +
        `&since=${encodeURIComponent(since)}`;

    return new WebSocket(url);
}