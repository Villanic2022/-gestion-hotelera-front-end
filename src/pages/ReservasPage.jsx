// src/pages/ReservasPage.jsx
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
    getReservas,
    crearReserva,
    checkDisponibilidadHabitacion,
    getDisponibilidadHotel,
    crearSenia,
    cancelarReserva,
    checkinReserva,
    checkoutReserva,
    getReservaPagos,
} from "../api/reservas";
import { getHoteles } from "../api/hoteles";
import { getTiposHabitacion } from "../api/tipohabitacion";
import { getHabitaciones } from "../api/habitaciones";
import { getHuespedes, crearHuesped } from "../api/huespedes";
import { emitirFactura } from "../api/facturas";
import { useToast } from "../context/ToastContext";
import "../styles/crud.css";

export default function ReservasPage() {
    const { showToast } = useToast();
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);

    // Listas para selects
    const [hoteles, setHoteles] = useState([]);
    const [tiposHabitacion, setTiposHabitacion] = useState([]);
    const [habitaciones, setHabitaciones] = useState([]);
    const [huespedes, setHuespedes] = useState([]);

    // Campos del formulario de reserva
    const [hotelId, setHotelId] = useState("");
    const [tipoHabitacionId, setTipoHabitacionId] = useState("");
    const [habitacionId, setHabitacionId] = useState("");
    const [huespedTitularId, setHuespedTitularId] = useState("");
    const [acompanianteIds, setAcompanianteIds] = useState(""); // "2,3,4" de momento
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [adultos, setAdultos] = useState(2);
    const [ninos, setNinos] = useState(0);
    const [canal, setCanal] = useState("DIRECTO");
    const [precioTotal, setPrecioTotal] = useState(0);
    const [moneda, setMoneda] = useState("ARS");
    const [comentariosCliente, setComentariosCliente] = useState("");

    // ⭐ Disponibilidad habitación
    const [checkingDisp, setCheckingDisp] = useState(false);
    const [dispMsg, setDispMsg] = useState("");

    // ⭐ Disponibilidad hotel (resumen)
    const [hotelDisp, setHotelDisp] = useState(null);
    const [checkingHotelDisp, setCheckingHotelDisp] = useState(false);
    const [hotelDispError, setHotelDispError] = useState("");

    // ⭐ Pagos reserva
    const [pagosInfo, setPagosInfo] = useState(null);
    const [pagosReservaId, setPagosReservaId] = useState(null);
    const [loadingPagos, setLoadingPagos] = useState(false);
    const [pagosError, setPagosError] = useState("");

    // ⭐ Modal de seña
    const [mostrarSenia, setMostrarSenia] = useState(false);
    const [seniaReservaId, setSeniaReservaId] = useState(null);
    const [seniaMonto, setSeniaMonto] = useState("");
    const [seniaMetodo, setSeniaMetodo] = useState("EFECTIVO");
    const [seniaMoneda, setSeniaMoneda] = useState("ARS");
    const [seniaReferencia, setSeniaReferencia] = useState("");
    const [seniaSaving, setSeniaSaving] = useState(false);
    const [seniaError, setSeniaError] = useState("");

    // ⭐ Modal crear huésped
    const [mostrarCrearHuesped, setMostrarCrearHuesped] = useState(false);
    const [nuevoHuesped, setNuevoHuesped] = useState({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        tipoDocumento: "DNI",
        numeroDocumento: "",
        nacionalidad: "Argentina",
        fechaNacimiento: "",
        direccion: ""
    });
    const [guardandoHuesped, setGuardandoHuesped] = useState(false);

    // ⭐ Modal confirmación cancelar reserva
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [reservaACancelar, setReservaACancelar] = useState(null);
    const [cancelandoReserva, setCancelandoReserva] = useState(false);

    // ⭐ Filtros para la tabla de reservas
    const [filtroHotel, setFiltroHotel] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroEstadoPago, setFiltroEstadoPago] = useState("");
    const [filtroCheckInDesde, setFiltroCheckInDesde] = useState("");
    const [filtroCheckInHasta, setFiltroCheckInHasta] = useState("");

    // ⭐ Modal emitir factura
    const [mostrarFactura, setMostrarFactura] = useState(false);
    const [facturaReservaId, setFacturaReservaId] = useState(null);
    const [facturaTipoComprobante, setFacturaTipoComprobante] = useState("B");
    const [facturaPuntoVenta, setFacturaPuntoVenta] = useState(1);
    const [facturaTipoDocumento, setFacturaTipoDocumento] = useState("DNI");
    const [facturaDocumento, setFacturaDocumento] = useState("");
    const [facturaImporte, setFacturaImporte] = useState("");
    const [facturaClienteNombre, setFacturaClienteNombre] = useState("");
    const [emitiendo, setEmitiendo] = useState(false);
    const [facturaError, setFacturaError] = useState("");
    const [facturaResultado, setFacturaResultado] = useState(null);

    async function cargarReservas() {
        try {
            setLoading(true);
            setError("");
            const data = await getReservas();
            setReservas(data);
        } catch (err) {
            console.error(err);
            setError("Error al cargar reservas");
        } finally {
            setLoading(false);
        }
    }

    async function cargarMaestros() {
        try {
            const [hotelesResp, tiposResp, habsResp, huespResp] = await Promise.all([
                getHoteles(),
                getTiposHabitacion(),
                getHabitaciones(),
                getHuespedes(),
            ]);
            setHoteles(hotelesResp || []);
            setTiposHabitacion(tiposResp || []);
            setHabitaciones(habsResp || []);
            setHuespedes(huespResp || []);
        } catch (err) {
            console.error("ERROR CARGAR LISTAS:", err);
            // No rompas el módulo si falla, solo logueá
        }
    }

    useEffect(() => {
        cargarReservas();
        cargarMaestros();
    }, []);

    // ⭐ Calcular precio automáticamente cuando cambian fechas o tipo de habitación
    useEffect(() => {
        if (!tipoHabitacionId || !checkIn || !checkOut) {
            return;
        }

        const tipo = tiposHabitacion.find(t => t.id === Number(tipoHabitacionId));
        if (!tipo || !tipo.precioNoche || tipo.precioNoche <= 0) {
            return;
        }

        const fechaCheckIn = new Date(checkIn);
        const fechaCheckOut = new Date(checkOut);

        if (fechaCheckOut <= fechaCheckIn) {
            return;
        }

        const diffTime = fechaCheckOut.getTime() - fechaCheckIn.getTime();
        const cantidadNoches = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (cantidadNoches > 0) {
            const nuevoPrecio = tipo.precioNoche * cantidadNoches;
            setPrecioTotal(nuevoPrecio);
        }
    }, [tipoHabitacionId, checkIn, checkOut, tiposHabitacion]);

    function limpiarFormulario() {
        setHotelId("");
        setTipoHabitacionId("");
        setHabitacionId("");
        setHuespedTitularId("");
        setAcompanianteIds("");
        setCheckIn("");
        setCheckOut("");
        setAdultos(2);
        setNinos(0);
        setCanal("DIRECTO");
        setPrecioTotal(0);
        setMoneda("ARS");
        setComentariosCliente("");
        setDispMsg("");
        setHotelDisp(null);
        setHotelDispError("");
    }

    function handleNuevaReserva() {
        limpiarFormulario();
        setShowModal(true);
    }

    function handleCloseModal() {
        setShowModal(false);
        limpiarFormulario();
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSaving(true);

        const acompanianteIdsArray =
            acompanianteIds.trim() === ""
                ? []
                : acompanianteIds
                    .split(",")
                    .map((s) => s.trim())
                    .filter((s) => s !== "")
                    .map((s) => Number(s));

        const payload = {
            hotelId: Number(hotelId),
            tipoHabitacionId: Number(tipoHabitacionId),
            habitacionId: Number(habitacionId),
            huespedTitularId: Number(huespedTitularId),
            acompanianteIds: acompanianteIdsArray,
            checkIn,
            checkOut,
            adultos: Number(adultos),
            ninos: Number(ninos),
            canal,
            precioTotal: Number(precioTotal),
            moneda,
            comentariosCliente,
        };

        try {
            await crearReserva(payload);
            showToast("Reserva creada exitosamente", "success");
            handleCloseModal();
            await cargarReservas();
        } catch (err) {
            console.error("ERROR RESERVA:", err);

            const mensajeBackend =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                (typeof err?.response?.data === "string" ? err.response.data : "") ||
                "No se pudo crear la reserva";

            setError(mensajeBackend);
        } finally {
            setSaving(false);
        }
    }

    // ⭐ Chequear disponibilidad de la habitación seleccionada
    async function handleCheckDisponibilidad() {
        setDispMsg("");
        setError("");

        if (!habitacionId || !checkIn || !checkOut) {
            setDispMsg("Completa Habitación, Check-in y Check-out para verificar.");
            return;
        }

        try {
            setCheckingDisp(true);

            const data = await checkDisponibilidadHabitacion({
                habitacionId: Number(habitacionId),
                checkIn,
                checkOut,
            });

            let texto;

            if (data === true || data?.disponible === true) {
                texto = "Habitación DISPONIBLE para ese rango de fechas ✅";
            } else if (data === false || data?.disponible === false) {
                texto = "Habitación NO disponible para ese rango de fechas ❌";
            } else {
                texto = "Respuesta de disponibilidad: " + JSON.stringify(data);
            }

            setDispMsg(texto);
        } catch (err) {
            console.error("ERROR DISP HABITACION:", err);
            const mensajeBackend =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                (typeof err?.response?.data === "string" ? err.response.data : "") ||
                "No se pudo obtener la disponibilidad de la habitación";

            setDispMsg(mensajeBackend);
        } finally {
            setCheckingDisp(false);
        }
    }

    // ⭐ Chequear disponibilidad/resumen del hotel
    async function handleCheckDisponibilidadHotel() {
        setHotelDisp(null);
        setHotelDispError("");

        if (!hotelId || !checkIn || !checkOut) {
            setHotelDispError(
                "Completa Hotel, Check-in y Check-out para ver la disponibilidad del hotel."
            );
            return;
        }

        try {
            setCheckingHotelDisp(true);

            const data = await getDisponibilidadHotel({
                hotelId: Number(hotelId),
                checkIn,
                checkOut,
            });

            setHotelDisp(data);
        } catch (err) {
            console.error("ERROR DISP HOTEL:", err);
            const mensajeBackend =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                (typeof err?.response?.data === "string" ? err.response.data : "") ||
                "No se pudo obtener la disponibilidad del hotel";

            setHotelDispError(mensajeBackend);
        } finally {
            setCheckingHotelDisp(false);
        }
    }

    // ⭐ Abrir modal de seña
    function handleAbrirSenia(reserva) {
        setSeniaReservaId(reserva.id);
        setSeniaMonto(reserva.precioTotal ? String(reserva.precioTotal) : "");
        setSeniaMetodo("EFECTIVO");
        setSeniaMoneda(reserva.moneda || "ARS");
        setSeniaReferencia("");
        setSeniaError("");
        setMostrarSenia(true);
    }

    function handleCerrarSenia() {
        setMostrarSenia(false);
        setSeniaReservaId(null);
        setSeniaMonto("");
        setSeniaMetodo("EFECTIVO");
        setSeniaMoneda("ARS");
        setSeniaReferencia("");
        setSeniaError("");
    }

    // ⭐ Guardar seña desde el modal
    async function handleGuardarSenia(e) {
        e.preventDefault();
        setSeniaError("");

        const monto = Number(seniaMonto);
        if (Number.isNaN(monto) || monto <= 0) {
            setSeniaError("Monto inválido");
            return;
        }

        const pagoSenia = {
            monto,
            moneda: seniaMoneda,
            metodo: seniaMetodo,
            referenciaPago: seniaReferencia,
        };

        try {
            setSeniaSaving(true);
            await crearSenia(seniaReservaId, pagoSenia);
            showToast("Seña registrada exitosamente", "success");
            handleCerrarSenia();
            await cargarReservas();
        } catch (err) {
            console.error("ERROR CREAR SENIA:", err);
            const mensajeBackend =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                (typeof err?.response?.data === "string" ? err.response.data : "") ||
                "No se pudo registrar la seña";
            setSeniaError(mensajeBackend);
        } finally {
            setSeniaSaving(false);
        }
    }

    // ⭐ Crear huésped desde reserva
    async function handleCrearHuesped() {
        if (!nuevoHuesped.nombre || !nuevoHuesped.apellido || !nuevoHuesped.numeroDocumento) {
            showToast("error", "Completa los campos obligatorios: nombre, apellido y documento");
            return;
        }

        try {
            setGuardandoHuesped(true);
            const huespedCreado = await crearHuesped(nuevoHuesped);

            // Recargar lista de huéspedes
            await cargarMaestros();

            // Seleccionar automáticamente el huésped recién creado
            setHuespedTitularId(huespedCreado.id.toString());

            // Cerrar modal y limpiar formulario
            setMostrarCrearHuesped(false);
            setNuevoHuesped({
                nombre: "",
                apellido: "",
                email: "",
                telefono: "",
                tipoDocumento: "DNI",
                numeroDocumento: "",
                nacionalidad: "Argentina",
                fechaNacimiento: "",
                direccion: ""
            });

            showToast("success", `Huésped ${huespedCreado.nombre} ${huespedCreado.apellido} creado y seleccionado`);
        } catch (err) {
            console.error("ERROR CREAR HUÉSPED:", err);
            showToast("error", "Error al crear huésped");
        } finally {
            setGuardandoHuesped(false);
        }
    }

    function handleCancelarCrearHuesped() {
        setMostrarCrearHuesped(false);
        setNuevoHuesped({
            nombre: "",
            apellido: "",
            email: "",
            telefono: "",
            tipoDocumento: "DNI",
            numeroDocumento: "",
            nacionalidad: "Argentina",
            fechaNacimiento: "",
            direccion: ""
        });
    }

    // ⭐ Cancelar reserva
    function handleCancelarReserva(reservaId) {
        const reserva = reservas.find(r => r.id === reservaId);
        setReservaACancelar(reserva);
        setMostrarConfirmacion(true);
    }

    async function confirmarCancelacion() {
        if (!reservaACancelar) return;

        try {
            setCancelandoReserva(true);
            setError("");

            console.log("Cancelando reserva:", reservaACancelar.id);
            await cancelarReserva(reservaACancelar.id);

            showToast("success", `Reserva #${reservaACancelar.id} cancelada exitosamente`);
            await cargarReservas();
            setMostrarConfirmacion(false);
            setReservaACancelar(null);
        } catch (err) {
            console.error("ERROR CANCELAR RESERVA:", err);
            console.error("Response data:", err?.response?.data);
            console.error("Response status:", err?.response?.status);

            let mensajeError = "Error desconocido al cancelar la reserva";

            if (err?.response?.status === 404) {
                mensajeError = "La reserva no fue encontrada";
            } else if (err?.response?.status === 400) {
                mensajeError = err?.response?.data?.message || "Datos inválidos para cancelar la reserva";
            } else if (err?.response?.status === 403) {
                mensajeError = "No tienes permisos para cancelar esta reserva";
            } else if (err?.response?.status >= 500) {
                mensajeError = "Error interno del servidor";
            } else if (err?.response?.data) {
                if (typeof err.response.data === 'string') {
                    mensajeError = err.response.data;
                } else if (err.response.data.message) {
                    mensajeError = err.response.data.message;
                } else if (err.response.data.error) {
                    mensajeError = err.response.data.error;
                }
            } else if (err?.message) {
                mensajeError = `Error de red: ${err.message}`;
            }

            setError(mensajeError);
            showToast("error", mensajeError);
        } finally {
            setCancelandoReserva(false);
        }
    }

    function cancelarConfirmacion() {
        setMostrarConfirmacion(false);
        setReservaACancelar(null);
    }

    // ⭐ Check-in reserva
    async function handleCheckinReserva(reservaId) {
        const ok = window.confirm(`¿Hacer check-in de la reserva ${reservaId}?`);
        if (!ok) return;

        try {
            setError("");
            await checkinReserva(reservaId);
            showToast("Check-in realizado exitosamente", "success");
            await cargarReservas();
        } catch (err) {
            console.error("ERROR CHECKIN:", err);
            const mensajeBackend =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                (typeof err?.response?.data === "string" ? err.response.data : "") ||
                "No se pudo hacer el check-in";
            setError(mensajeBackend);
        }
    }

    // ⭐ Check-out reserva
    async function handleCheckoutReserva(reservaId) {
        const ok = window.confirm(`¿Hacer check-out de la reserva ${reservaId}?`);
        if (!ok) return;

        try {
            setError("");
            await checkoutReserva(reservaId);
            showToast("Check-out realizado exitosamente", "success");
            await cargarReservas();
        } catch (err) {
            console.error("ERROR CHECKOUT:", err);
            const mensajeBackend =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                (typeof err?.response?.data === "string" ? err.response.data : "") ||
                "No se pudo hacer el check-out";
            setError(mensajeBackend);
        }
    }

    // ⭐ Ver pagos de una reserva
    async function handleVerPagos(reservaId) {
        setPagosError("");
        setPagosInfo(null);
        setPagosReservaId(reservaId);

        try {
            setLoadingPagos(true);
            const data = await getReservaPagos(reservaId);
            setPagosInfo(data);
        } catch (err) {
            console.error("ERROR OBTENER PAGOS:", err);
            const mensajeBackend =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                (typeof err?.response?.data === "string" ? err.response.data : "") ||
                "No se pudieron obtener los pagos de la reserva";
            setPagosError(mensajeBackend);
        } finally {
            setLoadingPagos(false);
        }
    }

    // ⭐ Filtrar reservas según los filtros activos
    function obtenerReservasFiltradas() {
        return reservas.filter((r) => {
            // Filtro por hotel
            if (filtroHotel && r.hotelId !== Number(filtroHotel)) {
                return false;
            }

            // Filtro por estado
            if (filtroEstado && r.estado !== filtroEstado) {
                return false;
            }

            // Filtro por estado de pago
            if (filtroEstadoPago && r.estadoPago !== filtroEstadoPago) {
                return false;
            }

            // Filtro por rango de fechas de check-in
            if (filtroCheckInDesde && r.checkIn < filtroCheckInDesde) {
                return false;
            }
            if (filtroCheckInHasta && r.checkIn > filtroCheckInHasta) {
                return false;
            }

            return true;
        });
    }

    // ⭐ Limpiar todos los filtros
    function limpiarFiltros() {
        setFiltroHotel("");
        setFiltroEstado("");
        setFiltroEstadoPago("");
        setFiltroCheckInDesde("");
        setFiltroCheckInHasta("");
    }

    // ⭐ Abrir modal de factura
    function handleAbrirFactura(reserva) {
        const huesped = huespedes.find(h => h.id === reserva.huespedTitularId);
        setFacturaReservaId(reserva.id);
        setFacturaTipoComprobante("B");
        setFacturaPuntoVenta(1);
        setFacturaTipoDocumento(huesped?.tipoDocumento || "DNI");
        setFacturaDocumento(huesped?.numeroDocumento || "");
        setFacturaImporte(reserva.precioTotal ? String(reserva.precioTotal) : "");
        setFacturaClienteNombre(`${huesped?.nombre || ''} ${huesped?.apellido || ''}`.trim() || "Cliente");
        setFacturaError("");
        setFacturaResultado(null);
        setMostrarFactura(true);
    }

    function handleCerrarFactura() {
        setMostrarFactura(false);
        setFacturaReservaId(null);
        setFacturaTipoComprobante("B");
        setFacturaPuntoVenta(1);
        setFacturaTipoDocumento("DNI");
        setFacturaDocumento("");
        setFacturaImporte("");
        setFacturaClienteNombre("");
        setFacturaError("");
        setFacturaResultado(null);
    }

    // ⭐ Emitir factura
    async function handleEmitirFactura(e) {
        e.preventDefault();
        setFacturaError("");
        setFacturaResultado(null);

        const importe = Number(facturaImporte);
        if (Number.isNaN(importe) || importe <= 0) {
            setFacturaError("Importe inválido");
            return;
        }

        if (!facturaDocumento.trim()) {
            setFacturaError("Ingresa el documento del receptor");
            return;
        }

        const payload = {
            reservaId: facturaReservaId,
            tipoComprobante: facturaTipoComprobante,
            puntoVenta: facturaPuntoVenta,
            tipoDocumento: facturaTipoDocumento,
            documento: facturaDocumento.trim(),
            importe: importe,
            clienteNombre: facturaClienteNombre

        };

        try {
            setEmitiendo(true);
            const resultado = await emitirFactura(payload);
            setFacturaResultado(resultado);
            showToast("success", "Factura emitida exitosamente");
        } catch (err) {
            console.error("ERROR EMITIR FACTURA:", err);
            const mensajeBackend =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                (typeof err?.response?.data === "string" ? err.response.data : "") ||
                "No se pudo emitir la factura";
            setFacturaError(mensajeBackend);
        } finally {
            setEmitiendo(false);
        }
    }

    return (
        <Layout>
            <div className="crud-container">
                {/* Header */}
                <div className="crud-header">
                    <div className="crud-header-left">
                        <h1 className="crud-title">
                            <span className="crud-title-icon">📅</span>
                            Reservas
                        </h1>
                        <span className="crud-counter">
                            {reservas.length} {reservas.length === 1 ? 'reserva' : 'reservas'}
                        </span>
                    </div>
                    <button className="crud-btn-new" onClick={handleNuevaReserva}>
                        <span>➕</span>
                        Nueva Reserva
                    </button>
                </div>

                {error && <div className="crud-error">{error}</div>}

                {/* Filtros */}
                <div className="crud-card" style={{ marginBottom: '20px', padding: '20px' }}>
                    <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🔍</span> Filtros de búsqueda
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
                        <div className="crud-form-group" style={{ marginBottom: 0 }}>
                            <label className="crud-form-label">Hotel</label>
                            <select
                                value={filtroHotel}
                                onChange={(e) => setFiltroHotel(e.target.value)}
                                className="crud-form-select"
                            >
                                <option value="">Todos los hoteles</option>
                                {hoteles.map((h) => (
                                    <option key={h.id} value={h.id}>
                                        {h.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="crud-form-group" style={{ marginBottom: 0 }}>
                            <label className="crud-form-label">Estado</label>
                            <select
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                                className="crud-form-select"
                            >
                                <option value="">Todos los estados</option>
                                <option value="PENDIENTE">PENDIENTE</option>
                                <option value="CONFIRMADA">CONFIRMADA</option>
                                <option value="CHECKIN">CHECKIN</option>
                                <option value="CHECKOUT">CHECKOUT</option>
                                <option value="CANCELADA">CANCELADA</option>
                            </select>
                        </div>
                        <div className="crud-form-group" style={{ marginBottom: 0 }}>
                            <label className="crud-form-label">Estado pago</label>
                            <select
                                value={filtroEstadoPago}
                                onChange={(e) => setFiltroEstadoPago(e.target.value)}
                                className="crud-form-select"
                            >
                                <option value="">Todos</option>
                                <option value="PENDIENTE">PENDIENTE</option>
                                <option value="SENIADO">SENIADO</option>
                            </select>
                        </div>
                        <div className="crud-form-group" style={{ marginBottom: 0 }}>
                            <label className="crud-form-label">Check-in desde</label>
                            <input
                                type="date"
                                value={filtroCheckInDesde}
                                onChange={(e) => setFiltroCheckInDesde(e.target.value)}
                                className="crud-form-input"
                            />
                        </div>
                        <div className="crud-form-group" style={{ marginBottom: 0 }}>
                            <label className="crud-form-label">Check-in hasta</label>
                            <input
                                type="date"
                                value={filtroCheckInHasta}
                                onChange={(e) => setFiltroCheckInHasta(e.target.value)}
                                className="crud-form-input"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={limpiarFiltros}
                            className="crud-btn-new"
                        >
                            🔄 Limpiar filtros
                        </button>
                    </div>
                </div>

                {/* Secciones informativas (Disponibilidad Hotel y Pagos) */}
                {hotelDisp && (
                    <div className="crud-card" style={{ marginBottom: "20px", padding: '20px', borderLeft: '4px solid #10b981' }}>
                        <h2 style={{ marginBottom: "12px", fontSize: "16px", fontWeight: 'bold' }}>
                            🏨 Disponibilidad del hotel (resumen)
                        </h2>
                        <div style={{ overflowX: 'auto' }}>
                            {Array.isArray(hotelDisp) ? (
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                                    <thead>
                                        <tr>
                                            {Object.keys(hotelDisp[0] || {}).map((key) => (
                                                <th key={key} style={thStyle}>{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {hotelDisp.map((row, idx) => (
                                            <tr key={idx}>
                                                {Object.keys(row).map((key) => (
                                                    <td key={key} style={tdStyle}>{String(row[key])}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : typeof hotelDisp === "object" ? (
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                                    <tbody>
                                        {Object.entries(hotelDisp).map(([key, value]) => (
                                            <tr key={key}>
                                                <td style={thStyle}>{key}</td>
                                                <td style={tdStyle}>{String(value)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <pre style={{ whiteSpace: "pre-wrap", fontSize: "13px" }}>
                                    {JSON.stringify(hotelDisp, null, 2)}
                                </pre>
                            )}
                        </div>
                    </div>
                )}

                {pagosReservaId && (
                    <div className="crud-card" style={{ marginBottom: "20px", padding: '20px', borderLeft: '4px solid #6366f1' }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                            <h2 style={{ fontSize: "16px", margin: 0, fontWeight: 'bold' }}>
                                💳 Pagos de la reserva #{pagosReservaId}
                            </h2>
                            <button
                                onClick={() => {
                                    setPagosReservaId(null);
                                    setPagosInfo(null);
                                    setPagosError("");
                                }}
                                className="crud-modal-close"
                                style={{ position: 'static', width: '30px', height: '30px', lineHeight: '30px' }}
                            >
                                &times;
                            </button>
                        </div>

                        {loadingPagos && <p>Cargando pagos...</p>}
                        {pagosError && <p style={{ color: "#ef4444", marginBottom: "8px" }}>{pagosError}</p>}

                        {pagosInfo && (
                            <>
                                <div style={{ marginBottom: "15px", padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '6px', fontSize: '14px' }}>
                                    <strong>Total pagado:</strong> {pagosInfo.totalPagado} {pagosInfo.moneda || "ARS"} |
                                    <strong> Precio total:</strong> {pagosInfo.precioTotal} |
                                    <strong> Saldo pendiente:</strong> {pagosInfo.saldoPendiente} |
                                    <strong> Estado:</strong> {pagosInfo.estadoPago}
                                </div>

                                {Array.isArray(pagosInfo.pagos) && pagosInfo.pagos.length > 0 ? (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                                            <thead>
                                                <tr>
                                                    {["ID", "Monto", "Moneda", "Método", "Canal", "Referencia", "Fecha"].map((col) => (
                                                        <th key={col} style={thStyle}>{col}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pagosInfo.pagos.map((p) => (
                                                    <tr key={p.id}>
                                                        <td style={tdStyle}>{p.id}</td>
                                                        <td style={tdStyle}>{p.monto}</td>
                                                        <td style={tdStyle}>{p.moneda}</td>
                                                        <td style={tdStyle}>{p.metodo}</td>
                                                        <td style={tdStyle}>{p.pagadoPorCanal ? "Sí" : "No"}</td>
                                                        <td style={tdStyle}>{p.referenciaPago}</td>
                                                        <td style={tdStyle}>{p.fechaPago}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p>No hay pagos registrados para esta reserva.</p>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Tabla de Reservas */}
                {loading ? (
                    <div className="crud-loading">
                        <div className="crud-loading-spinner"></div>
                        <p>Cargando reservas...</p>
                    </div>
                ) : (
                    <div className="crud-card" style={{ padding: '0', overflow: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '14px'
                        }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>ID</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Hotel</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Habitación</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Huésped</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Check-in</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Check-out</th>
                                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Personas</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Estado</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Pago</th>
                                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Precio</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Canal</th>
                                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151', minWidth: '200px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {obtenerReservasFiltradas().map((r) => {
                                    const huesped = huespedes.find(h => h.id === r.huespedTitularId);
                                    const hotel = hoteles.find(h => h.id === r.hotelId);
                                    const habitacion = habitaciones.find(h => h.id === r.habitacionId);

                                    return (
                                        <tr key={r.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: '12px', color: '#6b7280', fontWeight: '500' }}>#{r.id}</td>
                                            <td style={{ padding: '12px', color: '#374151' }}>{hotel ? hotel.nombre : `Hotel ${r.hotelId}`}</td>
                                            <td style={{ padding: '12px', color: '#374151' }}>
                                                {habitacion ? (() => {
                                                    const tipoHab = tiposHabitacion.find(t => t.id === habitacion.tipoHabitacionId);
                                                    const nombreTipo = tipoHab?.nombre || habitacion.tipoHabitacion?.nombre || 'Habitación';
                                                    const numero = habitacion.numero || habitacion.codigo || habitacion.id;
                                                    return `${nombreTipo} ${numero}`;
                                                })() : `Habitación ${r.habitacionId}`}
                                            </td>
                                            <td style={{ padding: '12px', color: '#374151' }}>
                                                {huesped ? `${huesped.nombre} ${huesped.apellido}` : `ID: ${r.huespedTitularId}`}
                                            </td>
                                            <td style={{ padding: '12px', color: '#374151', fontSize: '13px' }}>{r.checkIn}</td>
                                            <td style={{ padding: '12px', color: '#374151', fontSize: '13px' }}>{r.checkOut}</td>
                                            <td style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
                                                {r.adultos}ad / {r.ninos}ni
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <span className={`crud-badge ${r.estado === 'CONFIRMADA' ? 'success' :
                                                    r.estado === 'CANCELADA' ? 'danger' :
                                                        r.estado === 'CHECKIN' ? 'info' :
                                                            r.estado === 'CHECKOUT' ? 'warning' : 'warning'
                                                    }`} style={{ fontSize: '11px' }}>
                                                    {r.estado}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <span className={`crud-badge ${r.estadoPago === 'SENIADO' ? 'success' : 'warning'}`} style={{ fontSize: '11px' }}>
                                                    {r.estadoPago}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right', color: '#374151', fontWeight: '500', whiteSpace: 'nowrap' }}>
                                                ${r.precioTotal} {r.moneda}
                                            </td>
                                            <td style={{ padding: '12px', color: '#6b7280', fontSize: '13px' }}>{r.canal}</td>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                    {r.estadoPago === "PENDIENTE" && (
                                                        <button
                                                            onClick={() => handleAbrirSenia(r)}
                                                            className="crud-btn-action"
                                                            style={{
                                                                padding: '6px 10px',
                                                                fontSize: '11px',
                                                                backgroundColor: '#f59e0b'
                                                            }}
                                                            title="Marcar Seña"
                                                        >
                                                            💲
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleVerPagos(r.id)}
                                                        className="crud-btn-action"
                                                        style={{
                                                            padding: '6px 10px',
                                                            fontSize: '11px',
                                                            backgroundColor: '#6366f1'
                                                        }}
                                                        title="Ver Pagos"
                                                    >
                                                        👁️
                                                    </button>
                                                    <button
                                                        onClick={() => handleCheckinReserva(r.id)}
                                                        className="crud-btn-action"
                                                        style={{
                                                            padding: '6px 10px',
                                                            fontSize: '11px',
                                                            backgroundColor: '#2563eb'
                                                        }}
                                                        title="Check-in"
                                                    >
                                                        ✅
                                                    </button>
                                                    <button
                                                        onClick={() => handleCheckoutReserva(r.id)}
                                                        className="crud-btn-action"
                                                        style={{
                                                            padding: '6px 10px',
                                                            fontSize: '11px',
                                                            backgroundColor: '#0ea5e9'
                                                        }}
                                                        title="Check-out"
                                                    >
                                                        ✈️
                                                    </button>
                                                    {r.estado === "CONFIRMADA" && (
                                                        <button
                                                            onClick={() => handleAbrirFactura(r)}
                                                            className="crud-btn-action"
                                                            style={{
                                                                padding: '6px 10px',
                                                                fontSize: '11px',
                                                                backgroundColor: '#10b981'
                                                            }}
                                                            title="Emitir Factura"
                                                        >
                                                            🧾
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleCancelarReserva(r.id)}
                                                        className="crud-btn-action crud-btn-delete"
                                                        style={{
                                                            padding: '6px 10px',
                                                            fontSize: '11px'
                                                        }}
                                                        title="Cancelar Reserva"
                                                    >
                                                        ❌
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && obtenerReservasFiltradas().length === 0 && (
                    <div className="crud-empty">
                        <div className="crud-empty-icon">📅</div>
                        <p className="crud-empty-text">
                            {reservas.length === 0 ? "No hay reservas cargadas" : "No hay reservas que coincidan con los filtros"}
                        </p>
                    </div>
                )}

                {/* Modal Nueva Reserva */}
                {showModal && (
                    <div className="crud-modal-overlay">
                        <div className="crud-modal" style={{ maxWidth: '900px', width: '95%' }}>
                            <div className="crud-modal-header">
                                <h2>Nueva Reserva</h2>
                                <button className="crud-modal-close" onClick={handleCloseModal}>&times;</button>
                            </div>
                            <form onSubmit={handleSubmit} className="crud-form">
                                <div className="crud-form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                                    {/* Hotel */}
                                    <div className="crud-form-group">
                                        <label className="crud-form-label">Hotel</label>
                                        <select value={hotelId} onChange={(e) => setHotelId(e.target.value)} className="crud-form-select" required>
                                            <option value="">Seleccionar hotel...</option>
                                            {hoteles.map((h) => <option key={h.id} value={h.id}>{h.nombre} {h.ciudad ? `- ${h.ciudad}` : ""}</option>)}
                                        </select>
                                    </div>

                                    {/* Tipo Habitación */}
                                    <div className="crud-form-group">
                                        <label className="crud-form-label">Tipo de habitación</label>
                                        <select value={tipoHabitacionId} onChange={(e) => setTipoHabitacionId(e.target.value)} className="crud-form-select" required>
                                            <option value="">Seleccionar tipo...</option>
                                            {tiposHabitacion.map((t) => <option key={t.id} value={t.id}>{t.nombre} (base {t.capacidadBase}, máx {t.capacidadMax})</option>)}
                                        </select>
                                    </div>

                                    {/* Habitación */}
                                    <div className="crud-form-group">
                                        <label className="crud-form-label">Habitación</label>
                                        <select value={habitacionId} onChange={(e) => setHabitacionId(e.target.value)} className="crud-form-select" required>
                                            <option value="">Seleccionar habitación...</option>
                                            {habitaciones.map((h) => <option key={h.id} value={h.id}>{h.codigo} {h.piso ? `- Piso ${h.piso}` : ""} (Hotel {h.hotelId})</option>)}
                                        </select>
                                    </div>

                                    {/* Huésped */}
                                    <div className="crud-form-group">
                                        <label className="crud-form-label">Huésped titular</label>
                                        <div style={{ display: "flex", gap: "8px", alignItems: "end" }}>
                                            <select
                                                value={huespedTitularId}
                                                onChange={(e) => setHuespedTitularId(e.target.value)}
                                                className="crud-form-select"
                                                required
                                                style={{ flex: 1 }}
                                            >
                                                <option value="">Seleccionar huésped...</option>
                                                {huespedes.map((h) => <option key={h.id} value={h.id}>{h.nombre} {h.apellido} {h.numeroDocumento ? `- ${h.numeroDocumento}` : ""}</option>)}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => setMostrarCrearHuesped(true)}
                                                className="crud-btn-submit"
                                                style={{ padding: "10px 16px", fontSize: "14px", whiteSpace: "nowrap" }}
                                            >
                                                ➕ Nuevo
                                            </button>
                                        </div>
                                    </div>

                                    {/* Acompañantes */}
                                    <div className="crud-form-group">
                                        <label className="crud-form-label">Acompañantes IDs (coma)</label>
                                        <input type="text" placeholder="ej: 2,3,4" value={acompanianteIds} onChange={(e) => setAcompanianteIds(e.target.value)} className="crud-form-input" />
                                    </div>

                                    {/* Fechas */}
                                    <div className="crud-form-group">
                                        <label className="crud-form-label">Check-in</label>
                                        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required className="crud-form-input" />
                                    </div>
                                    <div className="crud-form-group">
                                        <label className="crud-form-label">Check-out</label>
                                        <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required className="crud-form-input" />
                                    </div>

                                    {/* Personas */}
                                    <div className="crud-form-group">
                                        <label className="crud-form-label">Adultos</label>
                                        <input type="number" min="1" value={adultos} onChange={(e) => setAdultos(e.target.value)} required className="crud-form-input" />
                                    </div>
                                    <div className="crud-form-group">
                                        <label className="crud-form-label">Niños</label>
                                        <input type="number" min="0" value={ninos} onChange={(e) => setNinos(e.target.value)} required className="crud-form-input" />
                                    </div>

                                    {/* Detalles */}
                                    <div className="crud-form-group">
                                        <label className="crud-form-label">Canal</label>
                                        <select value={canal} onChange={(e) => setCanal(e.target.value)} className="crud-form-select">
                                            <option value="DIRECTO">DIRECTO</option>
                                            <option value="BOOKING">BOOKING</option>
                                            <option value="AIRBNB">AIRBNB</option>
                                            <option value="OTRO">OTRO</option>
                                        </select>
                                    </div>
                                    <div className="crud-form-group">
                                        <label className="crud-form-label">Precio total</label>
                                        <input type="number" min="0" step="0.01" value={precioTotal} onChange={(e) => setPrecioTotal(e.target.value)} required className="crud-form-input" />
                                    </div>
                                    <div className="crud-form-group">
                                        <label className="crud-form-label">Moneda</label>
                                        <input type="text" value={moneda} onChange={(e) => setMoneda(e.target.value)} required className="crud-form-input" />
                                    </div>

                                    <div className="crud-form-group full-width" style={{ gridColumn: '1 / -1' }}>
                                        <label className="crud-form-label">Comentarios del cliente</label>
                                        <textarea value={comentariosCliente} onChange={(e) => setComentariosCliente(e.target.value)} rows={3} className="crud-form-textarea" />
                                    </div>

                                    {/* Indicador de cálculo de precio */}
                                    {(() => {
                                        const tipo = tiposHabitacion.find(t => t.id === Number(tipoHabitacionId));
                                        if (tipo && tipo.precioNoche > 0 && checkIn && checkOut) {
                                            const fechaCheckIn = new Date(checkIn);
                                            const fechaCheckOut = new Date(checkOut);
                                            if (fechaCheckOut > fechaCheckIn) {
                                                const diffTime = fechaCheckOut.getTime() - fechaCheckIn.getTime();
                                                const cantidadNoches = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                if (cantidadNoches > 0) {
                                                    return (
                                                        <div style={{
                                                            gridColumn: '1 / -1',
                                                            padding: '12px 16px',
                                                            backgroundColor: '#ecfdf5',
                                                            border: '1px solid #a7f3d0',
                                                            borderRadius: '8px',
                                                            fontSize: '14px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            color: '#065f46'
                                                        }}>
                                                            <span style={{ fontSize: '18px' }}>💡</span>
                                                            <span>
                                                                <strong>{cantidadNoches} {cantidadNoches === 1 ? 'noche' : 'noches'}</strong> × ${tipo.precioNoche.toLocaleString('es-AR')} = <strong>${(tipo.precioNoche * cantidadNoches).toLocaleString('es-AR')}</strong>
                                                            </span>
                                                        </div>
                                                    );
                                                }
                                            }
                                        }
                                        return null;
                                    })()}
                                </div>

                                {/* Botones Disponibilidad */}
                                <div style={{ marginTop: "16px", marginBottom: "8px", display: "flex", gap: "8px", flexWrap: 'wrap' }}>
                                    <button
                                        type="button"
                                        onClick={handleCheckDisponibilidad}
                                        disabled={checkingDisp}
                                        className="crud-button"
                                        style={{ backgroundColor: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6' }}
                                    >
                                        {checkingDisp ? "Verificando..." : "🔍 Ver disponibilidad habitación"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleCheckDisponibilidadHotel}
                                        disabled={checkingHotelDisp}
                                        className="crud-button"
                                        style={{ backgroundColor: 'transparent', border: '1px solid #10b981', color: '#10b981' }}
                                    >
                                        {checkingHotelDisp ? "Consultando..." : "🏨 Ver disponibilidad hotel"}
                                    </button>
                                </div>

                                {dispMsg && <p style={{ marginBottom: "8px", color: "#374151", fontSize: '14px', fontWeight: '500' }}>{dispMsg}</p>}
                                {hotelDispError && <p style={{ marginBottom: "8px", color: "#ef4444", fontSize: '14px' }}>{hotelDispError}</p>}

                                {/* Mensaje de error al crear reserva */}
                                {error && (
                                    <div style={{
                                        marginBottom: "16px",
                                        padding: "12px 16px",
                                        backgroundColor: "#fef2f2",
                                        border: "1px solid #fecaca",
                                        borderRadius: "8px",
                                        color: "#dc2626",
                                        fontSize: "14px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px"
                                    }}>
                                        <span style={{ fontSize: "18px" }}>⚠️</span>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="crud-modal-footer">
                                    <button type="button" className="crud-btn-cancel" onClick={handleCloseModal}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="crud-btn-submit" disabled={saving}>
                                        {saving ? "Guardando..." : "Crear reserva"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Seña */}
                {mostrarSenia && (
                    <div className="crud-modal-overlay">
                        <div className="crud-modal" style={{ maxWidth: "420px" }}>
                            <div className="crud-modal-header">
                                <h2>Registrar seña</h2>
                                <button className="crud-modal-close" onClick={handleCerrarSenia}>&times;</button>
                            </div>
                            <p style={{ fontSize: "13px", marginBottom: "12px", color: '#6b7280' }}>
                                Reserva #{seniaReservaId}
                            </p>

                            <form onSubmit={handleGuardarSenia} className="crud-form">
                                <div className="crud-form-group">
                                    <label className="crud-form-label">Monto</label>
                                    <input type="number" min="0" step="0.01" value={seniaMonto} onChange={(e) => setSeniaMonto(e.target.value)} required className="crud-form-input" />
                                </div>
                                <div className="crud-form-group">
                                    <label className="crud-form-label">Moneda</label>
                                    <input type="text" value={seniaMoneda} onChange={(e) => setSeniaMoneda(e.target.value)} required className="crud-form-input" />
                                </div>
                                <div className="crud-form-group">
                                    <label className="crud-form-label">Método</label>
                                    <select value={seniaMetodo} onChange={(e) => setSeniaMetodo(e.target.value)} className="crud-form-select">
                                        <option value="EFECTIVO">EFECTIVO</option>
                                        <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                                        <option value="TARJETA">TARJETA</option>
                                        <option value="OTRO">OTRO</option>
                                    </select>
                                </div>
                                <div className="crud-form-group">
                                    <label className="crud-form-label">Referencia de pago</label>
                                    <input type="text" value={seniaReferencia} onChange={(e) => setSeniaReferencia(e.target.value)} className="crud-form-input" placeholder="ej: TRX-123456" />
                                </div>

                                {seniaError && <p style={{ color: "red", marginBottom: "8px" }}>{seniaError}</p>}

                                <div className="crud-modal-footer">
                                    <button type="button" className="crud-btn-cancel" onClick={handleCerrarSenia}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="crud-btn-submit" disabled={seniaSaving}>
                                        {seniaSaving ? "Guardando..." : "Guardar seña"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Crear Huésped */}
                {mostrarCrearHuesped && (
                    <div className="crud-modal-overlay">
                        <div className="crud-modal">
                            <div className="crud-modal-header">
                                <h2 className="crud-modal-title">👤 Crear Nuevo Huésped</h2>
                                <button className="crud-modal-close" onClick={handleCancelarCrearHuesped}>
                                    ×
                                </button>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); handleCrearHuesped(); }}>
                                <div className="crud-modal-body">
                                    <div className="crud-form-grid">
                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Nombre *</label>
                                            <input
                                                type="text"
                                                value={nuevoHuesped.nombre}
                                                onChange={(e) => setNuevoHuesped({ ...nuevoHuesped, nombre: e.target.value })}
                                                className="crud-form-input"
                                                required
                                            />
                                        </div>
                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Apellido *</label>
                                            <input
                                                type="text"
                                                value={nuevoHuesped.apellido}
                                                onChange={(e) => setNuevoHuesped({ ...nuevoHuesped, apellido: e.target.value })}
                                                className="crud-form-input"
                                                required
                                            />
                                        </div>
                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Email</label>
                                            <input
                                                type="email"
                                                value={nuevoHuesped.email}
                                                onChange={(e) => setNuevoHuesped({ ...nuevoHuesped, email: e.target.value })}
                                                className="crud-form-input"
                                            />
                                        </div>
                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Teléfono</label>
                                            <input
                                                type="tel"
                                                value={nuevoHuesped.telefono}
                                                onChange={(e) => setNuevoHuesped({ ...nuevoHuesped, telefono: e.target.value })}
                                                className="crud-form-input"
                                            />
                                        </div>
                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Tipo de Documento</label>
                                            <select
                                                value={nuevoHuesped.tipoDocumento}
                                                onChange={(e) => setNuevoHuesped({ ...nuevoHuesped, tipoDocumento: e.target.value })}
                                                className="crud-form-select"
                                            >
                                                <option value="DNI">DNI</option>
                                                <option value="PASAPORTE">Pasaporte</option>
                                                <option value="CI">Cédula de Identidad</option>
                                            </select>
                                        </div>
                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Número de Documento *</label>
                                            <input
                                                type="text"
                                                value={nuevoHuesped.numeroDocumento}
                                                onChange={(e) => setNuevoHuesped({ ...nuevoHuesped, numeroDocumento: e.target.value })}
                                                className="crud-form-input"
                                                required
                                            />
                                        </div>
                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Nacionalidad</label>
                                            <input
                                                type="text"
                                                value={nuevoHuesped.nacionalidad}
                                                onChange={(e) => setNuevoHuesped({ ...nuevoHuesped, nacionalidad: e.target.value })}
                                                className="crud-form-input"
                                            />
                                        </div>
                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Fecha de Nacimiento</label>
                                            <input
                                                type="date"
                                                value={nuevoHuesped.fechaNacimiento}
                                                onChange={(e) => setNuevoHuesped({ ...nuevoHuesped, fechaNacimiento: e.target.value })}
                                                className="crud-form-input"
                                            />
                                        </div>
                                        <div className="crud-form-group full-width">
                                            <label className="crud-form-label">Dirección</label>
                                            <input
                                                type="text"
                                                value={nuevoHuesped.direccion}
                                                onChange={(e) => setNuevoHuesped({ ...nuevoHuesped, direccion: e.target.value })}
                                                className="crud-form-input"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="crud-modal-footer">
                                    <button type="button" className="crud-btn-cancel" onClick={handleCancelarCrearHuesped}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="crud-btn-submit" disabled={guardandoHuesped}>
                                        {guardandoHuesped ? "Guardando..." : "Crear Huésped"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Confirmación Cancelar Reserva */}
                {mostrarConfirmacion && reservaACancelar && (
                    <div className="crud-modal-overlay">
                        <div className="crud-modal" style={{ maxWidth: "500px" }}>
                            <div className="crud-modal-header">
                                <h2 className="crud-modal-title">⚠️ Confirmar Cancelación</h2>
                                <button className="crud-modal-close" onClick={cancelarConfirmacion}>
                                    ×
                                </button>
                            </div>
                            <div className="crud-modal-body">
                                <div style={{
                                    padding: "20px",
                                    textAlign: "center",
                                    backgroundColor: "#fef3c7",
                                    borderRadius: "8px",
                                    marginBottom: "20px",
                                    border: "1px solid #f59e0b"
                                }}>
                                    <p style={{
                                        fontSize: "16px",
                                        color: "#92400e",
                                        marginBottom: "10px",
                                        fontWeight: "600"
                                    }}>
                                        ¿Estás seguro de que deseas cancelar esta reserva?
                                    </p>
                                    <p style={{
                                        fontSize: "14px",
                                        color: "#78716c",
                                        margin: 0
                                    }}>
                                        Esta acción no se puede deshacer
                                    </p>
                                </div>

                                <div style={{
                                    backgroundColor: "#f9fafb",
                                    padding: "16px",
                                    borderRadius: "8px",
                                    border: "1px solid #e5e7eb"
                                }}>
                                    <h3 style={{ marginBottom: "12px", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                                        Detalles de la Reserva:
                                    </h3>
                                    <div style={{ fontSize: "14px", color: "#6b7280" }}>
                                        <p style={{ margin: "4px 0" }}>
                                            <strong>ID:</strong> #{reservaACancelar.id}
                                        </p>
                                        <p style={{ margin: "4px 0" }}>
                                            <strong>Estado:</strong> {reservaACancelar.estado}
                                        </p>
                                        <p style={{ margin: "4px 0" }}>
                                            <strong>Check-in:</strong> {reservaACancelar.checkIn ? new Date(reservaACancelar.checkIn).toLocaleDateString('es-AR') : 'N/A'}
                                        </p>
                                        <p style={{ margin: "4px 0" }}>
                                            <strong>Check-out:</strong> {reservaACancelar.checkOut ? new Date(reservaACancelar.checkOut).toLocaleDateString('es-AR') : 'N/A'}
                                        </p>
                                        {reservaACancelar.precioTotal && (
                                            <p style={{ margin: "4px 0" }}>
                                                <strong>Precio:</strong> {reservaACancelar.moneda} {reservaACancelar.precioTotal}
                                            </p>
                                        )}
                                        {reservaACancelar.estadoPago && (
                                            <p style={{ margin: "4px 0" }}>
                                                <strong>Estado de Pago:</strong> {reservaACancelar.estadoPago}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="crud-modal-footer">
                                <button
                                    type="button"
                                    className="crud-btn-cancel"
                                    onClick={cancelarConfirmacion}
                                    disabled={cancelandoReserva}
                                >
                                    Mantener Reserva
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmarCancelacion}
                                    disabled={cancelandoReserva}
                                    className={cancelandoReserva ? "" : ""}
                                    style={{
                                        padding: "12px 24px",
                                        background: cancelandoReserva ? "#9ca3af" : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontWeight: "600",
                                        cursor: cancelandoReserva ? "not-allowed" : "pointer",
                                        transition: "all 0.3s ease",
                                        opacity: 1,
                                        boxShadow: cancelandoReserva ? "none" : "0 4px 12px rgba(239, 68, 68, 0.3)"
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!cancelandoReserva) {
                                            e.target.style.transform = "translateY(-2px)";
                                            e.target.style.boxShadow = "0 6px 16px rgba(239, 68, 68, 0.4)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!cancelandoReserva) {
                                            e.target.style.transform = "translateY(0)";
                                            e.target.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.3)";
                                        }
                                    }}
                                >
                                    {cancelandoReserva ? "Cancelando..." : "🗑️ Cancelar Reserva"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Emitir Factura */}
                {mostrarFactura && (
                    <div className="crud-modal-overlay">
                        <div className="crud-modal" style={{ maxWidth: "500px" }}>
                            <div className="crud-modal-header">
                                <h2>🧾 Emitir Factura</h2>
                                <button className="crud-modal-close" onClick={handleCerrarFactura}>&times;</button>
                            </div>
                            <div style={{ fontSize: "13px", marginBottom: "16px", color: '#6b7280' }}>
                                <p style={{ margin: "0 0 4px 0" }}>Reserva #{facturaReservaId}</p>
                                <p style={{ margin: 0, fontWeight: "500", color: "#374151" }}>Cliente: {facturaClienteNombre}</p>
                            </div>

                            {/* Si ya emitió factura, mostrar resultado */}
                            {facturaResultado ? (
                                <div style={{ padding: '0 0 20px 0' }}>
                                    <div style={{
                                        backgroundColor: '#ecfdf5',
                                        border: '1px solid #a7f3d0',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        marginBottom: '16px'
                                    }}>
                                        <h3 style={{ color: '#065f46', fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            ✅ Factura Emitida Exitosamente
                                        </h3>
                                        <div style={{ display: 'grid', gap: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #d1fae5', paddingBottom: '8px' }}>
                                                <span style={{ color: '#6b7280', fontSize: '14px' }}>CAE:</span>
                                                <span style={{ color: '#065f46', fontWeight: '700', fontSize: '16px', fontFamily: 'monospace' }}>{facturaResultado.cae}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #d1fae5', paddingBottom: '8px' }}>
                                                <span style={{ color: '#6b7280', fontSize: '14px' }}>Número Comprobante:</span>
                                                <span style={{ color: '#065f46', fontWeight: '600', fontSize: '14px' }}>
                                                    {String(facturaResultado.puntoVenta).padStart(5, '0')}-{String(facturaResultado.numeroComprobante).padStart(8, '0')}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #d1fae5', paddingBottom: '8px' }}>
                                                <span style={{ color: '#6b7280', fontSize: '14px' }}>Tipo Comprobante:</span>
                                                <span style={{ color: '#374151', fontWeight: '500', fontSize: '14px' }}>Factura {facturaResultado.tipoComprobante}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #d1fae5', paddingBottom: '8px' }}>
                                                <span style={{ color: '#6b7280', fontSize: '14px' }}>Importe Total:</span>
                                                <span style={{ color: '#374151', fontWeight: '600', fontSize: '14px' }}>${facturaResultado.importeTotal?.toLocaleString('es-AR')} {facturaResultado.moneda}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #d1fae5', paddingBottom: '8px' }}>
                                                <span style={{ color: '#6b7280', fontSize: '14px' }}>Fecha Emisión:</span>
                                                <span style={{ color: '#374151', fontSize: '14px' }}>{new Date(facturaResultado.fechaEmision).toLocaleString('es-AR')}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#fef3c7', padding: '10px', borderRadius: '8px', marginTop: '8px' }}>
                                                <span style={{ color: '#92400e', fontSize: '14px', fontWeight: '500' }}>⚠️ Vencimiento CAE:</span>
                                                <span style={{ color: '#92400e', fontWeight: '700', fontSize: '14px' }}>{facturaResultado.caeVencimiento}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#6b7280', fontSize: '14px' }}>Estado:</span>
                                                <span className="crud-badge success" style={{ fontSize: '12px' }}>{facturaResultado.estado}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="crud-modal-footer">
                                        <button type="button" className="crud-btn-submit" onClick={handleCerrarFactura}>
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleEmitirFactura} className="crud-form">
                                    <div className="crud-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Tipo Comprobante</label>
                                            <select
                                                value={facturaTipoComprobante}
                                                onChange={(e) => setFacturaTipoComprobante(e.target.value)}
                                                className="crud-form-select"
                                                required
                                            >
                                                <option value="A">Factura A</option>
                                                <option value="B">Factura B</option>
                                                <option value="C">Factura C</option>
                                                <option value="X">Factura X</option>
                                            </select>
                                        </div>
                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Punto de Venta</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={facturaPuntoVenta}
                                                onChange={(e) => setFacturaPuntoVenta(Number(e.target.value))}
                                                className="crud-form-input"
                                                required
                                            />
                                        </div>
                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Tipo Documento Receptor</label>
                                            <select
                                                value={facturaTipoDocumento}
                                                onChange={(e) => setFacturaTipoDocumento(e.target.value)}
                                                className="crud-form-select"
                                                required
                                            >
                                                <option value="DNI">DNI</option>
                                                <option value="CUIT">CUIT</option>
                                            </select>
                                        </div>
                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Documento</label>
                                            <input
                                                type="text"
                                                value={facturaDocumento}
                                                onChange={(e) => setFacturaDocumento(e.target.value)}
                                                placeholder="Ej: 30123456"
                                                className="crud-form-input"
                                                required
                                            />
                                        </div>
                                        <div className="crud-form-group" style={{ gridColumn: '1 / -1' }}>
                                            <label className="crud-form-label">Importe</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={facturaImporte}
                                                onChange={(e) => setFacturaImporte(e.target.value)}
                                                className="crud-form-input"
                                                required
                                            />
                                            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                                💡 Importe sugerido basado en el precio total de la reserva
                                            </p>
                                        </div>
                                    </div>


                                    {facturaError && (
                                        facturaError.includes("ya tiene una factura emitida") ? (
                                            <div style={{
                                                marginTop: "12px",
                                                padding: "16px",
                                                backgroundColor: "#eff6ff",
                                                border: "1px solid #bfdbfe",
                                                borderRadius: "8px",
                                                color: "#1e40af",
                                                fontSize: "14px"
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                    <span style={{ fontSize: '20px' }}>ℹ️</span>
                                                    <strong>Esta reserva ya tiene una factura emitida</strong>
                                                </div>
                                                <p style={{ margin: 0, color: '#3b82f6', fontSize: '13px' }}>
                                                    Consultá el historial de facturas para ver los detalles del comprobante.
                                                </p>
                                            </div>
                                        ) : (
                                            <div style={{
                                                marginTop: "12px",
                                                padding: "12px 16px",
                                                backgroundColor: "#fef2f2",
                                                border: "1px solid #fecaca",
                                                borderRadius: "8px",
                                                color: "#dc2626",
                                                fontSize: "14px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px"
                                            }}>
                                                <span>⚠️</span>
                                                <span>{facturaError}</span>
                                            </div>
                                        )
                                    )}

                                    <div className="crud-modal-footer" style={{ marginTop: '20px' }}>
                                        <button type="button" className="crud-btn-cancel" onClick={handleCerrarFactura}>
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="crud-btn-submit"
                                            disabled={emitiendo}
                                            style={{ backgroundColor: '#10b981' }}
                                        >
                                            {emitiendo ? "Emitiendo..." : "🧾 Emitir Factura"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}

const thStyle = {
    textAlign: "left",
    borderBottom: "1px solid #e5e7eb",
    padding: "8px",
};

const tdStyle = {
    borderBottom: "1px solid #f3f4f6",
    padding: "8px",
};


