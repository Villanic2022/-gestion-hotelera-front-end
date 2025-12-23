// src/pages/UsuariosPage.jsx
import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import Layout from "../components/Layout";
import {
    getUsuarios,
    crearUsuarioRecepcion,
    promoverAAdmin,
    activarUsuario,
    desactivarUsuario,
} from "../api/usuarios";
import "../styles/crud.css";

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const { showToast } = useToast();

    // Estado del formulario
    const [formData, setFormData] = useState({
        usuario: "",
        password: "",
        confirmarPassword: "",
        nombre: "",
        apellido: "",
        email: "",
    });

    useEffect(() => {
        cargarUsuarios();
    }, []);

    async function cargarUsuarios() {
        setLoading(true);
        try {
            const data = await getUsuarios();
            console.log("🔍 DEBUG - Datos recibidos del backend:", data);
            console.log("🔍 DEBUG - Primer usuario:", data[0]);
            setUsuarios(data);
        } catch (err) {
            console.error("Error al cargar usuarios:", err);
            showToast("error", "Error al cargar usuarios");
        } finally {
            setLoading(false);
        }
    }

    function handleInputChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        // Validar que las contraseñas coincidan
        if (formData.password !== formData.confirmarPassword) {
            showToast("error", "Las contraseñas no coinciden");
            return;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showToast("error", "El email no es válido");
            return;
        }

        try {
            await crearUsuarioRecepcion({
                usuario: formData.usuario,
                password: formData.password,
                nombre: formData.nombre,
                apellido: formData.apellido,
                email: formData.email,
            });

            showToast("success", "Usuario creado exitosamente");
            setShowModal(false);
            resetForm();
            cargarUsuarios();
        } catch (err) {
            console.error("Error al crear usuario:", err);
            const mensaje =
                err?.response?.data?.message || "Error al crear usuario";
            showToast("error", mensaje);
        }
    }

    function resetForm() {
        setFormData({
            usuario: "",
            password: "",
            confirmarPassword: "",
            nombre: "",
            apellido: "",
            email: "",
        });
    }

    function abrirConfirmacion(accion, usuario) {
        setConfirmAction({ accion, usuario });
        setShowConfirmModal(true);
    }

    async function ejecutarAccion() {
        if (!confirmAction) return;

        const { accion, usuario } = confirmAction;

        try {
            switch (accion) {
                case "promover":
                    await promoverAAdmin(usuario.id);
                    showToast("success", "Usuario promocionado a ADMIN exitosamente");
                    break;
                case "activar":
                    await activarUsuario(usuario.id);
                    showToast("success", "Usuario activado exitosamente");
                    break;
                case "desactivar":
                    await desactivarUsuario(usuario.id);
                    showToast("success", "Usuario desactivado exitosamente");
                    break;
            }

            setShowConfirmModal(false);
            setConfirmAction(null);
            cargarUsuarios();
        } catch (err) {
            console.error("Error al ejecutar acción:", err);
            const mensaje = err?.response?.data?.message || "Error al ejecutar la acción";
            showToast("error", mensaje);
        }
    }

    function esRolRecepcion(usuario) {
        return (
            usuario.roles &&
            usuario.roles.includes("ROLE_RECEPCION") &&
            !usuario.roles.includes("ROLE_ADMIN")
        );
    }

    function tieneRolAdmin(usuario) {
        return usuario.roles && usuario.roles.includes("ROLE_ADMIN");
    }

    return (
        <Layout>
            <div className="crud-page">
                <div className="crud-header">
                    <div>
                        <h1 className="crud-title">👥 Gestión de Usuarios</h1>
                        <p className="crud-subtitle">
                            Administra los usuarios del sistema
                        </p>
                    </div>
                    <button
                        className="crud-btn-add"
                        onClick={() => setShowModal(true)}
                    >
                        ➕ Crear Usuario Recepción
                    </button>
                </div>

                {loading ? (
                    <div className="crud-loading">Cargando usuarios...</div>
                ) : (
                    <div className="crud-table-container">
                        <table className="crud-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Usuario</th>
                                    <th>Nombre</th>
                                    <th>Apellido</th>
                                    <th>Email</th>
                                    <th>Estado</th>
                                    <th>Roles</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="crud-empty">
                                            No hay usuarios registrados
                                        </td>
                                    </tr>
                                ) : (
                                    usuarios.map((usuario) => (
                                        <tr key={usuario.id}>
                                            <td>{usuario.id}</td>
                                            <td>
                                                <strong>{usuario.usuario}</strong>
                                            </td>
                                            <td>{usuario.nombre}</td>
                                            <td>{usuario.apellido}</td>
                                            <td>{usuario.email}</td>
                                            <td>
                                                <span
                                                    className={
                                                        usuario.activo
                                                            ? "badge-activo"
                                                            : "badge-inactivo"
                                                    }
                                                >
                                                    {usuario.activo
                                                        ? "Activo"
                                                        : "Inactivo"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="badges-container">
                                                    {tieneRolAdmin(usuario) && (
                                                        <span className="badge-admin">
                                                            ADMIN
                                                        </span>
                                                    )}
                                                    {usuario.roles &&
                                                        usuario.roles.includes(
                                                            "ROLE_RECEPCION"
                                                        ) && (
                                                            <span className="badge-recepcion">
                                                                RECEPCIÓN
                                                            </span>
                                                        )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="crud-actions">
                                                    {esRolRecepcion(usuario) && (
                                                        <button
                                                            className="crud-btn-promote"
                                                            onClick={() =>
                                                                abrirConfirmacion(
                                                                    "promover",
                                                                    usuario
                                                                )
                                                            }
                                                            title="Promover a ADMIN"
                                                        >
                                                            ⬆️ Promover
                                                        </button>
                                                    )}

                                                    {usuario.activo ? (
                                                        <button
                                                            className="crud-btn-delete"
                                                            onClick={() =>
                                                                abrirConfirmacion(
                                                                    "desactivar",
                                                                    usuario
                                                                )
                                                            }
                                                            title="Desactivar usuario"
                                                        >
                                                            🚫 Desactivar
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="crud-btn-success"
                                                            onClick={() =>
                                                                abrirConfirmacion(
                                                                    "activar",
                                                                    usuario
                                                                )
                                                            }
                                                            title="Activar usuario"
                                                        >
                                                            ✅ Activar
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal para crear usuario */}
                {showModal && (
                    <div className="crud-modal-overlay">
                        <div className="crud-modal">
                            <div className="crud-modal-header">
                                <h2 className="crud-modal-title">
                                    ➕ Crear Usuario Recepción
                                </h2>
                                <button
                                    className="crud-modal-close"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="crud-modal-body">
                                    <div className="crud-form-group">
                                        <label className="crud-form-label">
                                            Usuario *
                                        </label>
                                        <input
                                            type="text"
                                            name="usuario"
                                            value={formData.usuario}
                                            onChange={handleInputChange}
                                            required
                                            className="crud-form-input"
                                            placeholder="nombreusuario"
                                        />
                                    </div>

                                    <div className="crud-form-group">
                                        <label className="crud-form-label">
                                            Contraseña *
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                            className="crud-form-input"
                                            placeholder="••••••••"
                                            minLength="6"
                                        />
                                    </div>

                                    <div className="crud-form-group">
                                        <label className="crud-form-label">
                                            Confirmar Contraseña *
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmarPassword"
                                            value={formData.confirmarPassword}
                                            onChange={handleInputChange}
                                            required
                                            className="crud-form-input"
                                            placeholder="••••••••"
                                            minLength="6"
                                        />
                                    </div>

                                    <div className="crud-form-group">
                                        <label className="crud-form-label">
                                            Nombre *
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleInputChange}
                                            required
                                            className="crud-form-input"
                                            placeholder="Juan"
                                        />
                                    </div>

                                    <div className="crud-form-group">
                                        <label className="crud-form-label">
                                            Apellido *
                                        </label>
                                        <input
                                            type="text"
                                            name="apellido"
                                            value={formData.apellido}
                                            onChange={handleInputChange}
                                            required
                                            className="crud-form-input"
                                            placeholder="Pérez"
                                        />
                                    </div>

                                    <div className="crud-form-group">
                                        <label className="crud-form-label">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="crud-form-input"
                                            placeholder="ejemplo@correo.com"
                                        />
                                    </div>
                                </div>

                                <div className="crud-modal-footer">
                                    <button
                                        type="button"
                                        className="crud-btn-cancel"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                    <button type="submit" className="crud-btn-submit">
                                        Crear Usuario
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal de confirmación */}
                {showConfirmModal && confirmAction && (
                    <div className="crud-modal-overlay">
                        <div
                            className="crud-modal"
                            style={{ maxWidth: "450px" }}
                        >
                            <div className="crud-modal-header">
                                <h2 className="crud-modal-title">
                                    {confirmAction.accion === "promover" && "⬆️ Confirmar Promoción"}
                                    {confirmAction.accion === "activar" && "✅ Confirmar Activación"}
                                    {confirmAction.accion === "desactivar" && "🚫 Confirmar Desactivación"}
                                </h2>
                                <button
                                    className="crud-modal-close"
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        setConfirmAction(null);
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="crud-modal-body">
                                <p style={{ textAlign: "center", fontSize: "16px", color: "#4b5563" }}>
                                    {confirmAction.accion === "promover" &&
                                        "¿Estás seguro de promover a " + confirmAction.usuario.nombre + " " + confirmAction.usuario.apellido + " a ADMIN?"}
                                    {confirmAction.accion === "activar" &&
                                        "¿Estás seguro de activar a " + confirmAction.usuario.nombre + " " + confirmAction.usuario.apellido + "?"}
                                    {confirmAction.accion === "desactivar" &&
                                        "¿Desactivar usuario " + confirmAction.usuario.nombre + " " + confirmAction.usuario.apellido + "? No podrá acceder al sistema."}
                                </p>
                            </div>

                            <div className="crud-modal-footer">
                                <button
                                    className="crud-btn-cancel"
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        setConfirmAction(null);
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="crud-btn-submit"
                                    onClick={ejecutarAccion}
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
