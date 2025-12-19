// src/api/hoteles.js
import api from "./axios";

// GET /api/hoteles  -> lista de hoteles
export async function getHoteles() {
    const res = await api.get("/hoteles");
    if (!Array.isArray(res.data)) {
        console.error("API Error: getHoteles expects array but got:", res.data);
        return [];
    }
    return res.data; // array de hoteles
}

// POST /api/hoteles -> crear hotel
export async function crearHotel(hotel) {
    // hotel debe tener: nombre, direccion, ciudad, pais, telefono, email, activo
    const res = await api.post("/hoteles", hotel);
    return res.data; // hotel creado
}

// ✅ NUEVO: actualizar hotel
export async function actualizarHotel(id, hotel) {
    // Asumo que tu backend usa PUT /api/hoteles/{id}
    const res = await api.put(`/hoteles/${id}`, hotel);
    return res.data;
}

// ✅ NUEVO: eliminar hotel
export async function eliminarHotel(id) {
    // Asumo que tu backend usa DELETE /api/hoteles/{id}
    const res = await api.delete(`/hoteles/${id}`);
    return res.data;
}
