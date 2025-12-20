// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth";
import "../styles/auth.css";

export default function Register() {
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    // Nuevos estados para datos fiscales
    const [nombreEmpresa, setNombreEmpresa] = useState("");
    const [cuit, setCuit] = useState("");
    const [condicionIva, setCondicionIva] = useState("");
    const [domicilioFiscal, setDomicilioFiscal] = useState("");

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        // Validaciones básicas frontend
        if (cuit.length !== 11) {
            setError("El CUIT debe tener exactamente 11 dígitos numéricos.");
            return;
        }

        setSaving(true);

        try {
            await register({
                usuario,
                password,
                nombre,
                apellido,
                email,
                // Nuevos campos
                nombreEmpresa,
                cuit,
                condicionIva,
                domicilioFiscal
            });
            // Si el backend devuelve token, acá ya queda logueado.
            navigate("/dashboard");
        } catch (err) {
            console.error("ERROR REGISTER:", err);
            const mensajeBackend =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                (typeof err?.response?.data === "string" ? err.response.data : "") ||
                "No se pudo registrar el usuario";
            setError(mensajeBackend);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="auth-container">
            {/* Panel Izquierdo - Branding */}
            <div className="auth-brand-panel">
                <div className="auth-brand-content">
                    <div className="auth-brand-icon">🏡</div>
                    <h1 className="auth-brand-title">Gestión de Cabañas</h1>
                    <p className="auth-brand-subtitle">
                        Únete y comienza a administrar tu complejo de cabañas de manera eficiente
                    </p>
                </div>
            </div>

            {/* Panel Derecho - Formulario */}
            <div className="auth-form-panel">
                <div className="auth-form-container">
                    <div className="auth-form-header">
                        <h2 className="auth-form-welcome">Crear cuenta</h2>
                        <p className="auth-form-description">Completa tus datos para registrarte</p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-input-group">
                            <label className="auth-label">Usuario</label>
                            <div className="auth-input-wrapper">
                                <span className="auth-input-icon">👤</span>
                                <input
                                    type="text"
                                    value={usuario}
                                    onChange={(e) => setUsuario(e.target.value)}
                                    required
                                    className="auth-input"
                                    placeholder="Elige un nombre de usuario"
                                />
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label">Contraseña</label>
                            <div className="auth-input-wrapper">
                                <span className="auth-input-icon">🔒</span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="auth-input"
                                    placeholder="Crea una contraseña segura"
                                />
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label">Nombre</label>
                            <div className="auth-input-wrapper">
                                <span className="auth-input-icon">✍️</span>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                    className="auth-input"
                                    placeholder="Tu nombre"
                                />
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label">Apellido</label>
                            <div className="auth-input-wrapper">
                                <span className="auth-input-icon">✍️</span>
                                <input
                                    type="text"
                                    value={apellido}
                                    onChange={(e) => setApellido(e.target.value)}
                                    required
                                    className="auth-input"
                                    placeholder="Tu apellido"
                                />
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label">Email</label>
                            <div className="auth-input-wrapper">
                                <span className="auth-input-icon">📧</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="auth-input"
                                    placeholder="tu@email.com"
                                />
                            </div>
                        </div>

                        {/* SECCIÓN DATOS FISCALES */}
                        <div style={{ margin: "20px 0 10px", borderTop: "1px solid #e5e7eb", paddingTop: "20px" }}>
                            <h3 style={{ fontSize: "1.1rem", color: "#111827", marginBottom: "15px" }}>Datos Fiscales de la Empresa</h3>
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label">Nombre de la Empresa / Hotel</label>
                            <div className="auth-input-wrapper">
                                <span className="auth-input-icon">🏢</span>
                                <input
                                    type="text"
                                    value={nombreEmpresa}
                                    onChange={(e) => setNombreEmpresa(e.target.value)}
                                    required
                                    className="auth-input"
                                    placeholder="Nombre de fantasía o Razón Social"
                                />
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label">CUIT (sin guiones)</label>
                            <div className="auth-input-wrapper">
                                <span className="auth-input-icon">🔢</span>
                                <input
                                    type="text"
                                    value={cuit}
                                    onChange={(e) => {
                                        // Solo permitir números
                                        const val = e.target.value.replace(/[^0-9]/g, "");
                                        setCuit(val);
                                    }}
                                    maxLength={11}
                                    required
                                    className="auth-input"
                                    placeholder="XXYYYYYYYYZ"
                                />
                            </div>
                            <small style={{ color: "#6b7280", fontSize: "0.8rem" }}>11 dígitos numéricos</small>
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label">Condición ante IVA</label>
                            <div className="auth-input-wrapper">
                                <span className="auth-input-icon">📜</span>
                                <select
                                    value={condicionIva}
                                    onChange={(e) => setCondicionIva(e.target.value)}
                                    required
                                    className="auth-input"
                                    style={{ backgroundColor: "white" }}
                                >
                                    <option value="">Seleccione una condición...</option>
                                    <option value="MONOTRIBUTO">Monotributo</option>
                                    <option value="RESPONSABLE_INSCRIPTO">Responsable Inscripto</option>
                                    <option value="EXENTO">Exento</option>
                                    <option value="CONSUMIDOR_FINAL">Consumidor Final</option>
                                </select>
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label">Domicilio Fiscal</label>
                            <div className="auth-input-wrapper" style={{ alignItems: "start" }}>
                                <span className="auth-input-icon" style={{ marginTop: "10px" }}>📍</span>
                                <textarea
                                    value={domicilioFiscal}
                                    onChange={(e) => setDomicilioFiscal(e.target.value)}
                                    required
                                    className="auth-input"
                                    placeholder="Calle, Número, Localidad, Provincia"
                                    rows={3}
                                    style={{ paddingTop: "10px", resize: "vertical", minHeight: "80px" }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="auth-button"
                        >
                            {saving ? "Creando cuenta..." : "Registrarse"}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p className="auth-footer-text">
                            ¿Ya tienes cuenta?{" "}
                            <Link to="/" className="auth-link">
                                Inicia sesión aquí
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
