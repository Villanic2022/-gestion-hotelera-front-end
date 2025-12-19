// src/api/dashboard.js
import api from "./axios";

// GET /api/dashboard/dia?hotelId=...&fecha=...
export async function getDashboardDia({ hotelId, fecha }) {
    const res = await api.get("/dashboard/dia", {
        params: {
            hotelId,
            fecha, // formato "YYYY-MM-DD"
        },
    });
    return res.data;
}
