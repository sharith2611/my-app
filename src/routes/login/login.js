import { apiFetch } from "$lib/api.js";
import { goto } from "$app/navigation";

let usuario = $state("");
let clave = $state("");
let mostrarClave = $state(false);
let cargando = $state(false);
let mensaje = $state("");
let tipoMensaje = $state("danger");

async function iniciarSesion(event) {
    event.preventDefault();

    if (cargando) return;

    mensaje = "";

    const codigoIngresado = usuario.trim().toUpperCase();

    if (!codigoIngresado || !clave) {
        mensaje = "Por favor, ingresa tu usuario y clave.";
        tipoMensaje = "danger";
        return;
    }

    cargando = true;

    try {
        const usuarios = await apiFetch("/usuarios/");

        if (!Array.isArray(usuarios)) {
            throw new Error(
                "El servidor no devolvió una lista válida de usuarios."
            );
        }

        const usuarioEncontrado = usuarios.find((u) => {
            return (
                String(u.codigo_usuario ?? "").trim().toUpperCase() ===
                    codigoIngresado &&
                String(u.clave ?? "") === clave &&
                u.estado === true
            );
        });

        if (!usuarioEncontrado) {
            mensaje = "Usuario o clave incorrectos, o usuario inactivo.";
            tipoMensaje = "danger";
            return;
        }

        if (
            usuarioEncontrado.id_usuario == null ||
            usuarioEncontrado.id_rol == null
        ) {
            throw new Error(
                "Los datos del usuario están incompletos."
            );
        }

        sessionStorage.setItem(
"usuario",
JSON.stringify({
    id_usuario: usuarioEncontrado.id_usuario,
    codigo_usuario: usuarioEncontrado.codigo_usuario,
    nombre: usuarioEncontrado.nombre,
    cedula: usuarioEncontrado.cedula ?? null,
    id_rol: usuarioEncontrado.id_rol
})
);

console.log(
"Cédula del usuario encontrado:",
usuarioEncontrado.cedula
);

await goto("/Inicio");
    } catch (error) {
        console.error("Error al iniciar sesión:", error);

        mensaje =
            error?.message ||
            "No fue posible conectar con el servidor. Inténtalo nuevamente.";

        tipoMensaje = "danger";
    } finally {
        cargando = false;
    }
}