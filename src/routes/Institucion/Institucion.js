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

let instituciones = $state([]);

let nombre = $state("");
let direccion = $state("");
let telefono = $state("");
let correo = $state("");
let estado = $state("true");

let idEditando = $state(null);
let cargando = $state(false);
let guardando = $state(false);
let cambiandoEstadoId = $state(null);

let mensaje = $state("");
let tipoMensaje = $state("info");

function estadoEsActivo(valor) {
    return valor === true ||
        valor === 1 ||
        String(valor).toLowerCase() === "true" ||
        String(valor) === "1" ||
        String(valor).toLowerCase() === "activo";
}

function mostrarMensaje(texto, tipo = "info") {
    mensaje = texto;
    tipoMensaje = tipo;
}

async function cargarInstituciones() {
    cargando = true;

    try {
        const respuesta = await apiFetch("/instituciones/");
        instituciones = Array.isArray(respuesta)
            ? respuesta
            : respuesta?.instituciones ?? [];
    } catch (error) {
        mostrarMensaje(
            error?.message || "No fue posible cargar las instituciones.",
            "danger"
        );
    } finally {
        cargando = false;
    }
}

function limpiarFormulario() {
    nombre = "";
    direccion = "";
    telefono = "";
    correo = "";
    estado = "true";
    idEditando = null;
}

async function guardarInstitucion(event) {
    event.preventDefault();
    mensaje = "";

    if (
        !nombre.trim() ||
        !direccion.trim() ||
        !telefono.trim() ||
        !correo.trim()
    ) {
        mostrarMensaje(
            "Complete todos los campos obligatorios.",
            "warning"
        );
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
        mostrarMensaje("Ingrese un correo electrónico válido.", "warning");
        return;
    }

    const datos = {
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        telefono: telefono.trim(),
        email: correo.trim(),
        estado: estado === "true"
    };

    guardando = true;

    try {
        if (idEditando !== null) {
            await apiFetch(
                `/instituciones/${encodeURIComponent(idEditando)}`,
                {
                    method: "PUT",
                    body: JSON.stringify(datos)
                }
            );

            mostrarMensaje(
                "Institución actualizada correctamente.",
                "success"
            );
        } else {
            await apiFetch("/instituciones/", {
                method: "POST",
                body: JSON.stringify(datos)
            });

            mostrarMensaje(
                "Institución registrada correctamente.",
                "success"
            );
        }

        limpiarFormulario();
        await cargarInstituciones();
    } catch (error) {
        mostrarMensaje(
            error?.message || "Ocurrió un error al guardar la institución.",
            "danger"
        );
    } finally {
        guardando = false;
    }
}

function editarInstitucion(institucion) {
    idEditando = institucion.id_institucion;
    nombre = institucion.nombre ?? "";
    direccion = institucion.direccion ?? "";
    telefono = institucion.telefono ?? "";
    correo = institucion.email ?? "";
    estado = estadoEsActivo(institucion.estado) ? "true" : "false";

    mensaje = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function cambiarEstado(institucion) {
    const id = institucion.id_institucion;

    if (id == null) {
        mostrarMensaje(
            "No se encontró el identificador de la institución.",
            "danger"
        );
        return;
    }

    const activoActual = estadoEsActivo(institucion.estado);
    const nuevoEstado = !activoActual;
    const accion = nuevoEstado ? "activar" : "desactivar";

    const confirmar = window.confirm(
        `¿Está seguro de ${accion} la institución "${institucion.nombre}"?`
    );

    if (!confirmar) return;

    cambiandoEstadoId = id;
    mensaje = "";

    const datos = {
        nombre: institucion.nombre,
        direccion: institucion.direccion,
        telefono: institucion.telefono,
        email: institucion.email,
        estado: nuevoEstado
    };

    try {
        await apiFetch(
            `/instituciones/${encodeURIComponent(id)}`,
            {
                method: "PUT",
                body: JSON.stringify(datos)
            }
        );

        mostrarMensaje(
            `Institución ${nuevoEstado ? "activada" : "desactivada"} correctamente.`,
            "success"
        );

        if (idEditando === id) {
            limpiarFormulario();
        }

        await cargarInstituciones();
    } catch (error) {
        mostrarMensaje(
            error?.message ||
                "No fue posible cambiar el estado de la institución.",
            "danger"
        );
    } finally {
        cambiandoEstadoId = null;
    }
}

const columnasInstituciones = [
    {
        key: "id_institucion",
        label: "ID",
        sortable: true
    },
    {
        key: "nombre",
        label: "Nombre",
        sortable: true
    },
    {
        key: "direccion",
        label: "Dirección",
        sortable: true
    },
    {
        key: "telefono",
        label: "Teléfono",
        sortable: true
    },
    {
        key: "email",
        label: "Correo electrónico",
        sortable: true
    },
    {
        key: "estado",
        label: "Estado",
        type: "status",
        value: (institucion) => estadoEsActivo(institucion.estado),
        trueLabel: "Activo",
        falseLabel: "Inactivo",
        trueClass: "bg-success",
        falseClass: "bg-secondary",
        sortable: true
    }
];

const accionesInstituciones = [
    {
        label: "Editar",
        icon: "bi bi-pencil-square",
        className: "btn btn-sm btn-warning",
        title: "Editar institución",
        onClick: editarInstitucion,
        disabled: () => guardando || cambiandoEstadoId !== null
    },
    {
        label: "Cambiar estado",
        icon: "bi bi-arrow-repeat",
        className: "btn btn-sm btn-outline-primary",
        title: "Activar o desactivar institución",
        onClick: cambiarEstado,
        disabled: () => guardando || cambiandoEstadoId !== null
    }
];

onMount(() => {
    cargarInstituciones();
});