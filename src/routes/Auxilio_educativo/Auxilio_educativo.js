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

const URL_AUXILIOS = "/auxilio_educativo/";
const URL_FACULTADES = "/facultad/";

let auxilios = $state([]);
let facultades = $state([]);

let cargando = $state(false);
let guardando = $state(false);
let procesando = $state(false);

let editando = $state(false);
let idEditando = $state(null);

let idFacultad = $state("");
let nombre = $state("");
let descripcion = $state("");
let tipoAuxilio = $state("");
let porcentajeMaximo = $state("0");
let montoMaximo = $state("0");
let estado = $state(true);

let mensaje = $state("");
let tipoMensaje = $state("success");

onMount(() => {
    cargarDatos();
});

function extraerLista(respuesta, propiedadAlternativa) {
    if (Array.isArray(respuesta)) return respuesta;
    if (Array.isArray(respuesta?.data)) return respuesta.data;
    if (Array.isArray(respuesta?.items)) return respuesta.items;
    if (Array.isArray(respuesta?.[propiedadAlternativa])) {
        return respuesta[propiedadAlternativa];
    }
    return [];
}

async function cargarDatos() {
    cargando = true;

    try {
        const [respuestaAuxilios, respuestaFacultades] =
            await Promise.all([
                apiFetch(URL_AUXILIOS),
                apiFetch(URL_FACULTADES)
            ]);

        auxilios = extraerLista(
            respuestaAuxilios,
            "auxilios"
        );

        facultades = extraerLista(
            respuestaFacultades,
            "facultades"
        );
    } catch (error) {
        mostrarMensaje(
            "No fue posible cargar los auxilios o las facultades.",
            "danger"
        );
        console.error("Error al cargar datos:", error);
    } finally {
        cargando = false;
    }
}

function mostrarMensaje(texto, tipo = "success") {
    mensaje = texto;
    tipoMensaje = tipo;
}

function limpiarFormulario() {
    idFacultad = "";
    nombre = "";
    descripcion = "";
    tipoAuxilio = "";
    porcentajeMaximo = "0";
    montoMaximo = "0";
    estado = true;

    editando = false;
    idEditando = null;
    mensaje = "";
}

function editarAuxilio(auxilio) {
    idEditando = auxilio.id_auxilio;
    idFacultad = String(auxilio.id_facultad ?? "");
    nombre = auxilio.nombre ?? "";
    descripcion = auxilio.descripcion ?? "";
    tipoAuxilio = auxilio.tipo_auxilio ?? "";
    porcentajeMaximo = String(
        auxilio.porcentaje_maximo ?? 0
    );
    montoMaximo = String(auxilio.monto_maximo ?? 0);
    estado = auxilio.estado ?? true;

    editando = true;
    mensaje = "";

    document
        .getElementById("formulario-auxilio")
        ?.scrollIntoView({ behavior: "smooth" });
}

async function guardarAuxilio(event) {
    event.preventDefault();

    if (
        !idFacultad ||
        !nombre.trim() ||
        !descripcion.trim() ||
        !tipoAuxilio
    ) {
        mostrarMensaje(
            "Completa todos los campos obligatorios.",
            "warning"
        );
        return;
    }

    const porcentaje = Number(porcentajeMaximo);
    const monto = Number(montoMaximo);

    if (
        !Number.isFinite(porcentaje) ||
        porcentaje < 0 ||
        porcentaje > 100
    ) {
        mostrarMensaje(
            "El porcentaje máximo debe estar entre 0 y 100.",
            "warning"
        );
        return;
    }

    if (!Number.isFinite(monto) || monto < 0) {
        mostrarMensaje(
            "El monto máximo debe ser un número igual o mayor que cero.",
            "warning"
        );
        return;
    }

    const payload = {
        id_facultad: Number(idFacultad),
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        porcentaje_maximo: porcentaje,
        monto_maximo: monto,
        estado,
        tipo_auxilio: tipoAuxilio
    };

    guardando = true;
    mensaje = "";

    try {
        if (editando) {
            await apiFetch(
                `${URL_AUXILIOS}${encodeURIComponent(idEditando)}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            mostrarMensaje(
                "Auxilio educativo actualizado correctamente."
            );
        } else {
            await apiFetch(URL_AUXILIOS, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            mostrarMensaje(
                "Auxilio educativo registrado correctamente."
            );
        }

        limpiarFormulario();
        await cargarDatos();
    } catch (error) {
        console.error("Error al guardar auxilio:", error);
        mostrarMensaje(
            error?.message ||
                "Ocurrió un error al guardar el auxilio educativo.",
            "danger"
        );
    } finally {
        guardando = false;
    }
}

async function cambiarEstado(auxilio) {
    const id = auxilio.id_auxilio;

    if (id == null) {
        mostrarMensaje(
            "No se encontró el ID del auxilio.",
            "danger"
        );
        return;
    }

    procesando = true;
    mensaje = "";

    const payload = {
        id_facultad: Number(auxilio.id_facultad),
        nombre: auxilio.nombre,
        descripcion: auxilio.descripcion,
        porcentaje_maximo: Number(auxilio.porcentaje_maximo),
        monto_maximo: Number(auxilio.monto_maximo),
        estado: !auxilio.estado,
        tipo_auxilio: auxilio.tipo_auxilio
    };

    try {
        await apiFetch(
            `${URL_AUXILIOS}${encodeURIComponent(id)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        mostrarMensaje(
            `Auxilio ${
                payload.estado ? "activado" : "desactivado"
            } correctamente.`
        );

        await cargarDatos();
    } catch (error) {
        console.error("Error al cambiar estado:", error);
        mostrarMensaje(
            error?.message ||
                "No fue posible cambiar el estado del auxilio.",
            "danger"
        );
    } finally {
        procesando = false;
    }
}

function obtenerNombreFacultad(id) {
    const facultad = facultades.find(
        f => Number(f.id_facultad ?? f.id) === Number(id)
    );

    return (
        facultad?.nombre ??
        facultad?.nombre_facultad ??
        "Sin facultad"
    );
}

function formatoMoneda(valor) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 2
    }).format(Number(valor ?? 0));
}

const columnasAuxilios = [
    {
        key: "nombre",
        label: "Nombre"
    },
    {
        key: "id_facultad",
        label: "Facultad",
        value: fila => obtenerNombreFacultad(fila.id_facultad)
    },
    {
        key: "tipo_auxilio",
        label: "Tipo"
    },
    {
        key: "porcentaje_maximo",
        label: "% máximo",
        value: fila => `${fila.porcentaje_maximo ?? 0}%`
    },
    {
        key: "monto_maximo",
        label: "Monto máximo",
        value: fila => formatoMoneda(fila.monto_maximo)
    },
    {
        key: "estado",
        label: "Estado",
        type: "status"
    }
];

const accionesAuxilios = [
    {
        label: "Editar",
        icon: "bi bi-pencil-square",
        className: "btn btn-sm btn-warning",
        title: "Editar auxilio educativo",
        onClick: editarAuxilio,
        disabled: () => guardando || procesando
    },
    {
        label: "Cambiar estado",
        icon: "bi bi-arrow-repeat",
        className: "btn btn-sm btn-secondary",
        title: "Activar o desactivar auxilio",
        onClick: cambiarEstado,
        disabled: () => guardando || procesando
    }
];