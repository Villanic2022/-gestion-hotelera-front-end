// src/pages/HotelesPage.jsx
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
    getHoteles,
    crearHotel,
    actualizarHotel,
    eliminarHotel,
} from "../api/hoteles";
import { useToast } from "../context/ToastContext";
import "../styles/crud.css";

export default function HotelesPage() {
    const { showToast } = useToast();
    const [hoteles, setHoteles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);

    // Campos del formulario
    const [nombre, setNombre] = useState("");
    const [direccion, setDireccion] = useState("");
    const [ciudad, setCiudad] = useState("");
    const [pais, setPais] = useState("");
    const [telefono, setTelefono] = useState("");
    const [email, setEmail] = useState("");
    const [activo, setActivo] = useState(true);
    const [editingId, setEditingId] = useState(null);

    async function cargarHoteles() {
        try {
            setLoading(true);
            setError("");
            const data = await getHoteles();
            setHoteles(data);
        } catch (err) {
            console.error(err);
            setError("Error al cargar hoteles");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        cargarHoteles();
    }, []);

    function limpiarFormulario() {
        setNombre("");
        setDireccion("");
        setCiudad("");
        setPais("");
        setTelefono("");
        setEmail("");
        setActivo(true);
        setEditingId(null);
    }

    function handleNuevo() {
        limpiarFormulario();
        setShowModal(true);
    }

    function handleEditar(hotel) {
        setEditingId(hotel.id);
        setNombre(hotel.nombre);
        setDireccion(hotel.direccion);
        setCiudad(hotel.ciudad);
        setPais(hotel.pais);
        setTelefono(hotel.telefono);
        setEmail(hotel.email);
        setActivo(hotel.activo);
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

        const hotelData = {
            nombre,
            direccion,
            ciudad,
            pais,
            telefono,
            email,
            activo,
        };

        try {
            if (editingId === null) {
                await crearHotel(hotelData);
                showToast("Hotel creado exitosamente", "success");
            } else {
                await actualizarHotel(editingId, hotelData);
                showToast("Hotel actualizado", "success");
            }

            handleCloseModal();
            await cargarHoteles();
        } catch (err) {
            console.error(err);
            setError("No se pudo guardar el hotel");
        } finally {
            setSaving(false);
        }
    }

    async function handleEliminar(id) {
        const confirmar = window.confirm("¿Seguro que quieres eliminar este hotel?");
        if (!confirmar) return;

        try {
            setError("");
            await eliminarHotel(id);
            showToast("Hotel eliminado", "success");
            await cargarHoteles();
        } catch (err) {
            console.error(err);
            setError("No se pudo eliminar el hotel");
        }
    }

    // Filtrar hoteles por búsqueda
    const hotelesFiltrados = (hoteles || []).filter(h =>
        (h.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.ciudad || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.pais || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout>
            <div className="crud-container">
                {/* Header */}
                <div className="crud-header">
                    <div className="crud-header-left">
                        <h1 className="crud-title">
                            <span className="crud-title-icon">🏨</span>
                            Hoteles
                        </h1>
                        <p className="crud-count">
                            {hoteles.length} {hoteles.length === 1 ? 'hotel registrado' : 'hoteles registrados'}
                        </p>
                    </div>
                    <button className="crud-btn-new" onClick={handleNuevo}>
                        <span>➕</span>
                        Nuevo Hotel
                    </button>
                </div>

                {/* Error global */}
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
                            placeholder="Buscar por nombre, ciudad o país..."
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
                        <p>Cargando hoteles...</p>
                    </div>
                )}

                {/* Grid de Hoteles */}
                {!loading && hotelesFiltrados.length > 0 && (
                    <div className="crud-grid">
                        {hotelesFiltrados.map((hotel) => (
                            <div key={hotel.id} className="crud-card">
                                <div className="crud-card-header">
                                    <div>
                                        <h3 className="crud-card-title">
                                            🏡 {hotel.nombre}
                                        </h3>
                                        <p className="crud-card-id">ID: {hotel.id}</p>
                                    </div>
                                    <span className={`crud-badge ${hotel.activo ? 'success' : 'gray'}`}>
                                        {hotel.activo ? '✓ Activo' : '✗ Inactivo'}
                                    </span>
                                </div>
                                <div className="crud-card-body">
                                    <div className="crud-card-field">
                                        <span className="crud-card-field-icon">📍</span>
                                        <span className="crud-card-field-text">{hotel.direccion}</span>
                                    </div>
                                    <div className="crud-card-field">
                                        <span className="crud-card-field-icon">🌆</span>
                                        <span className="crud-card-field-text">{hotel.ciudad}, {hotel.pais}</span>
                                    </div>
                                    <div className="crud-card-field">
                                        <span className="crud-card-field-icon">📧</span>
                                        <span className="crud-card-field-text">{hotel.email}</span>
                                    </div>
                                    <div className="crud-card-field">
                                        <span className="crud-card-field-icon">📞</span>
                                        <span className="crud-card-field-text">{hotel.telefono}</span>
                                    </div>
                                </div>
                                <div className="crud-card-actions">
                                    <button
                                        className="crud-btn-action crud-btn-edit"
                                        onClick={() => handleEditar(hotel)}
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        className="crud-btn-action crud-btn-delete"
                                        onClick={() => handleEliminar(hotel.id)}
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && hotelesFiltrados.length === 0 && (
                    <div className="crud-empty">
                        <div className="crud-empty-icon">🏨</div>
                        <p className="crud-empty-text">
                            {searchTerm ? 'No se encontraron hoteles con ese criterio' : 'No hay hoteles registrados. ¡Crea el primero!'}
                        </p>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="crud-modal-overlay" onClick={handleCloseModal}>
                        <div className="crud-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="crud-modal-header">
                                <h2 className="crud-modal-title">
                                    {editingId === null ? 'Nuevo Hotel' : 'Editar Hotel'}
                                </h2>
                                <button className="crud-modal-close" onClick={handleCloseModal}>
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="crud-modal-body">
                                    <div className="crud-form-grid">
                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Nombre *</label>
                                            <input
                                                type="text"
                                                value={nombre}
                                                onChange={(e) => setNombre(e.target.value)}
                                                required
                                                className="crud-form-input"
                                                placeholder="Ej: Hotel Las Palmeras"
                                            />
                                        </div>

                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Dirección *</label>
                                            <input
                                                type="text"
                                                value={direccion}
                                                onChange={(e) => setDireccion(e.target.value)}
                                                required
                                                className="crud-form-input"
                                                placeholder="Ej: Av. Libertad 123"
                                            />
                                        </div>

                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Ciudad *</label>
                                            <input
                                                type="text"
                                                value={ciudad}
                                                onChange={(e) => setCiudad(e.target.value)}
                                                required
                                                className="crud-form-input"
                                                placeholder="Ej: Mar del Plata"
                                            />
                                        </div>

                                        <div className="crud-form-group">
                                            <label className="crud-form-label">País *</label>
                                            <input
                                                type="text"
                                                value={pais}
                                                onChange={(e) => setPais(e.target.value)}
                                                required
                                                className="crud-form-input"
                                                placeholder="Ej: Argentina"
                                            />
                                        </div>

                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Teléfono *</label>
                                            <input
                                                type="text"
                                                value={telefono}
                                                onChange={(e) => setTelefono(e.target.value)}
                                                required
                                                className="crud-form-input"
                                                placeholder="Ej: +54 223 4567890"
                                            />
                                        </div>

                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Email *</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="crud-form-input"
                                                placeholder="Ej: info@hotel.com"
                                            />
                                        </div>

                                        <div className="crud-form-group full-width">
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={activo}
                                                    onChange={(e) => setActivo(e.target.checked)}
                                                />
                                                <span className="crud-form-label" style={{ margin: 0 }}>Hotel activo</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="crud-modal-footer">
                                    <button
                                        type="button"
                                        className="crud-btn-cancel"
                                        onClick={handleCloseModal}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="crud-btn-submit"
                                        disabled={saving}
                                    >
                                        {saving ? 'Guardando...' : editingId === null ? 'Crear Hotel' : 'Guardar Cambios'}
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
