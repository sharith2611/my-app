import { onMount } from "svelte";
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

const URL_ADJUDICACIONES = "/adjudicaciones/";
const URL_POSTULACIONES = "/postulaciones/";

let adjudicaciones = $state([]);
let postulaciones = $state([]);

let cargando = $state(true);
let cargandoPostulaciones = $state(false);
let guardando = $state(false);
let editando = $state(false);

let idAdjudicacion = $state(null);
let idPostulacion = $state("");
let fechaAdjudicacion = $state("");
let resultado = $state("");
let porcentajeAprobado = $state("");
let montoAprobado = $state("");
let observaciones = $state("");
let estado = $state(true);

let mensaje = $state("");
let tipoMensaje = $state("danger");

function fechaActual() {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}

function mostrarMensaje(texto, tipo = "danger") {
    mensaje = texto;
    tipoMensaje = tipo;
}

function normalizarLista(respuesta) {
    if (Array.isArray(respuesta)) {
        return respuesta;
    }

    if (Array.isArray(respuesta?.items)) {
        return respuesta.items;
    }

    return [];
}

function obtenerNombrePostulacion(postulacion) {
    const estudiante = [
        postulacion.nombres,
        postulacion.apellidos
    ].filter(Boolean).join(" ");

    const convocatoria =
        postulacion.nombre_convocatoria ??
        postulacion.convocatoria ??
        "";

    const detalle = [estudiante, convocatoria]
        .filter(Boolean)
        .join(" - ");

    return detalle
        ? `Postulación ${postulacion.id_postulacion} — ${detalle}`
        : `Postulación ${postulacion.id_postulacion}`;
}

function formatearFecha(fecha) {
    if (!fecha) return "—";

    const texto = String(fecha).slice(0, 10);
    const partes = texto.split("-");

    if (partes.length !== 3) return texto;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatearMonto(valor) {
    if (valor === null || valor === undefined || valor === "") {
        return "—";
    }

    return Number(valor).toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 2
    });
}

function estadoActivo(valor) {
    return valor === true || valor === "true" || valor === 1;
}

const columnasAdjudicaciones = [
    {
            key: "postulacion",
        label: "Postulación",
        value: (fila) => {
            const postulacion = postulaciones.find(
                (p) =>
                    Number(p.id_postulacion) ===
                    Number(fila.id_postulacion)
            );

            return postulacion
                ? obtenerNombrePostulacion(postulacion)
                : `Postulación ${fila.id_postulacion}`;
        },
        sortable: true
    },
    {
        key: "fecha_adjudicacion",
        label: "Fecha",
        value: (fila) =>
            formatearFecha(fila.fecha_adjudicacion),
        sortable: true
    },
    {
        key: "resultado",
        label: "Resultado",
        sortable: true
    },
    {
        key: "porcentaje_aprobado",
        label: "Porcentaje aprobado",
        value: (fila) =>
            fila.porcentaje_aprobado == null
                ? "—"
                : `${fila.porcentaje_aprobado}%`
    },
    {
        key: "monto_aprobado",
        label: "Monto aprobado",
        value: (fila) =>
            formatearMonto(fila.monto_aprobado)
    },
    {
        key: "estado",
        label: "Estado del registro",
        type: "status",
        trueLabel: "Activo",
        falseLabel: "Inactivo"
    }
];

const accionesAdjudicaciones = [
    {
        label: "Editar",
        icon: "pencil",
        className: "btn btn-sm btn-warning",
        title: "Editar adjudicación",
        onClick: (fila) => cargarEdicion(fila)
    },
    {
        label: "Cambiar estado",
        icon: "arrow-left-right",
        className: "btn btn-sm btn-outline-primary",
        title: "Activar o desactivar adjudicación",
        onClick: (fila) => cambiarEstado(fila)
    }
];

async function cargarAdjudicaciones() {
    const respuesta = await apiFetch(URL_ADJUDICACIONES);
    adjudicaciones = normalizarLista(respuesta);
}

async function cargarPostulaciones() {
    cargandoPostulaciones = true;

    try {
        const respuesta = await apiFetch(URL_POSTULACIONES);
        const lista = normalizarLista(respuesta);

        // Coincidencia exacta: solamente "Pendiente".
        postulaciones = lista.filter(
            (fila) => fila.escala === "Pendiente"
        );
    } catch (error) {
        console.error(
            "Error al consultar postulaciones:",
            error
        );

        mostrarMensaje(
            "No fue posible cargar las postulaciones pendientes."
        );
    } finally {
        cargandoPostulaciones = false;
    }
}

async function actualizarEscalaPostulacion(idPostulacionSeleccionada, nuevoResultado) {
    // Consultar todas las postulaciones, incluso si su escala ya cambió.
    const respuesta = await apiFetch(URL_POSTULACIONES);
    const lista = normalizarLista(respuesta);

    // IMPORTANTE: buscar exclusivamente por id_postulacion.
    const postulacion = lista.find(
        (fila) =>
            Number(fila.id_postulacion) === Number(idPostulacionSeleccionada)
    );

    if (!postulacion) {
        throw new Error(
            `No se encontró la postulación con ID ${idPostulacionSeleccionada}.`
        );
    }

    // Enviar el registro completo y modificar únicamente la escala.
    const datosPostulacion = {
        ...postulacion,
        escala: nuevoResultado
    };

    // La URL también utiliza el ID de la postulación, nunca el de adjudicación.
    await apiFetch(
        `${URL_POSTULACIONES}${idPostulacionSeleccionada}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datosPostulacion)
        }
    );
}

onMount(async () => {
    fechaAdjudicacion = fechaActual();

    try {
        await Promise.all([
            cargarAdjudicaciones(),
            cargarPostulaciones()
        ]);
    } catch (error) {
        console.error(
            "Error al cargar adjudicaciones:",
            error
        );

        mostrarMensaje(
            "No fue posible consultar la información. Verifica la API."
        );
    } finally {
        cargando = false;
    }
});

function limpiarFormulario() {
    idAdjudicacion = null;
    idPostulacion = "";
    fechaAdjudicacion = fechaActual();
    resultado = "";
    porcentajeAprobado = "";
    montoAprobado = "";
    observaciones = "";
    estado = true;
    editando = false;
}

function cargarEdicion(fila) {
    idAdjudicacion = fila.id_adjudicacion;
    idPostulacion = String(fila.id_postulacion);

    fechaAdjudicacion = fila.fecha_adjudicacion
        ? String(fila.fecha_adjudicacion).slice(0, 10)
        : fechaActual();

    resultado = fila.resultado ?? "";
    porcentajeAprobado = fila.porcentaje_aprobado ?? "";
    montoAprobado = fila.monto_aprobado ?? "";
    observaciones = fila.observaciones ?? "";
    estado = estadoActivo(fila.estado);
    editando = true;
    mensaje = "";

    if (typeof document !== "undefined") {
        document
            .getElementById("formulario-adjudicacion")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
    }
}

async function guardarAdjudicacion(event) {
    event.preventDefault();
    mensaje = "";

    if (!idPostulacion) {
        mostrarMensaje("Debes seleccionar una postulación.");
        return;
    }

    if (!fechaAdjudicacion) {
        mostrarMensaje("Debes indicar la fecha de adjudicación.");
        return;
    }

    if (!resultado) {
        mostrarMensaje("Debes seleccionar un resultado.");
        return;
    }

    if (
        porcentajeAprobado !== "" &&
        (
            !Number.isFinite(Number(porcentajeAprobado)) ||
            Number(porcentajeAprobado) < 0 ||
            Number(porcentajeAprobado) > 100
        )
    ) {
        mostrarMensaje("El porcentaje aprobado debe estar entre 0 y 100.");
        return;
    }

    if (
        montoAprobado !== "" &&
        (
            !Number.isFinite(Number(montoAprobado)) ||
            Number(montoAprobado) < 0
        )
    ) {
        mostrarMensaje("El monto aprobado no puede ser negativo.");
        return;
    }

    // Capturar ambos identificadores antes de realizar cualquier petición.
    // No reutilizar idAdjudicacion para actualizar la postulación.
    const idPostulacionSeleccionada = Number(idPostulacion);
    const idAdjudicacionSeleccionada = idAdjudicacion;
    const estabaEditando = editando;

    if (!estabaEditando) {
        const postulacionExiste = postulaciones.some(
            (fila) =>
                Number(fila.id_postulacion) === idPostulacionSeleccionada
        );

        if (!postulacionExiste) {
            mostrarMensaje(
                "La postulación seleccionada ya no está disponible."
            );
            return;
        }
    }

    const datosAdjudicacion = {
        id_postulacion: idPostulacionSeleccionada,
        fecha_adjudicacion: fechaAdjudicacion,
        resultado,
        porcentaje_aprobado:
            porcentajeAprobado === ""
                ? null
                : Number(porcentajeAprobado),
        monto_aprobado:
            montoAprobado === ""
                ? null
                : Number(montoAprobado),
        observaciones: observaciones.trim() || null,
        estado: estadoActivo(estado)
    };

    guardando = true;
    let adjudicacionGuardada = false;

    try {
        // 1. Guardar la adjudicación usando id_adjudicacion cuando se edita.
        if (estabaEditando) {
            await apiFetch(
                `${URL_ADJUDICACIONES}${idAdjudicacionSeleccionada}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(datosAdjudicacion)
                }
            );
        } else {
            await apiFetch(URL_ADJUDICACIONES, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosAdjudicacion)
            });
        }

        adjudicacionGuardada = true;

        // 2. Actualizar la escala usando id_postulacion, no id_adjudicacion.
        await actualizarEscalaPostulacion(
            idPostulacionSeleccionada,
            resultado
        );

        // 3. Recargar los registros.
        await Promise.all([
            cargarAdjudicaciones(),
            cargarPostulaciones()
        ]);

        // 4. Limpiar y mostrar el mensaje según la operación realizada.
        limpiarFormulario();

        mostrarMensaje(
            estabaEditando
                ? "Adjudicación y escala de la postulación actualizadas correctamente."
                : "Adjudicación registrada y escala de la postulación actualizada correctamente.",
            "success"
        );
    } catch (error) {
        console.error("Error al guardar adjudicación:", error);

        if (adjudicacionGuardada) {
            try {
                await Promise.all([
                    cargarAdjudicaciones(),
                    cargarPostulaciones()
                ]);
            } catch (errorCarga) {
                console.error("Error al recargar los registros:", errorCarga);
            }

            mostrarMensaje(
                "La adjudicación se guardó, pero no se pudo actualizar la escala de la postulación. Revisa el error en la consola antes de volver a registrar."
            );
        } else {
            mostrarMensaje(
                error?.message ?? "No fue posible guardar la adjudicación."
            );
        }
    } finally {
        guardando = false;
    }
}

async function cambiarEstado(fila) {
    const nuevoEstado = !estadoActivo(fila.estado);

    const confirmar = window.confirm(
        `¿Deseas ${
            nuevoEstado ? "activar" : "desactivar"
        } la adjudicación ${fila.id_adjudicacion}?`
    );

    if (!confirmar) return;

    guardando = true;
    mensaje = "";

    const datos = {
        id_postulacion: Number(fila.id_postulacion),
        fecha_adjudicacion: String(
            fila.fecha_adjudicacion
        ).slice(0, 10),
        resultado: fila.resultado,
        porcentaje_aprobado:
            fila.porcentaje_aprobado ?? null,
        monto_aprobado:
            fila.monto_aprobado ?? null,
        observaciones:
            fila.observaciones ?? null,
        estado: nuevoEstado
    };

    try {
        await apiFetch(
            `${URL_ADJUDICACIONES}${fila.id_adjudicacion}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            }
        );

        await cargarAdjudicaciones();

        mostrarMensaje(
            `La adjudicación quedó ${
                nuevoEstado ? "activa" : "inactiva"
            }.`,
            "success"
        );
    } catch (error) {
        console.error(
            "Error al cambiar el estado:",
            error
        );

        mostrarMensaje(
            error?.message ??
            "No fue posible actualizar el estado de la adjudicación."
        );
    } finally {
        guardando = false;
    }
}