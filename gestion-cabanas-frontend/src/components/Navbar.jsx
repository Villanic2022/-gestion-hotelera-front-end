// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState("");

    useEffect(() => {
        const u = localStorage.getItem("usuario");
        if (u) setUsuario(u);
    }, []);

    function handleLogout() {
        // Borramos datos del login
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        localStorage.removeItem("roles");

        // Volvemos al login
        navigate("/");
    }

    return (
        <header
            style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "white",
                padding: "16px 32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 4px 20px rgba(245, 158, 11, 0.3)",
                borderBottom: "3px solid rgba(255, 255, 255, 0.1)",
            }}
        >
            {/* LOGO / NOMBRE DEL SISTEMA */}
            <div style={{ 
                fontWeight: "bold", 
                fontSize: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
            }}>
                🏕️ Sistema de Cabañas
            </div>

            {/* LINKS DE NAVEGACIÓN */}
            <nav style={{ display: "flex", gap: "0", alignItems: "center" }}>
                <Link
                    to="/dashboard"
                    style={{ 
                        color: "white", 
                        textDecoration: "none", 
                        fontSize: "14px",
                        fontWeight: "500",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                        backgroundColor: "transparent"
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                        e.target.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.transform = "translateY(0)";
                    }}
                >
                    Dashboard
                </Link>

                <Link
                    to="/hoteles"
                    style={{ 
                        color: "white", 
                        textDecoration: "none", 
                        fontSize: "14px",
                        fontWeight: "500",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                        backgroundColor: "transparent"
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                        e.target.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.transform = "translateY(0)";
                    }}
                >
                    Hoteles
                </Link>

                {/* 👇 NUEVO LINK */}
                <Link
                    to="/tipos-habitacion"
                    style={{ 
                        color: "white", 
                        textDecoration: "none", 
                        fontSize: "14px",
                        fontWeight: "500",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                        backgroundColor: "transparent"
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                        e.target.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.transform = "translateY(0)";
                    }}
                >
                    Tipos de habitación
                </Link>

                <Link
                    to="/habitaciones"
                    style={{ 
                        color: "white", 
                        textDecoration: "none", 
                        fontSize: "14px",
                        fontWeight: "500",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                        backgroundColor: "transparent"
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                        e.target.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.transform = "translateY(0)";
                    }}
                >
                    Habitaciones
                </Link>

                <Link
                    to="/huespedes"
                    style={{ 
                        color: "white", 
                        textDecoration: "none", 
                        fontSize: "14px",
                        fontWeight: "500",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                        backgroundColor: "transparent"
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                        e.target.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.transform = "translateY(0)";
                    }}
                >
                    Huéspedes
                </Link>

                <Link
                    to="/reservas"
                    style={{ 
                        color: "white", 
                        textDecoration: "none", 
                        fontSize: "14px",
                        fontWeight: "500",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                        backgroundColor: "transparent"
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                        e.target.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.transform = "translateY(0)";
                    }}
                >
                    Reservas
                </Link>

                {/* Usuario + botón salir */}
                <span style={{ 
                    marginLeft: "24px", 
                    fontSize: "14px",
                    fontWeight: "500",
                    opacity: "0.9"
                }}>
                    {usuario && `Hola, ${usuario}`}
                </span>

                <button
                    onClick={handleLogout}
                    style={{
                        marginLeft: "12px",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        background: "rgba(239, 68, 68, 0.9)",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = "#ef4444";
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "rgba(239, 68, 68, 0.9)";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                    }}
                >
                    Cerrar sesión
                </button>
            </nav>
        </header>
    );
}
