import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { apiFetch } from "$lib/api.js";
import Navbar from "../../lib/Navbar.svelte";
import Footer from "../../lib/Footer.svelte";
import DataTable from "$lib/components/DataTable.svelte";
import Accesibilidad from "$lib/components/accesibilidad.svelte";
import Cookies from "$lib/components/cookies.svelte";
import Logo from "$lib/components/logo.svelte";
import RedesSociales from "$lib/components/Redes_sociales.svelte";
import Toast from "$lib/components/toast.svelte";
import VolverArriba from "$lib/components/Volver_arriba.svelte";
import Whatsapp from "$lib/components/Whatsapp.svelte";

let usuario = $state(null);
let estudiante = $state(null);
let convocatorias = $state([]);
let postulaciones = $state([]);

let idConvocatoria = $state("");
let fechaPostulacion = $state("");
let observaciones = $state("");

let validandoEstudiante = $state(true);
let cargandoConvocatorias = $state(false);
let cargandoPostulaciones = $state(false);
let guardando = $state(false);

let mensaje = $state("");
let tipoMensaje = $state("danger");
let errorPostulaciones = $state("");

function obtenerFechaActual() {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}

function mostrarMensaje(texto, tipo = "danger") {
    mensaje = texto;
    tipoMensaje = tipo;
}

function obtenerNombreConvocatoria(convocatoria) {
    return (
        convocatoria.nombre_convocatoria ??
        convocatoria.nombre ??
        convocatoria.descripcion ??
        `Convocatoria ${convocatoria.id_convocatoria}`
    );
}

function normalizarLista(respuesta) {
    if (Array.isArray(respuesta)) {
        return respuesta;
    }

    if (Array.isArray(respuesta?.items)) {
        return respuesta.items;
    }

    throw new Error("El servidor no devolvió una lista válida de postulaciones.");
}

function formatearFecha(fecha) {
    if (!fecha) return "—";

    const texto = String(fecha).slice(0, 10);
    const partes = texto.split("-");

    if (partes.length !== 3) return texto;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

const columnasPostulaciones = [
    {
        key: "id_postulacion",
        label: "N.º"
    },
    {
        key: "convocatoria",
        label: "Convocatoria",
        value: (fila) =>
            fila.nombre_convocatoria ??
            fila.convocatoria?.nombre_convocatoria ??
            fila.convocatoria?.nombre ??
            `Convocatoria ${fila.id_convocatoria ?? ""}`.trim()
    },
    {
        key: "fecha_postulacion",
        label: "Fecha",
        value: (fila) => formatearFecha(fila.fecha_postulacion)
    },
    {
        key: "escala",
        label: "Estado"
    },
    {
        key: "observaciones",
        label: "Observaciones",
        sortable: false
    }
];

async function cargarPostulaciones() {
    if (!estudiante?.id_estudiante) return;

    cargandoPostulaciones = true;
    errorPostulaciones = "";

    try {
        const respuesta = await apiFetch("/postulaciones/");
        postulaciones = normalizarLista(respuesta).filter(
            (postulacion) =>
                String(postulacion.id_estudiante) ===
                String(estudiante.id_estudiante)
        );
    } catch (error) {
        console.error("Error al cargar el historial de postulaciones:", error);
        errorPostulaciones =
            "No fue posible cargar tu historial de postulaciones. Intenta nuevamente.";
    } finally {
        cargandoPostulaciones = false;
    }
}

onMount(async () => {
    fechaPostulacion = obtenerFechaActual();

    const usuarioGuardado = sessionStorage.getItem("usuario");

    if (!usuarioGuardado) {
        await goto("/Login");
        return;
    }

    try {
        usuario = JSON.parse(usuarioGuardado);

        if (!usuario?.cedula) {
            mostrarMensaje(
                "No se encontró la cédula del usuario. Cierra sesión e inicia sesión nuevamente."
            );
            return;
        }

        // Buscar el estudiante asociado a la cédula del usuario.
        estudiante = await apiFetch(
            `/estudiantes/documento/${encodeURIComponent(usuario.cedula)}`
        );

        if (!estudiante?.id_estudiante) {
            estudiante = null;
            mostrarMensaje(
                "Debes actualizar tus datos de estudiante antes de postularte.",
                "warning"
            );
            return;
        }

        await cargarPostulaciones();

        // Consultar las convocatorias.
        cargandoConvocatorias = true;

        const respuesta = await apiFetch("/convocatorias/");

        convocatorias = Array.isArray(respuesta) ? respuesta : [];

        if (convocatorias.length === 0) {
            mostrarMensaje(
                "No hay convocatorias disponibles para seleccionar.",
                "warning"
            );
        }
    } catch (error) {
        console.error("Error al validar los datos:", error);

        estudiante = null;

        mostrarMensaje(
            "No fue posible validar tus datos o consultar las convocatorias. Intenta nuevamente."
        );
    } finally {
        validandoEstudiante = false;
        cargandoConvocatorias = false;
    }
});

async function registrarPostulacion(event) {
    event.preventDefault();
    mensaje = "";

    if (!estudiante?.id_estudiante) {
        mostrarMensaje(
            "Debes actualizar tus datos de estudiante antes de postularte."
        );
        return;
    }

    if (!idConvocatoria) {
        mostrarMensaje("Debes seleccionar una convocatoria.");
        return;
    }

    if (!fechaPostulacion) {
        mostrarMensaje("No se pudo establecer la fecha de postulación.");
        return;
    }

    const convocatoriaSeleccionada = convocatorias.find(
        (convocatoria) =>
            String(convocatoria.id_convocatoria) ===
            String(idConvocatoria)
    );

    if (!convocatoriaSeleccionada) {
        mostrarMensaje("La convocatoria seleccionada no es válida.");
        return;
    }

    guardando = true;

    try {
        const nuevaPostulacion = {
            id_estudiante: estudiante.id_estudiante,
            id_convocatoria: Number(idConvocatoria),
            fecha_postulacion: new Date().toISOString(),
            observaciones: observaciones.trim() || null,
            adjuntos: null
        };

        // El backend asigna estado y escala inicial.
        await apiFetch("/postulaciones/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevaPostulacion)
        });

        mostrarMensaje(
            "La postulación se registró correctamente.",
            "success"
        );

        await cargarPostulaciones();

        idConvocatoria = "";
        fechaPostulacion = obtenerFechaActual();
        observaciones = "";
    } catch (error) {
        console.error("Error al registrar la postulación:", error);

        mostrarMensaje(
            error?.message ??
            "No fue posible registrar la postulación. Intenta nuevamente."
        );
    } finally {
        guardando = false;
    }
}