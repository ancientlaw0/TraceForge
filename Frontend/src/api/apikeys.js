import api from "./client";

export async function getAPIKeys() {
    const response = await api.get("/api-keys/");
    return response.data;
}

export async function createAPIKey(name) {
    const response = await api.post("/api-keys/", {
        name,
    });

    return response.data;
}

export async function revokeAPIKey(keyId) {
    await api.delete(`/api-keys/${keyId}`);
}