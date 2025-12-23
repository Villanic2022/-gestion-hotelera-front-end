// src/hooks/useAuth.js

export default function useAuth() {
    const token = localStorage.getItem("token");
    const usuario = getLocalStorageItem("usuario");
    let roles = [];

    try {
        const raw = localStorage.getItem("roles");
        if (raw) {
            roles = JSON.parse(raw);
            if (!Array.isArray(roles)) {
                roles = [];
            }
        }
    } catch {
        roles = [];
    }

    return {
        isAuthenticated: !!token,
        token,
        usuario,
        roles,
        hasRole: (requiredRole) => roles.includes(requiredRole),
    };
}

function getLocalStorageItem(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}
