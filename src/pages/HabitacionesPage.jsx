// src/pages/HabitacionesPage.jsx
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
    getHabitaciones,
    crearHabitacion,
    actualizarHabitacion,
    eliminarHabitacion,
} from "../api/habitaciones";
import { getHoteles } from "../api/hoteles";
import { getTiposHabitacion } from "../api/tipohabitacion";
import { useToast } from "../context/ToastContext";
import "../styles/crud.css";

export default function HabitacionesPage() {
    const { showToast } = useToast();
    const [habitaciones, setHabitaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);

    const [hoteles, setHoteles] = useState([]);
    const [tiposHabitacion, setTiposHabitacion] = useState([]);

    // Campos
    const [hotelId, setHotelId] = useState("");
    const [tipoHabitacionId, setTipoHabitacionId] = useState("");
    const [codigo, setCodigo] = useState("");
    const [piso, setPiso] = useState("");
    const [estado, setEstado] = useState("DISPONIBLE");
    const [activo, setActivo] = useState(true);
    const [editingId, setEditingId] = useState(null);

    async function cargarHabitaciones() {
        try {
            setLoading(true);
            setError("");
            const data = await getHabitaciones();
            setHabitaciones(data);
        } catch (err) {
            console.error(err);
            setError("Error al cargar habitaciones");
        } finally {
            setLoading(false);
        }
    }

    async function cargarMaestros() {
        try {
            const [hotelesData, tiposData] = await Promise.all([
                getHoteles(),
                getTiposHabitacion(),
            ]);
            setHoteles(hotelesData);
            setTiposHabitacion(tiposData);
        } catch (err) {
            console.error("Error al cargar maestros:", err);
        }
    }

    useEffect(() => {
        cargarMaestros();
        cargarHabitaciones();
    }, []);

    function limpiarFormulario() {
        setHotelId("");
        setTipoHabitacionId("");
        setCodigo("");
        setPiso("");
        setEstado("DISPONIBLE");
        setActivo(true);
        setEditingId(null);
    }

    function handleNuevo() {
        limpiarFormulario();
        setShowModal(true);
    }

    function handleEditar(hab) {
        setEditingId(hab.id);
        setHotelId(String(hab.hotelId));
        setTipoHabitacionId(String(hab.tipoHabitacionId));
        setCodigo(hab.codigo);
        setPiso(String(hab.piso));
        setEstado(hab.estado);
        setActivo(hab.activo);
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

        const payload = {
            hotelId: Number(hotelId),
            tipoHabitacionId: Number(tipoHabitacionId),
            codigo,
            piso: Number(piso),
            estado,
            activo,
        };

        try {
            if (editingId === null) {
                await crearHabitacion(payload);
                showToast("Habitación creada exitosamente", "success");
            } else {
                await actualizarHabitacion(editingId, payload);
                showToast("Habitación actualizada", "success");
            }
            handleCloseModal();
            await cargarHabitaciones();
        } catch (err) {
            console.error(err);
            setError("No se pudo guardar la habitación");
        } finally {
            setSaving(false);
        }
    }

    async function handleEliminar(id) {
        const ok = window.confirm("¿Eliminar esta habitación?");
        if (!ok) return;

        try {
            setError("");
            await eliminarHabitacion(id);
            showToast("Habitación eliminada", "success");
            await cargarHabitaciones();
        } catch (err) {
            console.error(err);
            setError("No se pudo eliminar la habitación");
        }
    }

    // Filtrar
    const habitacionesFiltradas = (habitaciones || []).filter(h =>
        h.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Función para obtener badge según estado
    function getEstadoBadge(estado) {
        switch (estado) {
            case 'DISPONIBLE':
                return 'success';
            case 'OCUPADO':
                return 'danger';
            case 'MANTENIMIENTO':
                return 'warning';
            case 'RESERVADO':
                return 'info';
            default:
                return 'gray';
        }
    }

    return (
        <Layout>
            <div className="crud-container">
                {/* Header */}
                <div className="crud-header">
                    <div className="crud-header-left">
                        <h1 className="crud-title">
                            <span className="crud-title-icon">🏨</span>
                            Habitaciones
                        </h1>
                        <p className="crud-count">
                            {habitaciones.length} {habitaciones.length === 1 ? 'habitación registrada' : 'habitaciones registradas'}
                        </p>
                    </div>
                    <button className="crud-btn-new" onClick={handleNuevo}>
                        <span>➕</span>
                        Nueva Habitación
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="dashboard-error" style={{ marginBottom: '20px' }}>
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Búsqueda */}
                <div className="crud-search-container">
                    <div className="crud-search-wrapper">
                        <span className="crud-search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar por código..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="crud-search"
                        />
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="dashboard-loading">
                        <div className="dashboard-loading-spinner"></div>
                        <p>Cargando habitaciones...</p>
                    </div>
                )}

                {/* Grid */}
                {!loading && habitacionesFiltradas.length > 0 && (
                    <div className="crud-grid">
                        {habitacionesFiltradas.map((hab) => {
                            const hotel = hoteles.find(h => h.id === hab.hotelId);
                            const tipo = tiposHabitacion.find(t => t.id === hab.tipoHabitacionId);

                            return (
                                <div key={hab.id} className="crud-card">
                                    <div className="crud-card-header">
                                        <div>
                                            <h3 className="crud-card-title">
                                                🚪 {hab.codigo}
                                            </h3>
                                            <p className="crud-card-id">ID: {hab.id}</p>
                                        </div>
                                        <span className={`crud-badge ${getEstadoBadge(hab.estado)}`}>
                                            {hab.estado}
                                        </span>
                                    </div>
                                    <div className="crud-card-body">
                                        <div className="crud-card-field">
                                            <span className="crud-card-field-icon">🏡</span>
                                            <span className="crud-card-field-text">{hotel ? hotel.nombre : `Hotel ID: ${hab.hotelId}`}</span>
                                        </div>
                                        <div className="crud-card-field">
                                            <span className="crud-card-field-icon">🛏️</span>
                                            <span className="crud-card-field-text">{tipo ? tipo.nombre : `Tipo ID: ${hab.tipoHabitacionId}`}</span>
                                        </div>
                                        <div className="crud-card-field">
                                            <span className="crud-card-field-icon">🔢</span>
                                            <span className="crud-card-field-text">Piso {hab.piso}</span>
                                        </div>
                                        <div className="crud-card-field">
                                            <span className="crud-card-field-icon">{hab.activo ? '✅' : '❌'}</span>
                                            <span className="crud-card-field-text">{hab.activo ? 'Activa' : 'Inactiva'}</span>
                                        </div>
                                    </div>
                                    <div className="crud-card-actions">
                                        <button
                                            className="crud-btn-action crud-btn-edit"
                                            onClick={() => handleEditar(hab)}
                                        >
                                            ✏️ Editar
                                        </button>
                                        <button
                                            className="crud-btn-action crud-btn-delete"
                                            onClick={() => handleEliminar(hab.id)}
                                        >
                                            🗑️ Eliminar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Empty */}
                {!loading && habitacionesFiltradas.length === 0 && (
                    <div className="crud-empty">
                        <div className="crud-empty-icon">🏨</div>
                        <p className="crud-empty-text">
                            {searchTerm ? 'No se encontraron habitaciones' : 'No hay habitaciones registradas'}
                        </p>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="crud-modal-overlay" onClick={handleCloseModal}>
                        <div className="crud-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="crud-modal-header">
                                <h2 className="crud-modal-title">
                                    {editingId === null ? 'Nueva Habitación' : 'Editar Habitación'}
                                </h2>
                                <button className="crud-modal-close" onClick={handleCloseModal}>×</button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="crud-modal-body">
                                    <div className="crud-form-grid">
                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Hotel *</label>
                                            <select
                                                value={hotelId}
                                                onChange={(e) => setHotelId(e.target.value)}
                                                required
                                                className="crud-form-select"
                                            >
                                                <option value="">Selecciona un hotel</option>
                                                {hoteles.map(h => (
                                                    <option key={h.id} value={h.id}>{h.nombre}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Tipo de Habitación *</label>
                                            <select
                                                value={tipoHabitacionId}
                                                onChange={(e) => setTipoHabitacionId(e.target.value)}
                                                required
                                                className="crud-form-select"
                                            >
                                                <option value="">Selecciona un tipo</option>
                                                {tiposHabitacion.map(t => (
                                                    <option key={t.id} value={t.id}>{t.nombre}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Código *</label>
                                            <input
                                                type="text"
                                                value={codigo}
                                                onChange={(e) => setCodigo(e.target.value)}
                                                required
                                                className="crud-form-input"
                                                placeholder="Ej: 101"
                                            />
                                        </div>

                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Piso *</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={piso}
                                                onChange={(e) => setPiso(e.target.value)}
                                                required
                                                className="crud-form-input"
                                            />
                                        </div>

                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Estado</label>
                                            <select
                                                value={estado}
                                                onChange={(e) => setEstado(e.target.value)}
                                                className="crud-form-select"
                                            >
                                                <option value="DISPONIBLE">DISPONIBLE</option>
                                                <option value="OCUPADO">OCUPADO</option>
                                                <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                                                <option value="RESERVADO">RESERVADO</option>
                                            </select>
                                        </div>

                                        <div className="crud-form-group">
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={activo}
                                                    onChange={(e) => setActivo(e.target.checked)}
                                                />
                                                <span className="crud-form-label" style={{ margin: 0 }}>Habitación activa</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="crud-modal-footer">
                                    <button type="button" className="crud-btn-cancel" onClick={handleCloseModal}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="crud-btn-submit" disabled={saving}>
                                        {saving ? 'Guardando...' : editingId === null ? 'Crear' : 'Guardar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
