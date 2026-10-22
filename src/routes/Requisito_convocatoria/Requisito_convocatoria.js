import { onMount } from "svelte";
import { apiFetch } from "$lib/api.js";
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

let {
    convocatoria: convocatoriaSeleccionada = null,
    onCerrar = () => {}
} = $props();

const URL_REQUISITOS = "/requisitos-convocatoria";

let relaciones = $state([]);
let descripcion = $state("");
let obligatorio = $state("true");
let valorMinimo = $state("0");

let cargando = $state(false);
let guardando = $state(false);
let procesando = $state(false);
let editando = $state(false);
let idEditando = $state(null);

let mensaje = $state("");
let tipoMensaje = $state("success");


const idConvocatoria = $derived(
Number(
    convocatoriaSeleccionada?.id_convocatoria ??
    convocatoriaSeleccionada?.id ??
    0
)
);


const nombreConvocatoria = $derived(
    convocatoriaSeleccionada?.nombre ??
    convocatoriaSeleccionada?.nombre_convocatoria ??
    "Convocatoria seleccionada"
);

const requisitosFiltrados = $derived(
    relaciones.filter(
        requisito =>
            Number(requisito.id_convocatoria) === idConvocatoria
    )
);

onMount(() => {
    cargarRequisitos();
});

function mostrarMensaje(texto, tipo = "success") {
    mensaje = texto;
    tipoMensaje = tipo;
}

async function cargarRequisitos() {
    cargando = true;
    mensaje = "";

    try {
        const respuesta = await apiFetch(`${URL_REQUISITOS}/`);

        relaciones = Array.isArray(respuesta)
            ? respuesta
            : Array.isArray(respuesta?.data)
                ? respuesta.data
                : [];

    } catch (error) {
        console.error("Error al cargar los requisitos:", error);

        mostrarMensaje(
            "No fue posible cargar los requisitos de convocatoria.",
            "danger"
        );
    } finally {
        cargando = false;
    }
}

function limpiarFormulario() {
    descripcion = "";
    obligatorio = "true";
    valorMinimo = "0";
    editando = false;
    idEditando = null;
    mensaje = "";
}

function editarRequisito(registro) {
    idEditando = registro.id_requisito_convocatoria;

    descripcion = registro.descripcion ?? "";
    obligatorio = registro.obligatorio ? "true" : "false";
    valorMinimo = String(registro.valor_minimo ?? 0);

    editando = true;
    mensaje = "";
}

async function guardarRequisito(event) {
    event.preventDefault();

    if (!idConvocatoria) {
        mostrarMensaje(
            "No se identificó la convocatoria seleccionada.",
            "warning"
        );
        return;
    }

    if (!descripcion.trim()) {
        mostrarMensaje(
            "Ingrese la descripción del requisito.",
            "warning"
        );
        return;
    }

    if (
        valorMinimo === "" ||
        !Number.isFinite(Number(valorMinimo)) ||
        Number(valorMinimo) < 0
    ) {
        mostrarMensaje(
            "Ingrese un valor mínimo válido.",
            "warning"
        );
        return;
    }

    if (editando && !idEditando) {
        mostrarMensaje(
            "No se identificó el requisito que desea actualizar.",
            "danger"
        );
        return;
    }

    guardando = true;
    mensaje = "";

    const registroActual = editando
        ? relaciones.find(
            registro =>
                Number(registro.id_requisito_convocatoria) ===
                Number(idEditando)
        )
        : null;

    const payload = {
        id_convocatoria: idConvocatoria,
        descripcion: descripcion.trim(),
        obligatorio: obligatorio === "true",
        valor_minimo: Number(valorMinimo),
        estado: registroActual?.estado ?? true
    };

    try {
        if (editando) {
            await apiFetch(
                `${URL_REQUISITOS}/${encodeURIComponent(idEditando)}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            mostrarMensaje(
                "El requisito se actualizó correctamente."
            );

        } else {
            await apiFetch(`${URL_REQUISITOS}/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            mostrarMensaje(
                "El requisito se asignó correctamente."
            );
        }

        descripcion = "";
        obligatorio = "true";
        valorMinimo = "0";
        editando = false;
        idEditando = null;

        await cargarRequisitos();

    } catch (error) {
        console.error("Error al guardar el requisito:", error);

        mostrarMensaje(
            "No fue posible guardar el requisito. Verifique los datos e inténtelo nuevamente.",
            "danger"
        );
    } finally {
        guardando = false;
    }
}

async function cambiarEstado(registro) {
    const id = registro.id_requisito_convocatoria;

    if (!id) {
        mostrarMensaje(
            "No se encontró el identificador del requisito.",
            "danger"
        );
        return;
    }

    const estaActivo = registro.estado !== false;

    const confirmar = window.confirm(
        estaActivo
            ? "¿Desea desactivar este requisito?"
            : "¿Desea activar nuevamente este requisito?"
    );

    if (!confirmar) return;

    procesando = true;
    mensaje = "";

    const payload = {
        id_convocatoria: Number(registro.id_convocatoria),
        descripcion: registro.descripcion,
        obligatorio: Boolean(registro.obligatorio),
        valor_minimo: Number(registro.valor_minimo),
        estado: !estaActivo
    };

    try {
        await apiFetch(
            `${URL_REQUISITOS}/${encodeURIComponent(id)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        mostrarMensaje(
            estaActivo
                ? "El requisito fue desactivado correctamente."
                : "El requisito fue activado correctamente."
        );

        if (Number(idEditando) === Number(id)) {
            descripcion = "";
            obligatorio = "true";
            valorMinimo = "0";
            editando = false;
            idEditando = null;
        }

        await cargarRequisitos();

    } catch (error) {
        console.error("Error al cambiar el estado:", error);

        mostrarMensaje(
            "No fue posible cambiar el estado del requisito.",
            "danger"
        );
    } finally {
        procesando = false;
    }
}