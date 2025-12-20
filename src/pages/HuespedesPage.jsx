// src/pages/HuespedesPage.jsx
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
    getHuespedes,
    crearHuesped,
    actualizarHuesped,
    eliminarHuesped,
} from "../api/huespedes";
import { useToast } from "../context/ToastContext";
import "../styles/crud.css";

export default function HuespedesPage() {
    const { showToast } = useToast();
    const [huespedes, setHuespedes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);

    // Campos según tu backend
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [pais, setPais] = useState("");
    const [tipoDocumento, setTipoDocumento] = useState("DNI");
    const [numeroDocumento, setNumeroDocumento] = useState("");
    const [notas, setNotas] = useState("");
    const [editingId, setEditingId] = useState(null);

    async function cargarHuespedes() {
        try {
            setLoading(true);
            setError("");
            const data = await getHuespedes();
            setHuespedes(data);
        } catch (err) {
            console.error(err);
            setError("Error al cargar huéspedes");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        cargarHuespedes();
    }, []);

    function limpiarFormulario() {
        setNombre("");
        setApellido("");
        setEmail("");
        setTelefono("");
        setPais("");
        setTipoDocumento("DNI");
        setNumeroDocumento("");
        setNotas("");
        setEditingId(null);
    }

    function handleNuevo() {
        limpiarFormulario();
        setShowModal(true);
    }

    function handleEditar(h) {
        setEditingId(h.id);
        setNombre(h.nombre);
        setApellido(h.apellido);
        setEmail(h.email);
        setTelefono(h.telefono);
        setPais(h.pais);
        setTipoDocumento(h.tipoDocumento);
        setNumeroDocumento(h.numeroDocumento);
        setNotas(h.notas || "");
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
            nombre,
            apellido,
            email,
            telefono,
            pais,
            tipoDocumento,
            numeroDocumento,
            notas,
        };

        try {
            if (editingId === null) {
                await crearHuesped(payload);
                showToast("Huésped creado exitosamente", "success");
            } else {
                await actualizarHuesped(editingId, payload);
                showToast("Huésped actualizado", "success");
            }
            handleCloseModal();
            await cargarHuespedes();
        } catch (err) {
            console.error(err);
            setError("No se pudo guardar el huésped");
        } finally {
            setSaving(false);
        }
    }

    async function handleEliminar(id) {
        const ok = window.confirm("¿Eliminar este huésped?");
        if (!ok) return;

        try {
            setError("");
            await eliminarHuesped(id);
            showToast("Huésped eliminado", "success");
            await cargarHuespedes();
        } catch (err) {
            console.error(err);
            setError("No se pudo eliminar el huésped");
        }
    }

    // Filtrar huéspedes
    const huespedesFiltrados = huespedes.filter(h =>
        h.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.numeroDocumento && h.numeroDocumento.includes(searchTerm))
    );

    return (
        <Layout>
            <div className="crud-container">
                {/* Header */}
                <div className="crud-header">
                    <div className="crud-header-left">
                        <h1 className="crud-title">
                            <span className="crud-title-icon">👥</span>
                            Huéspedes
                        </h1>
                        <p className="crud-count">
                            {huespedes.length} {huespedes.length === 1 ? 'huésped registrado' : 'huéspedes registrados'}
                        </p>
                    </div>
                    <button className="crud-btn-new" onClick={handleNuevo}>
                        <span>➕</span>
                        Nuevo Huésped
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
                            placeholder="Buscar por nombre, email o documento..."
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
                        <p>Cargando huéspedes...</p>
                    </div>
                )}

                {/* Grid */}
                {!loading && huespedesFiltrados.length > 0 && (
                    <div className="crud-grid">
                        {huespedesFiltrados.map((h) => (
                            <div key={h.id} className="crud-card">
                                <div className="crud-card-header">
                                    <div>
                                        <h3 className="crud-card-title">
                                            👤 {h.nombre} {h.apellido}
                                        </h3>
                                        <p className="crud-card-id">ID: {h.id}</p>
                                    </div>
                                    <span className="crud-badge info">
                                        {h.tipoDocumento}
                                    </span>
                                </div>
                                <div className="crud-card-body">
                                    <div className="crud-card-field">
                                        <span className="crud-card-field-icon">📧</span>
                                        <span className="crud-card-field-text">{h.email}</span>
                                    </div>
                                    {h.telefono && (
                                        <div className="crud-card-field">
                                            <span className="crud-card-field-icon">📞</span>
                                            <span className="crud-card-field-text">{h.telefono}</span>
                                        </div>
                                    )}
                                    {h.pais && (
                                        <div className="crud-card-field">
                                            <span className="crud-card-field-icon">🌍</span>
                                            <span className="crud-card-field-text">{h.pais}</span>
                                        </div>
                                    )}
                                    <div className="crud-card-field">
                                        <span className="crud-card-field-icon">🆔</span>
                                        <span className="crud-card-field-text">{h.numeroDocumento || 'Sin documento'}</span>
                                    </div>
                                </div>
                                <div className="crud-card-actions">
                                    <button
                                        className="crud-btn-action crud-btn-edit"
                                        onClick={() => handleEditar(h)}
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        className="crud-btn-action crud-btn-delete"
                                        onClick={() => handleEliminar(h.id)}
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty */}
                {!loading && huespedesFiltrados.length === 0 && (
                    <div className="crud-empty">
                        <div className="crud-empty-icon">👥</div>
                        <p className="crud-empty-text">
                            {searchTerm ? 'No se encontraron huéspedes' : 'No hay huéspedes registrados'}
                        </p>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="crud-modal-overlay" onClick={handleCloseModal}>
                        <div className="crud-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="crud-modal-header">
                                <h2 className="crud-modal-title">
                                    {editingId === null ? 'Nuevo Huésped' : 'Editar Huésped'}
                                </h2>
                                <button className="crud-modal-close" onClick={handleCloseModal}>×</button>
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
                                            />
                                        </div>

                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Apellido *</label>
                                            <input
                                                type="text"
                                                value={apellido}
                                                onChange={(e) => setApellido(e.target.value)}
                                                required
                                                className="crud-form-input"
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
                                            />
                                        </div>

                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Teléfono</label>
                                            <input
                                                type="text"
                                                value={telefono}
                                                onChange={(e) => setTelefono(e.target.value)}
                                                className="crud-form-input"
                                            />
                                        </div>

                                        <div className="crud-form-group">
                                            <label className="crud-form-label">País</label>
                                            <input
                                                type="text"
                                                value={pais}
                                                onChange={(e) => setPais(e.target.value)}
                                                className="crud-form-input"
                                            />
                                        </div>

                                        <div className="crud-form-group">
                                            <label className="crud-form-label">Tipo de documento</label>
                                            <select
                                                value={tipoDocumento}
                                                onChange={(e) => setTipoDocumento(e.target.value)}
                                                className="crud-form-select"
                                            >
                                                <option value="DNI">DNI</option>
                                                <option value="PASAPORTE">PASAPORTE</option>
                                                <option value="CUIT">CUIT</option>
                                                <option value="OTRO">OTRO</option>
                                            </select>
                                        </div>

                                        <div className="crud-form-group">
                                            <label className="crud-form-label">N° documento</label>
                                            <input
                                                type="text"
                                                value={numeroDocumento}
                                                onChange={(e) => setNumeroDocumento(e.target.value)}
                                                className="crud-form-input"
                                            />
                                        </div>

                                        <div className="crud-form-group full-width">
                                            <label className="crud-form-label">Notas</label>
                                            <textarea
                                                value={notas}
                                                onChange={(e) => setNotas(e.target.value)}
                                                rows={3}
                                                className="crud-form-textarea"
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
