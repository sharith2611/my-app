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

let usuario = $state(null);
let esAdministrador = $state(false);
let buscandoDocumento = $state(false);

const columnasEstudiantes = [
    { key: "id_estudiante", label: "ID", sortable: true },
    {
        key: "nombre_completo",
        label: "Nombre completo",
        value: (fila) =>
            `${fila.nombres ?? ""} ${fila.apellidos ?? ""}`.trim(),
        sortable: true
    },
    { key: "documento", label: "Documento", sortable: true },
    {
        key: "programa",
        label: "Programa académico",
        value: (fila) => nombrePrograma(fila.id_programa),
        sortable: true
    },
    { key: "fecha_ingreso", label: "Fecha de ingreso", sortable: true },
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

onMount(async () => {
    try {
        const usuarioGuardado = sessionStorage.getItem("usuario");
        const rolGuardado = sessionStorage.getItem("id_rol");

        usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
        esAdministrador =
            Number(rolGuardado ?? usuario?.id_rol) === 2;

        // Cargar programas para que el formulario esté disponible.
        await cargarProgramas();

        if (esAdministrador) {
            await cargarEstudiantes();
        } else if (usuario?.cedula || usuario?.documento) {
            // Para el estudiante, buscar sus propios datos.
            documento = String(usuario.cedula ?? usuario.documento);
            await buscarEstudiantePorDocumento();
        } else {
            mostrarMensaje(
                "No se encontró el documento del usuario. Verifica los datos de la sesión.",
                "warning"
            );
        }
    } catch (error) {
        console.error("Error al inicializar estudiantes:", error);
        mostrarMensaje(
            "No fue posible cargar la información del usuario.",
            "danger"
        );
    }
});

async function cargarProgramas() {
    const respuesta = await apiFetch("/programas/");
    programas = Array.isArray(respuesta) ? respuesta : [];
}

async function cargarEstudiantes() {
    cargando = true;

    try {
        const respuesta = await apiFetch("/estudiantes/");
        estudiantes = Array.isArray(respuesta) ? respuesta : [];
    } catch (error) {
        console.error("Error al cargar estudiantes:", error);
        mostrarMensaje(
            "No fue posible cargar los estudiantes. Verifica la conexión con la API.",
            "danger"
        );
    } finally {
        cargando = false;
    }
}

async function cargarDatos() {
    await cargarProgramas();

    if (esAdministrador) {
        await cargarEstudiantes();
    } else {
        await buscarEstudiantePorDocumento();
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
    fechaIngreso = "";
    correo = "";
    telefono = "";
    idPrograma = "";
    idEstudiante = null;
    editando = false;
    mensaje = "";

    // No borrar el documento del usuario que está diligenciando
    // su propio registro.
    if (esAdministrador) {
        documento = "";
    } else {
        documento = String(usuario?.cedula ?? usuario?.documento ?? "");
    }
}

async function buscarEstudiantePorDocumento() {
    if (!documento.trim()) return;

    buscandoDocumento = true;
    mensaje = "";

    try {
        // Se consulta el listado para encontrar el documento.
        // Este endpoint debe permitir la consulta al usuario que corresponda.
        const respuesta = await apiFetch("/estudiantes/");
        const lista = Array.isArray(respuesta) ? respuesta : [];

        const encontrado = lista.find(
            (e) => String(e.documento).trim() === documento.trim()
        );

        if (encontrado) {
            editarEstudiante(encontrado);
            mostrarMensaje(
                "Encontramos tu registro. Puedes revisar y actualizar tus datos.",
                "success"
            );
        } else {
            idEstudiante = null;
            editando = false;
            mostrarMensaje(
                "No existe un registro con este documento. Completa tus datos para registrarte.",
                "info"
            );
        }
    } catch (error) {
        console.error("Error al buscar estudiante:", error);
        mostrarMensaje(
            "No fue posible consultar el registro. Verifica la API.",
            "danger"
        );
    } finally {
        buscandoDocumento = false;
    }
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
        if (editando && idEstudiante !== null) {
            await apiFetch(`/estudiantes/${idEstudiante}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });

            mostrarMensaje("Estudiante actualizado correctamente.");
        } else {
            // Comprobar si el documento ya existe antes de insertar.
            const respuesta = await apiFetch("/estudiantes/");
            const lista = Array.isArray(respuesta) ? respuesta : [];

            const existente = lista.find(
                (e) => String(e.documento).trim() === documento.trim()
            );

            if (existente) {
                // Si existe, actualizarlo en vez de intentar un POST.
                await apiFetch(`/estudiantes/${existente.id_estudiante}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datos)
                });

                mostrarMensaje("Los datos del estudiante fueron actualizados.");
            } else {
                await apiFetch("/estudiantes/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datos)
                });

                mostrarMensaje("Estudiante registrado correctamente.");
            }
        }

        await cargarDatos();

        if (esAdministrador) {
            limpiar();
        } else {
            // Mantener los datos actualizados visibles para el estudiante.
            await buscarEstudiantePorDocumento();
        }
    } catch (error) {
        console.error("Error al guardar estudiante:", error);
        mostrarMensaje(
            "No fue posible guardar los datos. Revisa los registros y la API.",
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
    documento = String(estudiante.documento ?? "");
    fechaIngreso = estudiante.fecha_ingreso
        ? String(estudiante.fecha_ingreso).slice(0, 10)
        : "";
    correo = estudiante.email ?? "";
    telefono = estudiante.telefono ?? "";
    idPrograma = String(estudiante.id_programa ?? "");
    editando = true;

    if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

async function eliminarEstudiante(estudiante) {
    if (!esAdministrador) return;

    const confirmado = confirm(
        `¿Deseas eliminar al estudiante ${estudiante.nombres} ${estudiante.apellidos}?`
    );

    if (!confirmado) return;

    try {
        await apiFetch(`/estudiantes/${estudiante.id_estudiante}`, {
            method: "DELETE"
        });

        mostrarMensaje("Estudiante eliminado correctamente.");
        await cargarEstudiantes();
    } catch (error) {
        console.error("Error al eliminar estudiante:", error);
        mostrarMensaje(
            "No fue posible eliminar el estudiante. Verifica la API.",
            "danger"
        );
    }
}
