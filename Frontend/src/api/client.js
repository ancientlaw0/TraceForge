import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
        "Content-Type": "application/json",
    },
});


// Attach JWT to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// Handle global authentication failures
api.interceptors.response.use(
    (response) => {
        return response;
    },

    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("access_token");

            // Don't redirect repeatedly if already on auth pages
            const path = window.location.pathname;

            if (
                path !== "/auth/login" &&
                path !== "/auth/signup"
            ) {
                window.location.href = "/auth/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;