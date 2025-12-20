// src/pages/TiposHabitacionPage.jsx
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
    getTiposHabitacion,
    crearTipoHabitacion,
    actualizarTipoHabitacion,
    eliminarTipoHabitacion,
} from "../api/tipohabitacion";
import { getHoteles } from "../api/hoteles";
import { useToast } from "../context/ToastContext";
import "../styles/crud.css";

export default function TiposHabitacionPage() {
    const { showToast } = useToast();
    const [tipos, setTipos] = useState([]);
    const [hoteles, setHoteles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);

    // Campos
    const [hotelId, setHotelId] = useState("");
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [capacidad, setCapacidad] = useState(2);
    const [precioNoche, setPrecioNoche] = useState("");
    const [activo, setActivo] = useState(true);
    const [editingId, setEditingId] = useState(null);

    async function cargarTipos() {
        try {
            setLoading(true);
            setError("");
            const data = await getTiposHabitacion();
            setTipos(data);
        } catch (err) {
            console.error(err);
            setError("Error al cargar tipos de habitación");
        } finally {
            setLoading(false);
        }
    }

    async function cargarMaestros() {
        try {
            const data = await getHoteles();
            setHoteles(data);
        } catch (err) {
            console.error("Error al cargar hoteles:", err);
        }
    }

    useEffect(() => {
        cargarMaestros();
        cargarTipos();
    }, []);

    function limpiarFormulario() {
        setHotelId("");
        setNombre("");
        setDescripcion("");
        setCapacidad(2);
        setPrecioNoche("");
        setActivo(true);
        setEditingId(null);
    }

    function handleNuevo() {
        limpiarFormulario();
        setShowModal(true);
    }

    function handleEditar(tipo) {
        setEditingId(tipo.id);
        setHotelId(String(tipo.hotelId));
        setNombre(tipo.nombre);
        setDescripcion(tipo.descripcion || "");
        setCapacidad(tipo.capacidadMax || tipo.capacidad || 2);
        setPrecioNoche(tipo.precioNoche !== undefined ? String(tipo.precioNoche) : "");
        setActivo(tipo.activo !== undefined ? tipo.activo : true);
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
            nombre,
            descripcion,
            capacidad: Number(capacidad),
            precioNoche: precioNoche ? Number(precioNoche) : 0,
            activo,
            // Enviar también con los nombres que vienen del backend por si acaso
            capacidadMax: Number(capacidad),
        };

        try {
            if (editingId === null) {
                await crearTipoHabitacion(payload);
                showToast("Tipo de habitación creado", "success");
            } else {
                await actualizarTipoHabitacion(editingId, payload);
                showToast("Tipo de habitación actualizado", "success");
            }
            handleCloseModal();
            await cargarTipos();
        } catch (err) {
            console.error(err);
            setError("No se pudo guardar el tipo de habitación");
        } finally {
            setSaving(false);
        }
    }

    async function handleEliminar(id) {
        const ok = window.confirm("¿Eliminar este tipo de habitación?");
        if (!ok) return;

        try {
            setError("");
            await eliminarTipoHabitacion(id);
            showToast("Tipo de habitación eliminado", "success");
            await cargarTipos();
        } catch (err) {
            console.error(err);
            setError("No se pudo eliminar el tipo de habitación");
        }
    }

    // Filtrar
    const tiposFiltrados = (tipos || []).filter(t =>
        t.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout>
            <div className="crud-container">
                {/* Header */}
                <div className="crud-header">
                    <div className="crud-header-left">
                        <h1 className="crud-title">
                            <span className="crud-title-icon">🛏️</span>
                            Tipos de Habitación
                        </h1>
                        <p className="crud-count">
                            {tipos.length} {tipos.length === 1 ? 'tipo registrado' : 'tipos registrados'}
                        </p>
                    </div>
                    <button className="crud-btn-new" onClick={handleNuevo}>
                        <span>➕</span>
                        Nuevo Tipo
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
                            placeholder="Buscar por nombre..."
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
                        <p>Cargando tipos...</p>
                    </div>
                )}

                {/* Grid */}
                {!loading && tiposFiltrados.length > 0 && (
                    <div className="crud-grid">
                        {tiposFiltrados.map((tipo) => {
                            const hotel = hoteles.find(h => h.id === tipo.hotelId);
                            return (
                                <div key={tipo.id} className="crud-card">
                                    <div className="crud-card-header">
                                        <div>
                                            <h3 className="crud-card-title">
                                                🛏️ {tipo.nombre}
                                            </h3>
                                            <p className="crud-card-id">ID: {tipo.id}</p>
                                        </div>
                                        <span className="crud-badge success">
                                            👥 {tipo.capacidadMax || tipo.capacidad} {(tipo.capacidadMax || tipo.capacidad) === 1 ? 'persona' : 'personas'}
                                        </span>
                                    </div>
                                    <div className="crud-card-body">
                                        <div className="crud-card-field">
                                            <span className="crud-card-field-icon">🏨</span>
                                            <span className="crud-card-field-text">{hotel ? hotel.nombre : `Hotel ID: ${tipo.hotelId}`}</span>
                                        </div>
                                        <div className="crud-card-field">
                                            <span className="crud-card-field-icon">👥</span>
                                            <span className="crud-card-field-text">Capacidad: {tipo.capacidadMax || tipo.capacidad} {(tipo.capacidadMax || tipo.capacidad) === 1 ? 'persona' : 'personas'}</span>
                                        </div>
                                        {tipo.precioNoche > 0 && (
                                            <div className="crud-card-field">
                                                <span className="crud-card-field-icon">💰</span>
                                                <span className="crud-card-field-text" style={{ fontWeight: '600', color: '#059669' }}>
                                                    ${tipo.precioNoche.toLocaleString('es-AR')} / noche
                                                </span>
                                            </div>
                                        )}
                                        {tipo.descripcion && (
                                            <div className="crud-card-field">
                                                <span className="crud-card-field-icon">📝</span>
                                                <span className="crud-card-field-text">{tipo.descripcion}</span>
                                            </div>
                                        )}
                                        <div className="crud-card-field">
                                            <span className="crud-card-field-icon">🔌</span>
                                            <span className={`crud-badge ${tipo.activo ? 'success' : 'danger'}`}>
                                                {tipo.activo ? 'ACTIVO' : 'INACTIVO'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="crud-card-actions">
                                        <button
                                            className="crud-btn-action crud-btn-edit"
                                            onClick={() => handleEditar(tipo)}
                                        >
                                            ✏️ Editar
                                        </button>
                                        <button
                                            className="crud-btn-action crud-btn-delete"
                                            onClick={() => handleEliminar(tipo.id)}
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
                {!loading && tiposFiltrados.length === 0 && (
                    <div className="crud-empty">
                        <div className="crud-empty-icon">🛏️</div>
                        <p className="crud-empty-text">
                            {searchTerm ? 'No se encontraron tipos' : 'No hay tipos de habitación registrados'}
                        </p>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="crud-modal-overlay" onClick={handleCloseModal}>
                        <div className="crud-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="crud-modal-header">
                                <h2 className="crud-modal-title">
                                    {editingId === null ? 'Nuevo Tipo de Habitación' : 'Editar Tipo'}
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
                                            <label className="crud-form-label">Nombre *</label>
                                            <input
                                                type="text"
                                                value={nombre}
                                                onChange={(e) => setNombre(e.target.value)}
                                                required
                                                className="crud-form-input"
                                                placeholder="Ej: Suite Premium"
                                            />
                                        </div>

                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Capacidad *</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={capacidad}
                                                onChange={(e) => setCapacidad(e.target.value)}
                                                required
                                                className="crud-form-input"
                                            />
                                        </div>

                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Precio por noche</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={precioNoche}
                                                onChange={(e) => setPrecioNoche(e.target.value)}
                                                className="crud-form-input"
                                                placeholder="Ej: 50000"
                                            />
                                        </div>

                                        <div className="crud-form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '30px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={activo}
                                                    onChange={(e) => setActivo(e.target.checked)}
                                                    style={{ width: '18px', height: '18px' }}
                                                />
                                                <span className="crud-form-label" style={{ marginBottom: 0 }}>Activo</span>
                                            </label>
                                        </div>

                                        <div className="crud-form-group full-width">
                                            <label className="crud-form-label">Descripción</label>
                                            <textarea
                                                value={descripcion}
                                                onChange={(e) => setDescripcion(e.target.value)}
                                                rows={3}
                                                className="crud-form-textarea"
                                                placeholder="Descripción opcional..."
                                            />
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
