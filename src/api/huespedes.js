// src/api/huespedes.js
import api from "./axios";

// GET /api/huespedes
export async function getHuespedes() {
    const res = await api.get("/huespedes");
    return res.data;
}

// POST /api/huespedes
export async function crearHuesped(huesped) {
    const res = await api.post("/huespedes", huesped);
    return res.data;
}

// PUT /api/huespedes/{id}
export async function actualizarHuesped(id, huesped) {
    const res = await api.put(`/huespedes/${id}`, huesped);
    return res.data;
}

// DELETE /api/huespedes/{id}
export async function eliminarHuesped(id) {
    const res = await api.delete(`/huespedes/${id}`);
    return res.data;
}
