import { onMount } from "svelte";
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
import { apiFetch } from "$lib/api.js";

let facultades = $state([]);
let instituciones = $state([]);

let idFacultad = $state(null);
let institucion = $state("");
let nombre = $state("");
let direccion = $state("");
let extension = $state("");
let email = $state("");
let estado = $state("true");

let cargando = $state(false);
let guardando = $state(false);
let cambiandoEstado = $state(null);
let editando = $state(false);

let mensaje = $state("");
let tipoMensaje = $state("success");

const URL_FACULTADES = "/facultad/";
const URL_INSTITUCIONES = "/instituciones/";

onMount(() => {
    cargarDatos();
});

// ==============================
// CARGA DE INFORMACIÓN
// ==============================

async function cargarDatos() {
    cargando = true;

    try {
        await Promise.all([
            cargarInstituciones(),
            cargarFacultades()
        ]);
    } catch (error) {
        mostrarMensaje(
            "No fue posible cargar la información.",
            "danger"
        );
    } finally {
        cargando = false;
    }
}

async function cargarInstituciones() {
    const datos = await apiFetch(URL_INSTITUCIONES);

    instituciones = Array.isArray(datos)
        ? datos
        : datos?.items ?? datos?.instituciones ?? [];
}

async function cargarFacultades() {
    const datos = await apiFetch(URL_FACULTADES);

    facultades = Array.isArray(datos)
        ? datos
        : datos?.items ?? datos?.facultades ?? [];
}

function mostrarMensaje(texto, tipo = "success") {
    mensaje = texto;
    tipoMensaje = tipo;
}



function limpiarFormulario() {
    idFacultad = null;
    institucion = "";
    nombre = "";
    direccion = "";
    extension = "";
    email = "";
    estado = "true";
    editando = false;
}

async function guardarFacultad(event) {
    event.preventDefault();

    if (guardando) return;

    if (
        !institucion ||
        !nombre.trim() ||
        !direccion.trim() ||
        !extension.trim()
    ) {
        mostrarMensaje(
            "Completa todos los campos obligatorios.",
            "warning"
        );
        return;
    }

    if (
        email.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
        mostrarMensaje(
            "Ingresa un correo electrónico válido.",
            "warning"
        );
        return;
    }

    const datos = {
        id_institucion: Number(institucion),
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        Ext: extension.trim(),
        email: email.trim() || null,
        estado: estado === "true"
    };

    guardando = true;
    mensaje = "";

    try {
        if (editando) {
            await apiFetch(
                `${URL_FACULTADES}${idFacultad}`,
                {
                    method: "PUT",
                    body: JSON.stringify(datos)
                }
            );

            mostrarMensaje(
                "Facultad actualizada correctamente."
            );
        } else {
            await apiFetch(URL_FACULTADES, {
                method: "POST",
                body: JSON.stringify(datos)
            });

            mostrarMensaje(
                "Facultad registrada correctamente."
            );
        }

        limpiarFormulario();
        await cargarFacultades();

    } catch (error) {
        mostrarMensaje(
            "No fue posible guardar la facultad.",
            "danger"
        );
    } finally {
        guardando = false;
    }
}

// ==============================
// EDITAR
// ==============================

function editarFacultad(facultad) {
    idFacultad =
        facultad.id_facultad ?? facultad.id;

    if (idFacultad == null) {
        mostrarMensaje(
            "No se encontró el identificador de la facultad.",
            "danger"
        );
        return;
    }

    institucion = String(
        facultad.id_institucion ?? ""
    );

    nombre = facultad.nombre ?? "";
    direccion = facultad.direccion ?? "";

    extension = String(
        facultad.Ext ?? facultad.ext ?? ""
    );

    email = facultad.email ?? "";
    estado = facultad.estado ? "true" : "false";

    editando = true;
    mensaje = "";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==============================
// CAMBIAR ESTADO
// ==============================

async function cambiarEstado(facultad) {
    const id = facultad.id_facultad ?? facultad.id;

    if (id == null) {
        mostrarMensaje(
            "No se encontró el identificador de la facultad.",
            "danger"
        );
        return;
    }

    const estadoActual =
        facultad.estado === true ||
        facultad.estado === "true" ||
        facultad.estado === 1;

    const nuevoEstado = !estadoActual;
    const accion = nuevoEstado ? "activar" : "desactivar";

    if (!confirm(`¿Deseas ${accion} la facultad "${facultad.nombre}"?`)) {
        return;
    }

    // Se actualiza la facultad completa mediante el PUT existente.
    const datos = {
        id_institucion: Number(facultad.id_institucion),
        nombre: facultad.nombre,
        direccion: facultad.direccion,
        Ext: facultad.Ext ?? facultad.ext ?? "",
        email: facultad.email || null,
        estado: nuevoEstado
    };

    cambiandoEstado = id;
    mensaje = "";

    try {
        await apiFetch(`${URL_FACULTADES}${id}`, {
            method: "PUT",
            body: JSON.stringify(datos)
        });

        mostrarMensaje(
            `Facultad ${nuevoEstado ? "activada" : "desactivada"} correctamente.`,
            "success"
        );

        await cargarFacultades();
    } catch (error) {
        console.error("Error al cambiar el estado:", error);
        mostrarMensaje(
            "No fue posible actualizar el estado de la facultad.",
            "danger"
        );
    } finally {
        cambiandoEstado = null;
    }
}

// ==============================
// UTILIDADES
// ==============================

function obtenerNombreInstitucion(id) {
    const encontrada = instituciones.find(
        item =>
            Number(
                item.id_institucion ?? item.id
            ) === Number(id)
    );

    return encontrada?.nombre
        ?? `Institución #${id}`;
}

// ==============================
// CONFIGURACIÓN DATATABLE
// ==============================

const columnasFacultades = [
    {
        key: "id_facultad",
        label: "ID",
        value: fila =>
            fila.id_facultad ?? fila.id
    },
    {
        key: "institucion",
        label: "Institución",
        value: fila =>
            obtenerNombreInstitucion(
                fila.id_institucion
            )
    },
    {
        key: "nombre",
        label: "Facultad"
    },
    {
        key: "direccion",
        label: "Dirección"
    },
    {
        key: "extension",
        label: "Extensión",
        value: fila =>
            fila.Ext ?? fila.ext
    },
    {
        key: "email",
        label: "Correo"
    },
    {
        key: "estado",
        label: "Estado",
        type: "status",
        trueLabel: "Activa",
        falseLabel: "Inactiva"
    }
];

const accionesFacultades = [
    {
        label: "Editar",
        icon: "bi bi-pencil-square",
        className: "btn btn-sm btn-warning",
        title: "Editar facultad",
        onClick: editarFacultad,
        disabled: () =>
            guardando || cambiandoEstado !== null
    },
    {
        label: "Cambiar estado",
        icon: "bi bi-arrow-repeat",
        className: "btn btn-sm btn-outline-primary",
        title: "Activar o desactivar facultad",
        onClick: cambiarEstado,
        disabled: () =>
            guardando || cambiandoEstado !== null
    }
];