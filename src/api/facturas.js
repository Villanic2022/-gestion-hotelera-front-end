// src/api/facturas.js
import api from "./axios";

// OBTENER HISTORIAL DE FACTURAS: GET /api/facturas
export async function getFacturas() {
    try {
        const res = await api.get("/facturas");
        return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
        console.error('Error fetching facturas:', error);
        return [];
    }
}

// EMITIR FACTURA: POST /api/facturas/emitir
export async function emitirFactura(datos) {
    const res = await api.post("/facturas/emitir", datos);
    return res.data;
}

// OBTENER DETALLES DE FACTURA: GET /api/facturas/{id}
export async function getFacturaDetalle(id) {
    const res = await api.get(`/facturas/${id}`);
    return res.data;
}

