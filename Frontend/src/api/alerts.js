import api from "./client";

export async function getAlerts() {
    const response = await api.get("/alerts/");
    return response.data;
}


export async function getAlert(alertId) {
    const response = await api.get(
        `/alerts/${alertId}`
    );

    return response.data;
}


export async function createAlert(alert) {
    const response = await api.post(
        "/alerts/",
        alert
    );

    return response.data;
}


export async function updateAlert(
    alertId,
    alert
) {
    const response = await api.patch(
        `/alerts/${alertId}`,
        alert
    );

    return response.data;
}


export async function deleteAlert(alertId) {
    const response = await api.delete(
        `/alerts/${alertId}`
    );

    return response.data;
}