import axios from "axios";

const api = axios.create({
    // baseURL: "http://localhost:8080/api",
    baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Interceptor: agrega el JWT a cada request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
