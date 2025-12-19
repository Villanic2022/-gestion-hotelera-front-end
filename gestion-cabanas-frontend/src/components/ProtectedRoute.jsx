// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({ children, allowedRoles }) {
    const { isAuthenticated, roles } = useAuth();

    // Si no está logueado → lo mando al login
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Si se pasan roles permitidos, chequeamos (por ahora lo dejamos preparado)
    if (allowedRoles && allowedRoles.length > 0) {
        const tieneRol = roles.some((r) => allowedRoles.includes(r));
        if (!tieneRol) {
            // No tiene rol suficiente → lo mandamos al dashboard
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
}
