// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, forgotPassword } from "../api/auth";
import { useToast } from "../context/ToastContext";
import "../styles/auth.css";

export default function Login() {
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Estados para recuperación de contraseña
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [sendingEmail, setSendingEmail] = useState(false);

    const navigate = useNavigate();
    const { showToast } = useToast();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(usuario, password);
            navigate("/dashboard");
        } catch (err) {
            console.error("ERROR LOGIN:", err);

            const mensajeBackend =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.response?.data ||
                "Usuario o contraseña incorrectos";

            setError(mensajeBackend);
        } finally {
            setLoading(false);
        }
    }

    async function handleForgotPassword(e) {
        e.preventDefault();
        setSendingEmail(true);
        
        try {
            await forgotPassword(forgotEmail);
            showToast("success", "Se ha enviado un email con las instrucciones para recuperar tu contraseña");
            setShowForgotPassword(false);
            setForgotEmail("");
        } catch (err) {
            console.error("ERROR FORGOT PASSWORD:", err);
            const mensajeError = err?.response?.data?.message || "Error al enviar el email de recuperación";
            showToast("error", mensajeError);
        } finally {
            setSendingEmail(false);
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
                        Sistema integral para administrar reservas, huéspedes y operaciones de tu complejo de cabañas
                    </p>
                </div>
            </div>

            {/* Panel Derecho - Formulario */}
            <div className="auth-form-panel">
                <div className="auth-form-container">
                    <div className="auth-form-header">
                        <h2 className="auth-form-welcome">¡Bienvenido!</h2>
                        <p className="auth-form-description">Ingresa tus credenciales para continuar</p>
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
                                    placeholder="Ingresa tu usuario"
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
                                    placeholder="Ingresa tu contraseña"
                                />
                            </div>
                            <div style={{ textAlign: "right", marginTop: "8px" }}>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    className="auth-link"
                                    style={{ 
                                        background: "none", 
                                        border: "none", 
                                        padding: 0, 
                                        fontSize: "14px",
                                        cursor: "pointer"
                                    }}
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="auth-button"
                        >
                            {loading ? "Ingresando..." : "Iniciar Sesión"}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p className="auth-footer-text">
                            ¿No tienes cuenta?{" "}
                            <Link to="/register" className="auth-link">
                                Regístrate aquí
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal de Recuperación de Contraseña */}
            {showForgotPassword && (
                <div className="crud-modal-overlay">
                    <div className="crud-modal" style={{ maxWidth: "400px" }}>
                        <div className="crud-modal-header">
                            <h2 className="crud-modal-title">🔐 Recuperar Contraseña</h2>
                            <button 
                                className="crud-modal-close" 
                                onClick={() => setShowForgotPassword(false)}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <form onSubmit={handleForgotPassword}>
                            <div className="crud-modal-body">
                                <p style={{ 
                                    marginBottom: "20px", 
                                    color: "#6b7280", 
                                    textAlign: "center",
                                    lineHeight: "1.5"
                                }}>
                                    Ingresa tu email y te enviaremos las instrucciones para recuperar tu contraseña.
                                </p>
                                
                                <div className="crud-form-group">
                                    <label className="crud-form-label">Email</label>
                                    <input
                                        type="email"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        required
                                        className="crud-form-input"
                                        placeholder="ejemplo@correo.com"
                                        style={{ fontSize: "16px", padding: "12px" }}
                                    />
                                </div>
                            </div>
                            
                            <div className="crud-modal-footer">
                                <button 
                                    type="button" 
                                    className="crud-btn-cancel"
                                    onClick={() => setShowForgotPassword(false)}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="crud-btn-submit"
                                    disabled={sendingEmail}
                                    style={{ minWidth: "140px" }}
                                >
                                    {sendingEmail ? "Enviando..." : "📧 Enviar Email"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
