// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({ children, allowedRoles }) {
    const { isAuthenticated, roles } = useAuth();

    // Si no está logueado → lo mando al login
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Si se pasan roles permitidos, chequeamos
    if (allowedRoles && allowedRoles.length > 0) {
        const tieneRol = roles.some((r) => allowedRoles.includes(r));
        if (!tieneRol) {
            // No tiene rol suficiente → mostramos mensaje de acceso denegado
            return (
                <div style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}>
                    <div style={{
                        background: "white",
                        borderRadius: "16px",
                        padding: "40px",
                        maxWidth: "500px",
                        textAlign: "center",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
                    }}>
                        <div style={{ fontSize: "64px", marginBottom: "20px" }}>🚫</div>
                        <h2 style={{ color: "#1f2937", marginBottom: "12px", fontSize: "24px" }}>
                            Acceso Denegado
                        </h2>
                        <p style={{ color: "#6b7280", marginBottom: "24px", lineHeight: "1.6" }}>
                            No tienes permisos para acceder a esta sección.
                            Contacta al administrador si necesitas acceso.
                        </p>
                        <button
                            onClick={() => window.location.href = "/dashboard"}
                            style={{
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "white",
                                border: "none",
                                padding: "12px 24px",
                                borderRadius: "8px",
                                fontSize: "16px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "transform 0.2s"
                            }}
                            onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                            onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                        >
                            Volver al Dashboard
                        </button>
                    </div>
                </div>
            );
        }
    }

    return children;
}
