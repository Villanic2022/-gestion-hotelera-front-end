// src/api/facturas.js
import api from "./axios";

// OBTENER HISTORIAL DE FACTURAS: GET /api/facturas
export async function getFacturas() {
    const res = await api.get("/facturas");
    return res.data;
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

