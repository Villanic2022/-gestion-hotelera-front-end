// src/api/usuarios.js
import api from "./axios";

/**
 * Obtener lista de usuarios del cliente
 * GET /api/usuarios
 */
export async function getUsuarios() {
    const res = await api.get("/usuarios");
    return res.data;
}

/**
 * Crear nuevo usuario con rol RECEPCIÓN
 * POST /api/usuarios/crear-recepcion
 */
export async function crearUsuarioRecepcion(data) {
    const res = await api.post("/usuarios/crear-recepcion", {
        usuario: data.usuario,
        password: data.password,
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
    });
    return res.data;
}

/**
 * Promover usuario a ADMIN
 * PUT /api/usuarios/{id}/promover-admin
 */
export async function promoverAAdmin(id) {
    const res = await api.put("/usuarios/" + id + "/promover-admin");
    return res.data;
}

/**
 * Activar usuario
 * PUT /api/usuarios/{id}/activar
 */
export async function activarUsuario(id) {
    const res = await api.put("/usuarios/" + id + "/activar");
    return res.data;
}

/**
 * Desactivar usuario
 * PUT /api/usuarios/{id}/desactivar
 */
export async function desactivarUsuario(id) {
    const res = await api.put("/usuarios/" + id + "/desactivar");
    return res.data;
}
