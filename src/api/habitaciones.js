// src/api/habitaciones.js
import api from "./axios";

// GET /api/habitaciones
export async function getHabitaciones() {
    const res = await api.get("/habitaciones");
    return res.data;
}

// POST /api/habitaciones
export async function crearHabitacion(habitacion) {
    const res = await api.post("/habitaciones", habitacion);
    return res.data;
}

// PUT /api/habitaciones/{id}
export async function actualizarHabitacion(id, habitacion) {
    const res = await api.put(`/habitaciones/${id}`, habitacion);
    return res.data;
}

// DELETE /api/habitaciones/{id}
export async function eliminarHabitacion(id) {
    const res = await api.delete(`/habitaciones/${id}`);
    return res.data;
}
