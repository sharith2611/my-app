import { onMount } from "svelte";
import { apiFetch } from "$lib/api.js";

let usuario = $state(null);
let menu = $state([]);
let cargandoMenu = $state(true);
let errorMenu = $state("");

// Relación entre los nombres de los módulos y las rutas existentes.
const rutasModulos = {
    "inicio": {
        nombre: "Inicio",
        ruta: "/Inicio"
    },
    "usuarios": {
        nombre: "Usuarios",
        ruta: "/Usuarios"
    },
    "roles": {
        nombre: "Roles",
        ruta: "/Roles"
    },
    "modulos": {
        nombre: "Módulos",
        ruta: "/Modulos"
    },
    "permisos del menu": {
        nombre: "Permisos del menú",
        ruta: "/Modulo_rol"
    },
    "estudiantes": {
        nombre: "Actualizar Datos",
        ruta: "/Estudiante"
    },
    "convocatorias": {
        nombre: "Convocatorias",
        ruta: "/Convocatoria"
    },
    "convocatoria": {
        nombre: "Convocatoria",
        ruta: "/Convocatoria"
    },
    "postulaciones": {
        nombre: "Postulaciones",
        ruta: "/Postulacion"
    },
    "postulacion": {
        nombre: "Postulación",
        ruta: "/Postulacion"
    },
    "adjudicaciones": {
        nombre: "Adjudicaciones",
        ruta: "/Adjudicacion"
    },
    "adjudicacion": {
        nombre: "Adjudicación",
        ruta: "/Adjudicacion"
    },
    
    "programa academico": {
        nombre: "Programa Académico",
        ruta: "/Programa_academico"
    },
    "institucion": {
        nombre: "Institución",
        ruta: "/Institucion"
    },
    "facultad": {
        nombre: "Facultad",
        ruta: "/Facultad"
    },
    "actualizar datos": {
        nombre: "Actualizar Datos",
        ruta: "/Estudiante"
    },
    "estudiante": {
        nombre: "Actualizar Datos",
        ruta: "/Estudiante"
    },
    
    "auxilio educativo": {
        nombre: "Auxilio Educativo",
        ruta: "/Auxilio_educativo"
    }
};

function normalizarNombre(nombre) {
    return String(nombre ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
}

async function cargarMenu() {
    cargandoMenu = true;
    errorMenu = "";
    menu = [];

    try {
        const datosUsuario = sessionStorage.getItem("usuario");

        if (!datosUsuario) {
            errorMenu = "No hay una sesión de usuario activa.";
            return;
        }

        usuario = JSON.parse(datosUsuario);

        if (usuario?.id_rol == null) {
            errorMenu = "No se encontró el rol del usuario.";
            return;
        }

        // Consultar los módulos activos asignados al rol del usuario.
        const respuesta = await apiFetch(
            `/modulo-rol/${usuario.id_rol}`
        );

        if (!Array.isArray(respuesta)) {
            console.error(
                "Respuesta recibida al consultar los módulos:",
                respuesta
            );

            throw new Error(
                "El servidor no devolvió una lista válida de módulos. Verifica el endpoint en FastAPI."
            );
        }

        const opciones = respuesta
            .filter((modulo) => modulo.estado === true)
            .map((modulo) => {
                const nombreModulo =
                    modulo.nombre_modulo ??
                    modulo.nombre ??
                    modulo.modulo ??
                    "";

                const nombreNormalizado =
                    normalizarNombre(nombreModulo);

                const configuracion =
                    rutasModulos[nombreNormalizado];

                if (!configuracion) {
                    console.warn(
                        "No hay una ruta configurada para el módulo:",
                        nombreModulo
                    );

                    return null;
                }

                return configuracion;
            })
            .filter((item) => item !== null);

        // Evitar enlaces repetidos.
        menu = opciones.filter(
            (item, indice, lista) =>
                lista.findIndex(
                    (otro) => otro.ruta === item.ruta
                ) === indice
        );

    } catch (error) {
        console.error("Error cargando el menú:", error);

        errorMenu =
            error?.message ||
            "No fue posible cargar las opciones del menú.";
    } finally {
        cargandoMenu = false;
    }
}

onMount(() => {
    cargarMenu();
});