import api from "./client";

export async function sendMessage(message) {
    const response = await api.post("/chat", {
        message,
    });

    return response.data;
}