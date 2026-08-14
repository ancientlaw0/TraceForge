import api from "./client";


export async function getApiKeys() {
    const response = await api.get("/api-keys/");

    return response.data;
}


export async function createApiKey(name) {
    const response = await api.post("/api-keys/", {
        name,
    });

    return response.data;
}


export async function revokeApiKey(keyId) {
    await api.delete(`/api-keys/${keyId}`);
}