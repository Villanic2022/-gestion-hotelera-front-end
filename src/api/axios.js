import axios from "axios";

const api = axios.create({
    baseURL: process.env.NODE_ENV === 'production' 
        ? "https://gestion-hotelera-47wa.onrender.com/api" 
        : "http://localhost:8080/api",
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
