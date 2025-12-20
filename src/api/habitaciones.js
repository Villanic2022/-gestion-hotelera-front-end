// src/api/habitaciones.js
import api from "./axios";

// GET /api/habitaciones
export async function getHabitaciones() {
    try {
        const res = await api.get("/habitaciones");
        return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
        console.error('Error al cargar habitaciones:', error);
        return [];
    }
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
