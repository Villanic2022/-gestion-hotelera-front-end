// src/api/tiposHabitacion.js
import api from "./axios";

// GET /api/tipos-habitacion
export async function getTiposHabitacion() {
    const res = await api.get("/tipos-habitacion");
    return res.data; // array
}

// POST /api/tipos-habitacion
export async function crearTipoHabitacion(tipo) {
    const res = await api.post("/tipos-habitacion", tipo);
    return res.data; // tipo creado
}

// PUT /api/tipos-habitacion/{id}
export async function actualizarTipoHabitacion(id, tipo) {
    const res = await api.put(`/tipos-habitacion/${id}`, tipo);
    return res.data;
}

// DELETE /api/tipos-habitacion/{id}
export async function eliminarTipoHabitacion(id) {
    const res = await api.delete(`/tipos-habitacion/${id}`);
    return res.data;
}
