import { onMount } from "svelte";
import Navbar from "$lib/Navbar.svelte";
import Footer from "$lib/Footer.svelte";
import DataTable from "$lib/components/DataTable.svelte";
import Accesibilidad from "$lib/components/accesibilidad.svelte";
import Cookies from "$lib/components/cookies.svelte";
import Logo from "$lib/components/logo.svelte";
import RedesSociales from "$lib/components/Redes_sociales.svelte";
import Toast from "$lib/components/toast.svelte";
import VolverArriba from "$lib/components/Volver_arriba.svelte";
import Whatsapp from "$lib/components/Whatsapp.svelte";
import { apiFetch } from "$lib/api.js";

let estudiantes = $state([]);
let programas = $state([]);
let cargando = $state(false);
let guardando = $state(false);
let mensaje = $state("");
let tipoMensaje = $state("success");
let editando = $state(false);
let idEstudiante = $state(null);

let nombres = $state("");
let apellidos = $state("");
let documento = $state("");
let fechaIngreso = $state("");
let correo = $state("");
let telefono = $state("");
let idPrograma = $state("");

const columnasEstudiantes = [
    {
        key: "id_estudiante",
        label: "ID",
        sortable: true
    },
    {
        key: "nombre_completo",
        label: "Nombre completo",
        value: (fila) =>
            `${fila.nombres ?? ""} ${fila.apellidos ?? ""}`.trim(),
        sortable: true
    },
    {
        key: "documento",
        label: "Documento",
        sortable: true
    },
    {
        key: "programa",
        label: "Programa académico",
        value: (fila) => nombrePrograma(fila.id_programa),
        sortable: true
    },
    {
        key: "fecha_ingreso",
        label: "Fecha de ingreso",
        sortable: true
    },
    {
        key: "estado",
        label: "Estado",
        type: "status",
        trueLabel: "Activo",
        falseLabel: "Inactivo"
    }
];

const accionesEstudiantes = [
    {
        label: "Editar",
        icon: "✏️",
        className: "btn btn-sm btn-warning",
        onClick: editarEstudiante
    },
    {
        label: "Eliminar",
        icon: "🗑️",
        className: "btn btn-sm btn-danger",
        onClick: eliminarEstudiante
    }
];

onMount(() => {
    cargarDatos();
});

async function cargarDatos() {
    cargando = true;
    mensaje = "";

    try {
        const [respuestaEstudiantes, respuestaProgramas] =
            await Promise.all([
                apiFetch("/estudiantes/"),
                apiFetch("/programas/")
            ]);

        estudiantes = Array.isArray(respuestaEstudiantes)
            ? respuestaEstudiantes
            : [];

        programas = Array.isArray(respuestaProgramas)
            ? respuestaProgramas
            : [];
    } catch (error) {
        console.error("Error al cargar estudiantes:", error);
        mostrarMensaje(
            "No fue posible cargar los estudiantes o los programas. Verifica la conexión con la API.",
            "danger"
        );
    } finally {
        cargando = false;
    }
}

function nombrePrograma(id) {
    const programa = programas.find(
        (p) => Number(p.id_programa) === Number(id)
    );

    return programa
        ? programa.nombre_programa ?? programa.nombre ?? `Programa ${id}`
        : `Programa ${id}`;
}

function mostrarMensaje(texto, tipo = "success") {
    mensaje = texto;
    tipoMensaje = tipo;
}

function limpiar() {
    nombres = "";
    apellidos = "";
    documento = "";
    fechaIngreso = "";
    correo = "";
    telefono = "";
    idPrograma = "";
    idEstudiante = null;
    editando = false;
    mensaje = "";
}

async function guardarEstudiante(event) {
    event.preventDefault();
    mensaje = "";

    if (
        !nombres.trim() ||
        !apellidos.trim() ||
        !documento.trim() ||
        !fechaIngreso ||
        !idPrograma
    ) {
        mostrarMensaje(
            "Completa los nombres, apellidos, documento, fecha de ingreso y programa académico.",
            "danger"
        );
        return;
    }

    const datos = {
        id_programa: Number(idPrograma),
        documento: documento.trim(),
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        email: correo.trim() || null,
        telefono: telefono.trim() || null,
        fecha_ingreso: fechaIngreso,
        estado: true
    };

    guardando = true;

    try {
        if (editando) {
            await apiFetch(`/estudiantes/${idEstudiante}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            });

            mostrarMensaje("Estudiante actualizado correctamente.");
        } else {
            await apiFetch("/estudiantes/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            });

            mostrarMensaje("Estudiante registrado correctamente.");
        }

        limpiar();
        await cargarDatos();
    } catch (error) {
        console.error("Error al guardar estudiante:", error);
        mostrarMensaje(
            "No fue posible guardar el estudiante. Verifica los datos y la API.",
            "danger"
        );
    } finally {
        guardando = false;
    }
}

function editarEstudiante(estudiante) {
    idEstudiante = estudiante.id_estudiante;
    nombres = estudiante.nombres ?? "";
    apellidos = estudiante.apellidos ?? "";
    documento = estudiante.documento ?? "";
    fechaIngreso = estudiante.fecha_ingreso
        ? String(estudiante.fecha_ingreso).slice(0, 10)
        : "";
    correo = estudiante.email ?? "";
    telefono = estudiante.telefono ?? "";
    idPrograma = String(estudiante.id_programa ?? "");
    editando = true;
    mensaje = "";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

async function eliminarEstudiante(estudiante) {
    const confirmado = confirm(
        `¿Deseas eliminar al estudiante ${estudiante.nombres} ${estudiante.apellidos}?`
    );

    if (!confirmado) return;

    try {
        await apiFetch(`/estudiantes/${estudiante.id_estudiante}`, {
            method: "DELETE"
        });

        mostrarMensaje("Estudiante eliminado correctamente.");
        await cargarDatos();
    } catch (error) {
        console.error("Error al eliminar estudiante:", error);
        mostrarMensaje(
            "No fue posible eliminar el estudiante. Verifica la API.",
            "danger"
        );
    }
}