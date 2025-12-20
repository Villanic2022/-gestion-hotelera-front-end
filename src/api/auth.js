// src/api/auth.js
import api from "./axios";

// LOGIN: POST /api/auth/login
export async function login(usuario, password) {
    const res = await api.post("/auth/login", { usuario, password });
    const data = res.data;

    // Guardar token y datos básicos
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", data.usuario);
    localStorage.setItem("roles", JSON.stringify(data.roles || []));

    return data;
}

// REGISTER: POST /api/auth/register
// body que ya usamos en Postman:
// { "usuario", "password", "nombre", "apellido", "email" }
export async function register({
    usuario,
    password,
    nombre,
    apellido,
    email,
    nombreEmpresa,
    cuit,
    condicionIva,
    domicilioFiscal,
}) {
    const res = await api.post("/auth/register", {
        usuario,
        password,
        nombre,
        apellido,
        email,
        nombreEmpresa,
        cuit,
        condicionIva,
        domicilioFiscal,
    });

    const data = res.data;

    // Si tu backend ya devuelve token + roles (como en login), los guardamos igual
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", data.usuario);
    localStorage.setItem("roles", JSON.stringify(data.roles || []));

    return data;
}

// FORGOT PASSWORD: POST /api/auth/forgot-password
export async function forgotPassword(email) {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
}

// RESET PASSWORD: POST /api/auth/reset-password
export async function resetPassword(token, newPassword) {
    const res = await api.post("/auth/reset-password", { token, newPassword });
    return res.data;
}
