// src/pages/DashboardPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getReservas, checkDisponibilidadHabitacion, getDisponibilidadHotel } from "../api/reservas";
import { getHabitaciones } from "../api/habitaciones";
import { getHoteles } from "../api/hoteles";
import { getTiposHabitacion } from "../api/tipohabitacion";
import { useToast } from "../context/ToastContext";
import "../styles/dashboard.css";
import "../styles/crud.css";

export default function DashboardPage() {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Estados para disponibilidad habitación
    const [showDispHabitacion, setShowDispHabitacion] = useState(false);
    const [hoteles, setHoteles] = useState([]);
    const [tiposHabitacion, setTiposHabitacion] = useState([]);
    const [habitaciones, setHabitaciones] = useState([]);
    const [hotelId, setHotelId] = useState("");
    const [tipoHabitacionId, setTipoHabitacionId] = useState("");
    const [habitacionId, setHabitacionId] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [adultos, setAdultos] = useState(2);
    const [ninos, setNinos] = useState(0);
    const [checkingDisp, setCheckingDisp] = useState(false);
    const [dispMsg, setDispMsg] = useState("");

    // Estados para disponibilidad hotel
    const [showDispHotel, setShowDispHotel] = useState(false);
    const [hotelDispData, setHotelDispData] = useState(null);
    const [checkingHotelDisp, setCheckingHotelDisp] = useState(false);
    const [hotelDispError, setHotelDispError] = useState("");
    const [modoCalendario, setModoCalendario] = useState(true); // true = calendario, false = fechas específicas
    const [calendarioData, setCalendarioData] = useState(null);
    const [mesActual, setMesActual] = useState(new Date());
    const [loadingCalendario, setLoadingCalendario] = useState(false);

    useEffect(() => {
        cargarMetricas();
        cargarMaestros();
    }, []);

    async function cargarMaestros() {
        try {
            const [hotelesResp, tiposResp, habsResp] = await Promise.all([
                getHoteles(),
                getTiposHabitacion(),
                getHabitaciones(),
            ]);
            setHoteles(hotelesResp);
            setTiposHabitacion(tiposResp);
            setHabitaciones(habsResp);
        } catch (err) {
            console.error("Error cargando maestros:", err);
        }
    }

    async function cargarMetricas() {
        try {
            setLoading(true);
            setError("");

            // Cargar datos en paralelo
            const [reservas, habitaciones] = await Promise.all([
                getReservas(),
                getHabitaciones(),
            ]);

            // Calcular métricas
            const hoy = new Date().toISOString().split('T')[0];

            // Reservas activas (CONFIRMADA, CHECKIN)
            const reservasActivas = reservas.filter(
                r => r.estado === 'CONFIRMADA' || r.estado === 'CHECKIN'
            ).length;

            // Check-ins de hoy
            const checkinsHoy = reservas.filter(
                r => r.checkIn?.startsWith(hoy) && r.estado !== 'CANCELADA'
            ).length;

            // Check-outs de hoy
            const checkoutsHoy = reservas.filter(
                r => r.checkOut?.startsWith(hoy) && r.estado !== 'CANCELADA'
            ).length;

            // Ocupación - calcular basándose en reservas activas de hoy
            const habitacionesTotales = habitaciones.length;

            // Normalizar fecha de hoy a medianoche para comparación precisa
            const fechaHoy = new Date();
            fechaHoy.setHours(0, 0, 0, 0);

            // Habitaciones ocupadas = habitaciones que tienen reserva activa hoy
            // Usamos un Set para evitar contar la misma habitación dos veces
            const habitacionesOcupadasIds = new Set();

            reservas.forEach(reserva => {
                // Solo considerar reservas no canceladas
                if (reserva.estado !== 'CANCELADA') {
                    // Normalizar fechas de la reserva a medianoche
                    const checkIn = new Date(reserva.checkIn);
                    checkIn.setHours(0, 0, 0, 0);

                    const checkOut = new Date(reserva.checkOut);
                    checkOut.setHours(0, 0, 0, 0);

                    // Una habitación está ocupada si hoy está entre check-in (inclusive) 
                    // y check-out (exclusive - el día de checkout ya no cuenta como ocupado)
                    if (fechaHoy >= checkIn && fechaHoy < checkOut) {
                        habitacionesOcupadasIds.add(reserva.habitacionId);
                    }
                }
            });

            const habitacionesOcupadas = habitacionesOcupadasIds.size;
            const ocupacion = habitacionesTotales > 0
                ? Math.round((habitacionesOcupadas / habitacionesTotales) * 100)
                : 0;

            setMetrics({
                reservasActivas,
                checkinsHoy,
                checkoutsHoy,
                ocupacion,
                habitacionesTotales,
                habitacionesOcupadas,
            });
        } catch (err) {
            console.error("ERROR CARGAR MÉTRICAS:", err);
            setError("No se pudieron cargar las métricas del dashboard");
        } finally {
            setLoading(false);
        }
    }

    // Funciones de disponibilidad habitación
    async function handleCheckDisponibilidad() {
        if (!habitacionId || !checkIn || !checkOut) {
            showToast("error", "Completa todos los campos para verificar disponibilidad");
            return;
        }

        try {
            setCheckingDisp(true);
            setDispMsg("");

            console.log("Verificando disponibilidad con datos:", {
                habitacionId: Number(habitacionId),
                checkIn,
                checkOut,
                adultos: Number(adultos),
                ninos: Number(ninos)
            });

            const data = await checkDisponibilidadHabitacion({
                habitacionId: Number(habitacionId),
                checkIn,
                checkOut,
                adultos: Number(adultos),
                ninos: Number(ninos),
            });

            console.log("Respuesta de la API:", data);

            if (data?.disponible) {
                setDispMsg(`✅ La habitación está disponible. Precio: ${data.precio || 'N/A'}`);
                showToast("success", "Habitación disponible");
            } else {
                setDispMsg(`❌ La habitación NO está disponible. ${data?.mensaje || ''}`);
                showToast("warning", "Habitación no disponible");
            }
        } catch (err) {
            console.error("ERROR DISPONIBILIDAD:", err);
            console.error("Error completo:", err.response?.data);

            let mensajeError = "Error al verificar disponibilidad";
            if (err?.response?.status === 400) {
                mensajeError = "Datos inválidos. Verifica las fechas y la habitación seleccionada.";
            } else if (err?.response?.status === 404) {
                mensajeError = "Habitación no encontrada";
            } else if (err?.response?.data?.message) {
                mensajeError = err.response.data.message;
            }

            setDispMsg(`❌ ${mensajeError}`);
            showToast("error", mensajeError);
        } finally {
            setCheckingDisp(false);
        }
    }

    async function handleCheckDisponibilidadHotel() {
        if (!hotelId || !checkIn || !checkOut) {
            showToast("error", "Completa Hotel, Check-in y Check-out para ver la disponibilidad del hotel");
            return;
        }

        try {
            setCheckingHotelDisp(true);
            setHotelDispError("");

            // Calcular disponibilidad usando las reservas existentes
            const reservas = await getReservas();
            const habitacionesHotel = habitaciones.filter(h => h.hotelId === parseInt(hotelId));

            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);

            const habitacionesDisponibles = habitacionesHotel.filter(habitacion => {
                // Verificar si esta habitación está disponible en el rango de fechas
                const reservasHabitacion = reservas.filter(r =>
                    r.habitacionId === habitacion.id && r.estado !== 'CANCELADA'
                );

                // Verificar si hay conflicto con alguna reserva existente
                const hayConflicto = reservasHabitacion.some(reserva => {
                    const reservaCheckIn = new Date(reserva.checkIn);
                    const reservaCheckOut = new Date(reserva.checkOut);

                    // Hay conflicto si las fechas se superponen
                    return (checkInDate < reservaCheckOut && checkOutDate > reservaCheckIn);
                });

                return !hayConflicto;
            });

            setHotelDispData({
                habitacionesDisponibles,
                totalHabitaciones: habitacionesHotel.length,
                habitacionesOcupadas: habitacionesHotel.length - habitacionesDisponibles.length
            });

            showToast("success", `Se encontraron ${habitacionesDisponibles.length} habitaciones disponibles`);

        } catch (err) {
            console.error("ERROR DISPONIBILIDAD HOTEL:", err);
            setHotelDispError("Error al obtener disponibilidad del hotel");
            showToast("error", "Error al obtener disponibilidad del hotel");
        } finally {
            setCheckingHotelDisp(false);
        }
    }

    async function cargarCalendarioDisponibilidad() {
        console.log('=== INICIANDO cargarCalendarioDisponibilidad ===');
        console.log('hotelId:', hotelId);
        console.log('habitacionId:', habitacionId);

        if (!hotelId) {
            console.log('ERROR: No hay hotelId seleccionado');
            showToast("error", "Selecciona un hotel primero");
            return;
        }

        try {
            setLoadingCalendario(true);
            setHotelDispError("");
            console.log('Iniciando carga de datos...');

            // Obtener todas las reservas
            const reservas = await getReservas();
            console.log('Reservas obtenidas:', reservas.length);

            const habitacionesHotel = habitaciones.filter(h => h.hotelId === parseInt(hotelId));

            if (habitacionId) {
                // Modo habitación individual
                const reservasFiltradas = reservas.filter(r =>
                    r.habitacionId === parseInt(habitacionId) && r.estado !== 'CANCELADA'
                );

                const habitacionSeleccionada = habitaciones.find(h => h.id === parseInt(habitacionId));
                const tipoHab = tiposHabitacion.find(t => t.id === habitacionSeleccionada?.tipoHabitacionId);
                const nombreTipo = tipoHab?.nombre || habitacionSeleccionada?.tipoHabitacion?.nombre || 'Cabaña';
                const tituloCalendario = `${nombreTipo} ${habitacionSeleccionada?.numero || habitacionSeleccionada?.codigo || habitacionSeleccionada?.id}`;

                // Generar fechas ocupadas y fechas con turnover
                const fechasOcupadas = new Set();
                const fechasConTurnover = new Set();
                const fechasCheckout = new Set();
                const fechasCheckin = new Set();

                reservasFiltradas.forEach(reserva => {
                    const checkIn = new Date(reserva.checkIn);
                    const checkOut = new Date(reserva.checkOut);
                    const checkInStr = checkIn.toISOString().split('T')[0];
                    const checkOutStr = checkOut.toISOString().split('T')[0];

                    // Registrar días de checkout y checkin
                    fechasCheckout.add(checkOutStr);
                    fechasCheckin.add(checkInStr);

                    // Marcar días ocupados (desde checkin hasta checkout, sin incluir checkout)
                    const fecha = new Date(checkIn);
                    while (fecha < checkOut) {
                        fechasOcupadas.add(fecha.toISOString().split('T')[0]);
                        fecha.setDate(fecha.getDate() + 1);
                    }
                });

                // Detectar días con turnover disponible
                // Un día tiene turnover si tiene checkout pero NO tiene checkin
                fechasCheckout.forEach(fechaStr => {
                    if (!fechasCheckin.has(fechaStr)) {
                        // Tiene checkout pero no checkin = disponible desde las 14:00
                        fechasConTurnover.add(fechaStr);
                        // Remover de fechas ocupadas si estaba
                        fechasOcupadas.delete(fechaStr);
                    }
                });

                setCalendarioData({
                    tipo: 'individual',
                    fechasOcupadas: Array.from(fechasOcupadas),
                    fechasConTurnover: Array.from(fechasConTurnover),
                    totalHabitaciones: 1,
                    reservasActivas: reservasFiltradas.length,
                    titulo: tituloCalendario
                });
            } else {
                // Modo todas las habitaciones - calendario por cabaña
                const calendariosPorHabitacion = habitacionesHotel.map(habitacion => {
                    const tipoHab = tiposHabitacion.find(t => t.id === habitacion.tipoHabitacionId);
                    const nombreTipo = tipoHab?.nombre || 'Cabaña';
                    const titulo = `${nombreTipo} ${habitacion.numero || habitacion.codigo || habitacion.id}`;

                    // Reservas para esta habitación específica
                    const reservasHabitacion = reservas.filter(r =>
                        r.habitacionId === habitacion.id && r.estado !== 'CANCELADA'
                    );

                    // Fechas ocupadas y con turnover para esta habitación
                    const fechasOcupadas = new Set();
                    const fechasConTurnover = new Set();
                    const fechasCheckout = new Set();
                    const fechasCheckin = new Set();

                    reservasHabitacion.forEach(reserva => {
                        const checkIn = new Date(reserva.checkIn);
                        const checkOut = new Date(reserva.checkOut);
                        const checkInStr = checkIn.toISOString().split('T')[0];
                        const checkOutStr = checkOut.toISOString().split('T')[0];

                        fechasCheckout.add(checkOutStr);
                        fechasCheckin.add(checkInStr);

                        const fecha = new Date(checkIn);
                        while (fecha < checkOut) {
                            fechasOcupadas.add(fecha.toISOString().split('T')[0]);
                            fecha.setDate(fecha.getDate() + 1);
                        }
                    });

                    // Detectar turnover
                    fechasCheckout.forEach(fechaStr => {
                        if (!fechasCheckin.has(fechaStr)) {
                            fechasConTurnover.add(fechaStr);
                            fechasOcupadas.delete(fechaStr);
                        }
                    });

                    return {
                        habitacionId: habitacion.id,
                        titulo,
                        fechasOcupadas: Array.from(fechasOcupadas),
                        fechasConTurnover: Array.from(fechasConTurnover),
                        reservasActivas: reservasHabitacion.length
                    };
                });

                const hotelSeleccionado = hoteles.find(h => h.id === parseInt(hotelId));
                setCalendarioData({
                    tipo: 'multiple',
                    titulo: `${hotelSeleccionado?.nombre || 'Hotel'} - Todas las habitaciones`,
                    calendarios: calendariosPorHabitacion,
                    totalHabitaciones: habitacionesHotel.length,
                    reservasActivas: reservas.filter(r => {
                        const habitacion = habitacionesHotel.find(h => h.id === r.habitacionId);
                        return habitacion && r.estado !== 'CANCELADA';
                    }).length
                });
            }

            console.log('✅ Calendario data configurado exitosamente');

        } catch (err) {
            console.error("❌ ERROR CALENDARIO:", err);
            setHotelDispError("Error al cargar el calendario de disponibilidad");
            showToast("error", "Error al cargar calendario");
        } finally {
            setLoadingCalendario(false);
        }
    }

    // Funciones para navegar el calendario
    const cambiarMes = (direccion) => {
        const nuevaFecha = new Date(mesActual);
        nuevaFecha.setMonth(nuevaFecha.getMonth() + direccion);
        setMesActual(nuevaFecha);
    };

    // Detectar si un día tiene turnover disponible (checkout AM + checkin PM posible)
    const detectarTurnoverDisponible = async (fechaStr, habitacionId = null) => {
        try {
            // Obtener todas las reservas
            const reservas = await getReservas();

            // Filtrar reservas para la habitación específica o todas si no se especifica
            const reservasFiltradas = habitacionId
                ? reservas.filter(r => r.habitacionId === parseInt(habitacionId))
                : reservas;

            // Buscar si hay checkout en esta fecha
            const tieneCheckout = reservasFiltradas.some(reserva => {
                if (reserva.estado === 'CANCELADA') return false;
                const checkOutDate = new Date(reserva.checkOut);
                const checkOutStr = checkOutDate.toISOString().split('T')[0];
                return checkOutStr === fechaStr;
            });

            // Buscar si hay checkin en esta fecha
            const tieneCheckin = reservasFiltradas.some(reserva => {
                if (reserva.estado === 'CANCELADA') return false;
                const checkInDate = new Date(reserva.checkIn);
                const checkInStr = checkInDate.toISOString().split('T')[0];
                return checkInStr === fechaStr;
            });

            // Si tiene checkout pero no checkin, está disponible para reserva same-day
            // Si tiene ambos, verificar que haya ventana de tiempo (checkout 10 AM, checkin 2 PM)
            if (tieneCheckout && !tieneCheckin) {
                return {
                    disponible: true,
                    tipo: 'turnover',
                    mensaje: 'Disponible desde las 14:00'
                };
            }

            if (tieneCheckout && tieneCheckin) {
                // Ambos en el mismo día - asumimos que hay ventana de limpieza
                return {
                    disponible: false,
                    tipo: 'ocupado',
                    mensaje: 'Checkout 10:00 AM - Checkin 14:00 PM (Ocupado)'
                };
            }

            return null;
        } catch (err) {
            console.error('Error detectando turnover:', err);
            return null;
        }
    };

    // Generar días del calendario para una habitación específica
    const generarDiasCalendario = (fechasOcupadasHabitacion = null) => {
        const año = mesActual.getFullYear();
        const mes = mesActual.getMonth();
        const primerDia = new Date(año, mes, 1);
        const ultimoDia = new Date(año, mes + 1, 0);
        const primerDiaSemana = primerDia.getDay(); // 0 = domingo

        const dias = [];

        // Días vacíos al inicio
        for (let i = 0; i < primerDiaSemana; i++) {
            dias.push(null);
        }

        // Determinar qué fechas ocupadas y con turnover usar
        const fechasOcupadas = fechasOcupadasHabitacion || calendarioData?.fechasOcupadas || [];
        const fechasConTurnover = calendarioData?.fechasConTurnover || [];

        // Días del mes
        for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
            const fecha = new Date(año, mes, dia);
            const fechaStr = fecha.toISOString().split('T')[0];
            const esHoy = fechaStr === new Date().toISOString().split('T')[0];
            const esPasado = fecha < new Date().setHours(0, 0, 0, 0);
            const estaOcupada = fechasOcupadas.includes(fechaStr);
            const tieneTurnover = fechasConTurnover.includes(fechaStr);

            dias.push({
                dia,
                fecha: fechaStr,
                esHoy,
                esPasado,
                estaOcupada,
                tieneTurnover,
                disponible: !estaOcupada && !esPasado && !tieneTurnover,
                parcialmenteDisponible: tieneTurnover && !esPasado
            });
        }

        return dias;
    };
    const habitacionesFiltradas = habitaciones.filter((h) => {
        if (tipoHabitacionId && h.tipoHabitacionId !== parseInt(tipoHabitacionId)) return false;
        return true;
    });

    // Obtener fecha actual formateada
    const fechaActual = new Date().toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <Layout>
            <div className="dashboard-container">
                {/* Hero Section */}
                <div className="dashboard-hero">
                    <div className="dashboard-hero-content">
                        <h1 className="dashboard-greeting">¡Bienvenido de vuelta! 👋</h1>
                        <p className="dashboard-date">{fechaActual}</p>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="dashboard-error">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="dashboard-loading">
                        <div className="dashboard-loading-spinner"></div>
                        <p>Cargando métricas...</p>
                    </div>
                )}

                {/* Métricas */}
                {metrics && !loading && (
                    <>
                        <div className="dashboard-metrics">
                            <MetricCard
                                icon="📅"
                                title="Reservas Activas"
                                value={metrics.reservasActivas}
                                subtitle="Confirmadas y en proceso"
                                color="blue"
                            />
                            <MetricCard
                                icon="🏠"
                                title="Ocupación"
                                value={`${metrics.ocupacion}%`}
                                subtitle={`${metrics.habitacionesOcupadas}/${metrics.habitacionesTotales} habitaciones`}
                                color={
                                    metrics.ocupacion >= 80 ? 'green' :
                                        metrics.ocupacion >= 50 ? 'orange' : 'red'
                                }
                                showProgress
                                progress={metrics.ocupacion}
                            />
                            <MetricCard
                                icon="🔑"
                                title="Check-ins Hoy"
                                value={metrics.checkinsHoy}
                                subtitle="Llegadas esperadas"
                                color="cyan"
                            />
                            <MetricCard
                                icon="🚪"
                                title="Check-outs Hoy"
                                value={metrics.checkoutsHoy}
                                subtitle="Salidas esperadas"
                                color="orange"
                            />
                        </div>

                        {/* Acciones Rápidas */}
                        <div className="dashboard-quick-actions">
                            <h2 className="section-title">Acciones Rápidas</h2>
                            <div className="quick-actions-grid">
                                <button
                                    className="quick-action-btn"
                                    onClick={() => navigate('/reservas')}
                                >
                                    <span className="quick-action-icon">➕</span>
                                    <span>Nueva Reserva</span>
                                </button>
                                <button
                                    className="quick-action-btn"
                                    onClick={() => navigate('/huespedes')}
                                >
                                    <span className="quick-action-icon">👥</span>
                                    <span>Gestionar Huéspedes</span>
                                </button>
                                <button
                                    className="quick-action-btn"
                                    onClick={() => setShowDispHotel(true)}
                                >
                                    <span className="quick-action-icon">🏨</span>
                                    <span>Ver Disponibilidad</span>
                                </button>
                                <button
                                    className="quick-action-btn"
                                    onClick={() => navigate('/habitaciones')}
                                >
                                    <span className="quick-action-icon">🏠</span>
                                    <span>Ver Habitaciones</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Modal Disponibilidad */}
                {showDispHotel && (
                    <div className="crud-modal-overlay">
                        <div className="crud-modal" style={{ maxWidth: "1000px" }}>
                            <div className="crud-modal-header">
                                <h2 className="crud-modal-title">🏨 Calendario de Disponibilidad</h2>
                                <button className="crud-modal-close" onClick={() => setShowDispHotel(false)}>
                                    ×
                                </button>
                            </div>
                            <div className="crud-modal-body">
                                {/* Selectores */}
                                <div className="crud-form-grid" style={{ marginBottom: "20px" }}>
                                    <div className="crud-form-group">
                                        <label className="crud-form-label">Hotel</label>
                                        <select value={hotelId} onChange={(e) => {
                                            setHotelId(e.target.value);
                                            setHabitacionId(""); // Limpiar habitación al cambiar hotel
                                            setCalendarioData(null);
                                        }} className="crud-form-select">
                                            <option value="">Seleccionar hotel</option>
                                            {hoteles.map((h) => (
                                                <option key={h.id} value={h.id}>{h.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="crud-form-group">
                                        <label className="crud-form-label">Habitación/Cabaña (Opcional)</label>
                                        <select value={habitacionId} onChange={(e) => {
                                            setHabitacionId(e.target.value);
                                            setCalendarioData(null); // Limpiar calendario al cambiar
                                        }} className="crud-form-select" disabled={!hotelId}>
                                            <option value="">Ver todas las habitaciones</option>
                                            {hotelId && habitaciones.filter(h => h.hotelId === parseInt(hotelId)).map((h) => {
                                                // Buscar el tipo de habitación completo
                                                const tipoHab = tiposHabitacion.find(t => t.id === h.tipoHabitacionId);
                                                const nombreTipo = tipoHab?.nombre || h.tipoHabitacion?.nombre || 'Cabaña';
                                                console.log(`Habitación ${h.numero}: tipoHabitacionId=${h.tipoHabitacionId}, tipoEncontrado=${tipoHab?.nombre}, nombreFinal=${nombreTipo}`);
                                                return (
                                                    <option key={h.id} value={h.id}>
                                                        {nombreTipo} {h.numero || h.codigo || h.id}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                </div>

                                {/* Selector de modo de vista */}
                                {hotelId && (
                                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px", gap: "10px" }}>
                                        <button
                                            type="button"
                                            onClick={() => setModoCalendario(true)}
                                            className={modoCalendario ? "crud-btn-submit" : "crud-btn-cancel"}
                                            style={{ padding: "8px 16px", fontSize: "14px" }}
                                        >
                                            📅 Vista Calendario
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setModoCalendario(false)}
                                            className={!modoCalendario ? "crud-btn-submit" : "crud-btn-cancel"}
                                            style={{ padding: "8px 16px", fontSize: "14px" }}
                                        >
                                            📋 Buscar por Fechas
                                        </button>
                                    </div>
                                )}

                                {/* Vista por fechas específicas */}
                                {hotelId && !modoCalendario && (
                                    <div style={{ backgroundColor: "#f9fafb", padding: "20px", borderRadius: "12px", marginBottom: "20px" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                                            <div className="crud-form-group">
                                                <label className="crud-form-label">Check-in</label>
                                                <input
                                                    type="date"
                                                    value={checkIn}
                                                    onChange={(e) => setCheckIn(e.target.value)}
                                                    className="crud-form-input"
                                                />
                                            </div>
                                            <div className="crud-form-group">
                                                <label className="crud-form-label">Check-out</label>
                                                <input
                                                    type="date"
                                                    value={checkOut}
                                                    onChange={(e) => setCheckOut(e.target.value)}
                                                    className="crud-form-input"
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                                            <div className="crud-form-group">
                                                <label className="crud-form-label">Adultos</label>
                                                <input
                                                    type="number"
                                                    value={adultos}
                                                    onChange={(e) => setAdultos(parseInt(e.target.value))}
                                                    min="1"
                                                    max="10"
                                                    className="crud-form-input"
                                                />
                                            </div>
                                            <div className="crud-form-group">
                                                <label className="crud-form-label">Niños</label>
                                                <input
                                                    type="number"
                                                    value={ninos}
                                                    onChange={(e) => setNinos(parseInt(e.target.value))}
                                                    min="0"
                                                    max="8"
                                                    className="crud-form-input"
                                                />
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "center" }}>
                                            <button
                                                type="button"
                                                onClick={handleCheckDisponibilidadHotel}
                                                className="crud-btn-submit"
                                                disabled={checkingHotelDisp || !checkIn || !checkOut}
                                                style={{ padding: "12px 24px" }}
                                            >
                                                {checkingHotelDisp ? "Verificando..." : "🔍 Verificar Disponibilidad"}
                                            </button>
                                        </div>
                                        {hotelDispError && (
                                            <div style={{
                                                marginTop: "15px",
                                                padding: "10px",
                                                backgroundColor: "#fee2e2",
                                                color: "#991b1b",
                                                borderRadius: "8px",
                                                fontSize: "14px",
                                                textAlign: "center"
                                            }}>
                                                ⚠️ {hotelDispError}
                                            </div>
                                        )}
                                        {hotelDispData && (
                                            <div style={{
                                                marginTop: "15px",
                                                padding: "15px",
                                                backgroundColor: "#d1fae5",
                                                borderRadius: "8px",
                                                border: "1px solid #10b981"
                                            }}>
                                                <h4 style={{ margin: "0 0 10px 0", color: "#065f46", fontSize: "16px" }}>
                                                    ✅ Habitaciones Disponibles
                                                </h4>
                                                {hotelDispData.habitacionesDisponibles?.length > 0 ? (
                                                    <div style={{ display: "grid", gap: "8px" }}>
                                                        {hotelDispData.habitacionesDisponibles.map((hab) => {
                                                            const tipoHab = tiposHabitacion.find(t => t.id === hab.tipoHabitacionId);
                                                            const nombreTipo = tipoHab?.nombre || 'Habitación';
                                                            return (
                                                                <div key={hab.id} style={{
                                                                    padding: "8px 12px",
                                                                    backgroundColor: "white",
                                                                    borderRadius: "6px",
                                                                    fontSize: "14px",
                                                                    display: "flex",
                                                                    justifyContent: "space-between",
                                                                    alignItems: "center"
                                                                }}>
                                                                    <span><strong>{nombreTipo} {hab.numero}</strong></span>
                                                                    <span style={{ color: "#059669" }}>Disponible</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p style={{ margin: 0, color: "#065f46", fontSize: "14px" }}>
                                                        No hay habitaciones disponibles para las fechas seleccionadas.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {hotelId && modoCalendario && (
                                    <div style={{ textAlign: "center", marginBottom: "20px" }}>
                                        <button
                                            type="button"
                                            onClick={cargarCalendarioDisponibilidad}
                                            className="crud-btn-submit"
                                            disabled={loadingCalendario}
                                            style={{ padding: "12px 24px" }}
                                        >
                                            {loadingCalendario ? "Cargando..." : "🗓️ Cargar Calendario"}
                                        </button>
                                    </div>
                                )}

                                {calendarioData && modoCalendario && (
                                    <div>
                                        {/* Título del calendario */}
                                        <div style={{ textAlign: "center", marginBottom: "20px" }}>
                                            <h3 style={{
                                                fontSize: "18px",
                                                fontWeight: "600",
                                                color: "#374151",
                                                margin: "0 0 8px 0"
                                            }}>
                                                📅 {calendarioData.titulo}
                                            </h3>
                                            <p style={{
                                                fontSize: "14px",
                                                color: "#6b7280",
                                                margin: 0
                                            }}>
                                                {calendarioData.tipo === 'individual' ?
                                                    `${calendarioData.reservasActivas} reservas activas en esta habitación` :
                                                    `${calendarioData.reservasActivas} reservas activas • ${calendarioData.totalHabitaciones} habitaciones totales`
                                                }
                                            </p>
                                        </div>

                                        {/* Navegación del calendario */}
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                            <button
                                                type="button"
                                                onClick={() => cambiarMes(-1)}
                                                className="crud-btn-cancel"
                                                style={{ padding: "8px 12px" }}
                                            >
                                                ← Anterior
                                            </button>
                                            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
                                                {mesActual.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => cambiarMes(1)}
                                                className="crud-btn-cancel"
                                                style={{ padding: "8px 12px" }}
                                            >
                                                Siguiente →
                                            </button>
                                        </div>

                                        {/* Leyenda */}
                                        <div style={{ display: "flex", gap: "20px", marginBottom: "15px", fontSize: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                <div style={{ width: "12px", height: "12px", backgroundColor: "#d1fae5", borderRadius: "3px", border: "1px solid #10b981" }}></div>
                                                <span>Disponible</span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                <div style={{ width: "12px", height: "12px", backgroundColor: "#fef3c7", borderRadius: "3px", border: "1px solid #fbbf24" }}></div>
                                                <span>Parcialmente Disponible (desde 14:00)</span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                <div style={{ width: "12px", height: "12px", backgroundColor: "#fee2e2", borderRadius: "3px", border: "1px solid #ef4444" }}></div>
                                                <span>Ocupado</span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                <div style={{ width: "12px", height: "12px", backgroundColor: "#f3f4f6", borderRadius: "3px", border: "1px solid #9ca3af" }}></div>
                                                <span>Pasado</span>
                                            </div>
                                        </div>

                                        {/* Calendarios por cabaña */}
                                        {calendarioData.tipo === 'multiple' ? (
                                            <div style={{ display: "grid", gap: "20px" }}>
                                                {calendarioData.calendarios?.map((calendario, index) => (
                                                    <div key={index} style={{
                                                        backgroundColor: "#f9fafb",
                                                        padding: "15px",
                                                        borderRadius: "12px",
                                                        border: "1px solid #e5e7eb"
                                                    }}>
                                                        <h4 style={{
                                                            margin: "0 0 10px 0",
                                                            fontSize: "14px",
                                                            fontWeight: "600",
                                                            textAlign: "center",
                                                            color: "#374151"
                                                        }}>
                                                            🏠 {calendario.titulo} ({calendario.reservasActivas} reservas)
                                                        </h4>

                                                        <div style={{
                                                            display: "grid",
                                                            gridTemplateColumns: "repeat(7, 1fr)",
                                                            gap: "1px"
                                                        }}>
                                                            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(dia => (
                                                                <div key={dia} style={{
                                                                    padding: "4px",
                                                                    textAlign: "center",
                                                                    fontSize: "10px",
                                                                    fontWeight: "bold",
                                                                    color: "#6b7280"
                                                                }}>
                                                                    {dia}
                                                                </div>
                                                            ))}

                                                            {generarDiasCalendario(calendario.fechasOcupadas).map((dia, dayIndex) => (
                                                                <div
                                                                    key={dayIndex}
                                                                    title={dia ? (
                                                                        dia.tieneTurnover ? `Disponible desde las 14:00` :
                                                                            dia.esPasado ? "Fecha pasada" :
                                                                                dia.estaOcupada ? "Ocupado" :
                                                                                    "Disponible"
                                                                    ) : ""}
                                                                    style={{
                                                                        padding: "4px",
                                                                        textAlign: "center",
                                                                        fontSize: "10px",
                                                                        borderRadius: "2px",
                                                                        minHeight: "20px",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        cursor: dia && !dia.esPasado ? "pointer" : "default",
                                                                        backgroundColor: dia ? (
                                                                            dia.esPasado ? "#f3f4f6" :
                                                                                dia.tieneTurnover ? "#fef3c7" :
                                                                                    dia.estaOcupada ? "#fee2e2" :
                                                                                        "#d1fae5"
                                                                        ) : "transparent",
                                                                        color: dia ? (
                                                                            dia.esPasado ? "#9ca3af" :
                                                                                dia.tieneTurnover ? "#92400e" :
                                                                                    dia.estaOcupada ? "#991b1b" :
                                                                                        "#065f46"
                                                                        ) : "transparent",
                                                                        border: dia?.tieneTurnover ? "1px solid #fbbf24" : "none"
                                                                    }}
                                                                >
                                                                    {dia?.dia || ""}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            /* Calendario individual */
                                            <div style={{
                                                display: "grid",
                                                gridTemplateColumns: "repeat(7, 1fr)",
                                                gap: "2px",
                                                backgroundColor: "#f9fafb",
                                                padding: "15px",
                                                borderRadius: "12px",
                                                border: "1px solid #e5e7eb"
                                            }}>
                                                {/* Cabeceras de días */}
                                                {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(dia => (
                                                    <div key={dia} style={{
                                                        padding: "10px",
                                                        textAlign: "center",
                                                        fontSize: "12px",
                                                        fontWeight: "bold",
                                                        color: "#6b7280",
                                                        borderBottom: "1px solid #e5e7eb",
                                                        marginBottom: "5px"
                                                    }}>
                                                        {dia.slice(0, 3)}
                                                    </div>
                                                ))}

                                                {/* Días del calendario */}
                                                {generarDiasCalendario().map((dia, index) => (
                                                    <div
                                                        key={index}
                                                        style={{
                                                            padding: "10px",
                                                            textAlign: "center",
                                                            fontSize: "14px",
                                                            borderRadius: "6px",
                                                            minHeight: "40px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontWeight: dia?.esHoy ? "bold" : "normal",
                                                            backgroundColor: dia ? (
                                                                dia.esPasado ? "#f9fafb" :
                                                                    dia.tieneTurnover ? "#fef3c7" :
                                                                        dia.estaOcupada ? "#fee2e2" :
                                                                            "#d1fae5"
                                                            ) : "transparent",
                                                            color: dia ? (
                                                                dia.esPasado ? "#9ca3af" :
                                                                    dia.tieneTurnover ? "#92400e" :
                                                                        dia.estaOcupada ? "#991b1b" :
                                                                            "#065f46"
                                                            ) : "transparent",
                                                            cursor: dia && !dia.esPasado ? "pointer" : "default",
                                                            border: dia?.esHoy ? "2px solid #f59e0b" :
                                                                dia?.tieneTurnover ? "1px solid #fbbf24" :
                                                                    "1px solid transparent",
                                                            transition: "all 0.2s ease"
                                                        }}
                                                        title={dia ? (
                                                            dia.esHoy ? "Hoy" :
                                                                dia.tieneTurnover ? "Disponible desde las 14:00" :
                                                                    dia.esPasado ? "Fecha pasada" :
                                                                        dia.estaOcupada ? "Ocupado" :
                                                                            "Disponible"
                                                        ) : ""}
                                                        onMouseEnter={(e) => {
                                                            if (dia && !dia.esPasado) {
                                                                e.target.style.transform = "scale(1.05)";
                                                                e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (dia && !dia.esPasado) {
                                                                e.target.style.transform = "scale(1)";
                                                                e.target.style.boxShadow = "none";
                                                            }
                                                        }}
                                                    >
                                                        {dia?.dia || ""}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {hotelDispError && <p style={{ marginTop: "16px", padding: "12px", borderRadius: "8px", backgroundColor: "#fee2e2", color: "#991b1b" }}>{hotelDispError}</p>}
                            </div>
                            <div className="crud-modal-footer">
                                <button type="button" className="crud-btn-cancel" onClick={() => setShowDispHotel(false)}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}

function MetricCard({ icon, title, value, subtitle, color = 'blue', showProgress, progress }) {
    return (
        <div className={`metric-card ${color}`}>
            <div className="metric-card-header">
                <div>
                    <p className="metric-title">{title}</p>
                </div>
                <span className="metric-icon">{icon}</span>
            </div>
            <h3 className="metric-value">{value}</h3>
            {subtitle && <p className="metric-subtitle">{subtitle}</p>}
            {showProgress && (
                <div className="metric-progress">
                    <div
                        className="metric-progress-fill"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
            )}
        </div>
    );
}
