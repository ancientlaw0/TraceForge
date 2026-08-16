import api from "./client";


export async function getUsageLimits() {
    const response = await api.get(
        "/usage/limits"
    );

    return response.data;
}


export async function updateUsageLimits(payload) {
    const response = await api.patch(
        "/usage/limits",
        payload
    );

    return response.data;
}


export async function deleteUsageLimits() {
    const response = await api.delete(
        "/usage/limits"
    );

    return response.data;
}