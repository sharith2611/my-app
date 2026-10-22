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

const URL_FACULTADES = "/facultad";
const URL_PROGRAMA = "/programas";

let facultades = $state([]);
let programas = $state([]);

let idPrograma = $state(null);
let idFacultad = $state("");
let nombre = $state("");
let nivel = $state("");
let modalidad = $state("");
let estado = $state("true");

let cargando = $state(false);
let guardando = $state(false);
let procesando = $state(null);
let editando = $state(false);

let mensaje = $state("");
let tipoMensaje = $state("success");

onMount(cargarDatos);

async function cargarDatos() {
    cargando = true;
    try {
        await Promise.all([
            cargarFacultades(),
            cargarProgramas()
        ]);
    } catch (error) {
        mostrarMensaje("Error al cargar: " + error.message, "danger");
    } finally {
        cargando = false;
    }
}

async function cargarFacultades() {
    const datos = await apiFetch(URL_FACULTADES);
    facultades = Array.isArray(datos)
        ? datos
        : datos?.items ?? datos?.facultades ?? [];
}

async function cargarProgramas() {
    const datos = await apiFetch(URL_PROGRAMA);
    programas = Array.isArray(datos)
        ? datos
        : datos?.items ?? datos?.programas ?? [];
}

function mostrarMensaje(texto, tipo = "success") {
    mensaje = texto;
    tipoMensaje = tipo;
}

function obtenerIdFacultad(facultad) {
    return facultad.id_facultad ?? facultad.id;
}

function obtenerIdPrograma(programa) {
    return programa.id_programa ?? programa.id;
}

function obtenerNombreFacultad(id) {
    const facultad = facultades.find(
        f => Number(obtenerIdFacultad(f)) === Number(id)
    );
    return facultad?.nombre ?? `Facultad #${id ?? "—"}`;
}

function limpiarFormulario() {
    idPrograma = null;
    idFacultad = "";
    nombre = "";
    nivel = "";
    modalidad = "";
    estado = "true";
    editando = false;
}

async function guardarPrograma(event) {
    event.preventDefault();
    if (guardando) return;

    if (!idFacultad || !nombre.trim() || !nivel || !modalidad) {
        mostrarMensaje("Completa todos los campos obligatorios.", "warning");
        return;
    }

    const datos = {
        id_facultad: Number(idFacultad),
        nombre: nombre.trim(),
        nivel,
        modalidad,
        estado: estado === "true"
    };

    guardando = true;
    mensaje = "";

    try {
        if (editando) {
            await apiFetch(`${URL_PROGRAMA}/${idPrograma}`, {
                method: "PUT",
                body: JSON.stringify(datos)
            });
            mostrarMensaje("Programa actualizado correctamente.");
        } else {
            await apiFetch(URL_PROGRAMA, {
                method: "POST",
                body: JSON.stringify(datos)
            });
            mostrarMensaje("Programa registrado correctamente.");
        }

        limpiarFormulario();
        await cargarProgramas();
    } catch (error) {
        mostrarMensaje("No fue posible guardar: " + error.message, "danger");
    } finally {
        guardando = false;
    }
}

function editarPrograma(programa) {
    const id = obtenerIdPrograma(programa);

    if (id == null) {
        mostrarMensaje("No se encontró el ID del programa.", "danger");
        return;
    }

    idPrograma = id;
    idFacultad = String(programa.id_facultad ?? "");
    nombre = programa.nombre ?? "";
    nivel = programa.nivel ?? "";
    modalidad = programa.modalidad ?? "";
    estado = programa.estado === false ? "false" : "true";

    editando = true;
    mensaje = "";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Baja lógica: actualiza estado a false.
async function eliminarPrograma(programa) {
    const id = obtenerIdPrograma(programa);
    if (id == null || procesando !== null) return;

    if (programa.estado === false) {
        mostrarMensaje("El programa ya está inactivo.", "warning");
        return;
    }

    if (!window.confirm(`¿Deseas desactivar "${programa.nombre}"?`)) return;

    procesando = id;
    try {
        await apiFetch(`${URL_PROGRAMA}/${id}`, {
            method: "PUT",
            body: JSON.stringify({
                id_facultad: Number(programa.id_facultad),
                nombre: programa.nombre,
                nivel: programa.nivel,
                modalidad: programa.modalidad,
                estado: false
            })
        });

        if (Number(idPrograma) === Number(id)) limpiarFormulario();

        await cargarProgramas();
        mostrarMensaje("Programa desactivado correctamente.");
    } catch (error) {
        mostrarMensaje("Error al desactivar: " + error.message, "danger");
    } finally {
        procesando = null;
    }
}

async function cambiarEstado(programa) {
    const id = obtenerIdPrograma(programa);
    if (id == null || procesando !== null) return;

    const nuevoEstado = programa.estado === false;
    const accion = nuevoEstado ? "activar" : "desactivar";

    if (!window.confirm(`¿Deseas ${accion} "${programa.nombre}"?`)) return;

    procesando = id;
    try {
        await apiFetch(`${URL_PROGRAMA}/${id}`, {
            method: "PUT",
            body: JSON.stringify({
                id_facultad: Number(programa.id_facultad),
                nombre: programa.nombre,
                nivel: programa.nivel,
                modalidad: programa.modalidad,
                estado: nuevoEstado
            })
        });

        await cargarProgramas();
        mostrarMensaje(`Programa ${nuevoEstado ? "activado" : "desactivado"} correctamente.`);
    } catch (error) {
        mostrarMensaje("Error al cambiar estado: " + error.message, "danger");
    } finally {
        procesando = null;
    }
}