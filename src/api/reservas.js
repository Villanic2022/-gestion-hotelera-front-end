// src/api/reservas.js
import api from "./axios";

// GET /api/reservas
export async function getReservas() {
    const res = await api.get("/reservas");
    return res.data; // array de reservas
}

// POST /api/reservas
export async function crearReserva(reserva) {
    const res = await api.post("/reservas", reserva);
    return res.data; // reserva creada
}

// ⭐ NUEVO: disponibilidad de UNA habitación
// GET /api/reservas/disponibilidad/habitacion?habitacionId=1&checkIn=...&checkOut=...
export async function checkDisponibilidadHabitacion({
    habitacionId,
    checkIn,
    checkOut,
}) {
    const res = await api.get("/reservas/disponibilidad/habitacion", {
        params: {
            habitacionId,
            checkIn,
            checkOut,
        },
    });

    // No sabemos la forma exacta del JSON, así que devolvemos tal cual:
    return res.data;
}

// ⭐ NUEVO: disponibilidad / resumen de un hotel
// GET /api/reservas/disponibilidad/hotel?hotelId=1&checkIn=...&checkOut=...
export async function getDisponibilidadHotel({ hotelId, checkIn, checkOut }) {
    const res = await api.get("/reservas/disponibilidad/hotel", {
        params: { hotelId, checkIn, checkOut },
    });
    return res.data; // puede ser array u objeto
}

// Crear seña para una reserva
// POST /api/reservas/{id}/senia
export async function crearSenia(reservaId, pagoSenia) {
    const res = await api.post(`/reservas/${reservaId}/senia`, pagoSenia);
    return res.data; // reserva actualizada
}

// ⭐ Cancelar reserva
// PUT /api/reservas/{id}/cancelar
export async function cancelarReserva(reservaId) {
    const res = await api.put(`/reservas/${reservaId}/cancelar`);
    return res.data; // reserva actualizada
}

// ⭐ Check-in reserva
// PUT /api/reservas/{id}/checkin
export async function checkinReserva(reservaId) {
    const res = await api.put(`/reservas/${reservaId}/checkin`);
    return res.data;
}

// ⭐ Check-out reserva
// PUT /api/reservas/{id}/checkout
export async function checkoutReserva(reservaId) {
    const res = await api.put(`/reservas/${reservaId}/checkout`);
    return res.data;
}

// ⭐ NUEVO: obtener pagos de una reserva
// GET /api/reservas/{id}/pagos
export async function getReservaPagos(reservaId) {
    const res = await api.get(`/reservas/${reservaId}/pagos`);
    return res.data; // {reservaId, totalPagado, precioTotal, saldoPendiente, estadoPago, pagos: [...]}
}
