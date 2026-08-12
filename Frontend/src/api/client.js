import axios from "axios"; //http requests

const api = axios.create({
    baseURL: "http://localhost:8000",
});

export default api;