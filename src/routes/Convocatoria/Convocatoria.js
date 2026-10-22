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
import RequisitosConvocatoria from "../Requisito_convocatoria/+page.svelte";
import { apiFetch } from "$lib/api.js";

const URL_CONVOCATORIAS = "/convocatorias";
const URL_AUXILIOS = "/auxilio_educativo";

let convocatorias = $state([]);
let auxilios = $state([]);

let idConvocatoria = $state(null);
let idAuxilio = $state("");
let nombre = $state("");
let fechaInicio = $state("");
let fechaFin = $state("");
let cupos = $state("");
let estado = $state("true");

let cargando = $state(false);
let guardando = $state(false);
let procesando = $state(null);
let editando = $state(false);

let mensaje = $state("");
let tipoMensaje = $state("success");
let filtroEstado = $state("todos");

// Estado del componente de requisitos
let mostrarComponenteRequisitos = $state(false);
let convocatoriaSeleccionada = $state(null);

onMount(cargarDatos);

async function cargarDatos() {
    cargando = true;

    try {
        await Promise.all([
            cargarConvocatorias(),
            cargarAuxilios()
        ]);
    } catch (error) {
        mostrarMensaje(
            "Error al cargar los datos: " + error.message,
            "danger"
        );
    } finally {
        cargando = false;
    }
}

async function cargarConvocatorias() {
    const datos = await apiFetch(URL_CONVOCATORIAS);

    convocatorias = Array.isArray(datos)
        ? datos
        : datos?.items ?? datos?.convocatorias ?? [];
}

async function cargarAuxilios() {
    const datos = await apiFetch(URL_AUXILIOS);

    auxilios = Array.isArray(datos)
        ? datos
        : datos?.items ?? datos?.auxilios ?? [];
}

function mostrarMensaje(texto, tipo = "success") {
    mensaje = texto;
    tipoMensaje = tipo;
}

function obtenerIdConvocatoria(convocatoria) {
    return convocatoria.id_convocatoria ?? convocatoria.id;
}

function obtenerIdAuxilio(auxilio) {
    return auxilio.id_auxilio ?? auxilio.id;
}

function estadoEsActivo(valor) {
    return valor === true ||
        valor === 1 ||
        String(valor).toLowerCase() === "true" ||
        String(valor) === "1" ||
        String(valor).toLowerCase() === "activo";
}

function obtenerNombreAuxilio(id) {
    const encontrado = auxilios.find(
        item => Number(obtenerIdAuxilio(item)) === Number(id)
    );

    return encontrado?.nombre ?? `Auxilio #${id ?? "—"}`;
}

function limpiarFormulario() {
    idConvocatoria = null;
    idAuxilio = "";
    nombre = "";
    fechaInicio = "";
    fechaFin = "";
    cupos = "";
    estado = "true";
    editando = false;
}

async function guardarConvocatoria(event) {
    event.preventDefault();

    if (guardando || procesando !== null) return;

    if (
        !idAuxilio ||
        !nombre.trim() ||
        !fechaInicio ||
        !fechaFin ||
        cupos === "" ||
        !Number.isInteger(Number(cupos)) ||
        Number(cupos) < 1
    ) {
        mostrarMensaje(
            "Completa todos los campos obligatorios y verifica los cupos.",
            "warning"
        );
        return;
    }

    if (fechaFin < fechaInicio) {
        mostrarMensaje(
            "La fecha final no puede ser anterior a la fecha inicial.",
            "warning"
        );
        return;
    }

    const datos = {
        id_auxilio: Number(idAuxilio),
        nombre: nombre.trim(),
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        cupos: Number(cupos),
        estado: estado === "true"
    };

    guardando = true;
    mensaje = "";

    try {
        if (editando) {
            await apiFetch(
                `${URL_CONVOCATORIAS}/${encodeURIComponent(idConvocatoria)}`,
                {
                    method: "PUT",
                    body: JSON.stringify(datos)
                }
            );

            mostrarMensaje(
                "Convocatoria actualizada correctamente.",
                "success"
            );
        } else {
            await apiFetch(URL_CONVOCATORIAS, {
                method: "POST",
                body: JSON.stringify(datos)
            });

            mostrarMensaje(
                "Convocatoria registrada correctamente.",
                "success"
            );
        }

        limpiarFormulario();
        await cargarConvocatorias();
    } catch (error) {
        mostrarMensaje(
            "No fue posible guardar: " + error.message,
            "danger"
        );
    } finally {
        guardando = false;
    }
}

function editarConvocatoria(convocatoria) {
    const id = obtenerIdConvocatoria(convocatoria);

    if (id == null) {
        mostrarMensaje(
            "No se encontró el ID de la convocatoria.",
            "danger"
        );
        return;
    }

    idConvocatoria = id;
    idAuxilio = String(convocatoria.id_auxilio ?? "");
    nombre = convocatoria.nombre ?? "";
    fechaInicio = String(convocatoria.fecha_inicio ?? "").slice(0, 10);
    fechaFin = String(convocatoria.fecha_fin ?? "").slice(0, 10);
    cupos = String(convocatoria.cupos ?? "");
    estado = estadoEsActivo(convocatoria.estado) ? "true" : "false";

    editando = true;
    mensaje = "";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function cambiarEstado(convocatoria, forzarEstado = null) {
    const id = obtenerIdConvocatoria(convocatoria);

    if (id == null || procesando !== null || guardando) return;

    const activoActual = estadoEsActivo(convocatoria.estado);
    const nuevoEstado = forzarEstado ?? !activoActual;
    const accion = nuevoEstado ? "activar" : "desactivar";

    if (!window.confirm(
        `¿Deseas ${accion} la convocatoria "${convocatoria.nombre}"?`
    )) {
        return;
    }

    procesando = id;
    mensaje = "";

    try {
        const datos = {
            id_auxilio: Number(convocatoria.id_auxilio),
            nombre: convocatoria.nombre,
            fecha_inicio: String(convocatoria.fecha_inicio ?? "").slice(0, 10),
            fecha_fin: String(convocatoria.fecha_fin ?? "").slice(0, 10),
            cupos: Number(convocatoria.cupos),
            estado: nuevoEstado
        };

        await apiFetch(
            `${URL_CONVOCATORIAS}/${encodeURIComponent(id)}`,
            {
                method: "PUT",
                body: JSON.stringify(datos)
            }
        );

        if (Number(idConvocatoria) === Number(id)) {
            limpiarFormulario();
        }

        await cargarConvocatorias();

        mostrarMensaje(
            `Convocatoria ${nuevoEstado ? "activada" : "desactivada"} correctamente.`,
            "success"
        );
    } catch (error) {
        mostrarMensaje(
            "No fue posible cambiar el estado: " + error.message,
            "danger"
        );
    } finally {
        procesando = null;
    }
}

async function eliminarConvocatoria(convocatoria) {
    if (!estadoEsActivo(convocatoria.estado)) {
        mostrarMensaje(
            "La convocatoria ya está inactiva.",
            "warning"
        );
        return;
    }

    // No elimina el registro: únicamente lo desactiva.
    await cambiarEstado(convocatoria, false);
}

function abrirRequisitos(convocatoria) {
const id = convocatoria.id_convocatoria ?? convocatoria.id;

if (id == null) {
    mostrarMensaje(
        "No se encontró el ID de la convocatoria seleccionada.",
        "danger"
    );
    return;
}

convocatoriaSeleccionada = {
    ...convocatoria,
    id_convocatoria: Number(id),
    nombre: convocatoria.nombre ?? convocatoria.nombre_convocatoria ?? ""
};

mostrarComponenteRequisitos = true;
mensaje = "";
}

function cerrarRequisitos() {
    mostrarComponenteRequisitos = false;
    convocatoriaSeleccionada = null;
}

let convocatoriasFiltradas = $derived(
    convocatorias.filter(convocatoria => {
        const activo = estadoEsActivo(convocatoria.estado);

        return filtroEstado === "todos" ||
            (filtroEstado === "activas" && activo) ||
            (filtroEstado === "inactivas" && !activo);
    })
);

const columnasConvocatorias = [
    {
        key: "nombre",
        label: "Convocatoria",
        sortable: true
    },
    {
        key: "id_auxilio",
        label: "Auxilio educativo",
        value: convocatoria =>
            obtenerNombreAuxilio(convocatoria.id_auxilio),
        sortable: true
    },
    {
        key: "fecha_inicio",
        label: "Fecha de inicio",
        value: convocatoria =>
            String(convocatoria.fecha_inicio ?? "").slice(0, 10) || "—",
        sortable: true
    },
    {
        key: "fecha_fin",
        label: "Fecha de finalización",
        value: convocatoria =>
            String(convocatoria.fecha_fin ?? "").slice(0, 10) || "—",
        sortable: true
    },
    {
        key: "cupos",
        label: "Cupos",
        sortable: true
    },
    {
        key: "estado",
        label: "Estado",
        type: "status",
        value: convocatoria =>
            estadoEsActivo(convocatoria.estado),
        trueLabel: "Activa",
        falseLabel: "Inactiva",
        trueClass: "bg-success",
        falseClass: "bg-secondary",
        sortable: true
    }
];

const accionesConvocatorias = [
    {
        label: "Editar",
        icon: "bi bi-pencil-square",
        className: "btn btn-sm btn-warning",
        title: "Editar convocatoria",
        onClick: editarConvocatoria,
        disabled: () => guardando || procesando !== null
    },
    {
        label: "Requisitos convocatoria",
        icon: "bi bi-card-checklist",
        className: "btn btn-sm btn-info",
        title: "Gestionar requisitos de la convocatoria",
        onClick: abrirRequisitos,
        disabled: () => guardando || procesando !== null
    },
    {
        label: "Cambiar estado",
        icon: "bi bi-arrow-repeat",
        className: "btn btn-sm btn-outline-primary",
        title: "Activar o desactivar convocatoria",
        onClick: cambiarEstado,
        disabled: () => guardando || procesando !== null
    }
];