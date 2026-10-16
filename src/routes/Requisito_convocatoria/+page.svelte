
<script>
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api.js";

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
</script>

<svelte:head>
    <title>Requisitos de Convocatoria</title>
</svelte:head>

<div class="container py-4">

    <div class="mb-4">
        <button
            type="button"
            class="btn btn-outline-secondary mb-3"
            onclick={onCerrar}
        >
            <i class="bi bi-arrow-left me-1"></i>
            Volver a convocatorias
        </button>

        <h2 class="fw-bold">Requisitos de Convocatoria</h2>

        <p class="text-muted">
            Asignación de requisitos a las convocatorias
        </p>

        <p>
            <strong>Convocatoria:</strong>
            {nombreConvocatoria}
        </p>
    </div>

    {#if mensaje}
        <div class="alert alert-{tipoMensaje}" role="alert">
            {mensaje}

            <button
                type="button"
                class="btn-close float-end"
                aria-label="Cerrar mensaje"
                onclick={() => mensaje = ""}
            ></button>
        </div>
    {/if}

    <div class="card shadow-sm">
        <div class="card-header bg-primary text-white">
            <h5 class="mb-0">
                {editando ? "Editar requisito" : "Asignar requisito"}
            </h5>
        </div>

        <div class="card-body">
            <form onsubmit={guardarRequisito}>
                <div class="row">

                    <div class="col-md-6 mb-3">
                        <label for="descripcion" class="form-label">
                            Descripción del requisito
                        </label>

                        <input
                            id="descripcion"
                            class="form-control"
                            type="text"
                            bind:value={descripcion}
                            placeholder="Ej. Certificado de notas"
                            maxlength="500"
                            required
                        />
                    </div>

                    <div class="col-md-3 mb-3">
                        <label for="obligatorio" class="form-label">
                            Obligatorio
                        </label>

                        <select
                            id="obligatorio"
                            class="form-select"
                            bind:value={obligatorio}
                            required
                        >
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                        </select>
                    </div>

                    <div class="col-md-3 mb-3">
                        <label for="valorMinimo" class="form-label">
                            Valor mínimo
                        </label>

                        <input
                            id="valorMinimo"
                            class="form-control"
                            type="number"
                            min="0"
                            step="any"
                            bind:value={valorMinimo}
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    class="btn btn-primary"
                    disabled={guardando || procesando || !idConvocatoria}
                >
                    {#if guardando}
                        <span class="spinner-border spinner-border-sm me-1"></span>
                        Guardando...
                    {:else}
                        <i class="bi bi-check-circle me-1"></i>
                        {editando ? "Guardar cambios" : "Asignar requisito"}
                    {/if}
                </button>

                <button
                    type="button"
                    class="btn btn-secondary ms-2"
                    onclick={limpiarFormulario}
                    disabled={guardando || procesando}
                >
                    Limpiar
                </button>
            </form>
        </div>
    </div>

    <div class="card shadow-sm mt-5">
        <div class="card-header bg-dark text-white">
            <h5 class="mb-0">
                Requisitos asignados a la convocatoria
            </h5>
        </div>

        <div class="card-body">

            {#if cargando}
                <div class="text-center py-4">
                    <div
                        class="spinner-border text-primary"
                        role="status"
                    >
                        <span class="visually-hidden">
                            Cargando...
                        </span>
                    </div>

                    <p class="text-muted mt-2">
                        Cargando requisitos...
                    </p>
                </div>

            {:else}
                <div class="table-responsive">
                    <table class="table table-striped table-hover align-middle">

                        <thead>
                            <tr>
                                <th>Descripción</th>
                                <th>Obligatorio</th>
                                <th>Valor mínimo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {#each requisitosFiltrados as registro (registro.id_requisito_convocatoria)}
                                <tr>
                                    <td>{registro.descripcion}</td>

                                    <td>
                                        {#if registro.obligatorio}
                                            <span class="badge bg-danger">
                                                Sí
                                            </span>
                                        {:else}
                                            <span class="badge bg-secondary">
                                                No
                                            </span>
                                        {/if}
                                    </td>

                                    <td>
                                        {Number(
                                            registro.valor_minimo ?? 0
                                        ).toLocaleString("es-CO")}
                                    </td>

                                    <td>
                                        {#if registro.estado !== false}
                                            <span class="badge bg-success">
                                                Activo
                                            </span>
                                        {:else}
                                            <span class="badge bg-secondary">
                                                Inactivo
                                            </span>
                                        {/if}
                                    </td>

                                    <td class="text-nowrap">
                                        <button
                                            type="button"
                                            class="btn btn-sm btn-warning"
                                            onclick={() => editarRequisito(registro)}
                                            disabled={procesando || guardando}
                                        >
                                            <i class="bi bi-pencil me-1"></i>
                                            Editar
                                        </button>

                                        <button
                                            type="button"
                                            class="btn btn-sm ms-1 {registro.estado !== false ? 'btn-danger' : 'btn-success'}"
                                            onclick={() => cambiarEstado(registro)}
                                            disabled={procesando || guardando}
                                        >
                                            {registro.estado !== false
                                                ? "Desactivar"
                                                : "Activar"}
                                        </button>
                                    </td>
                                </tr>

                            {:else}
                                <tr>
                                    <td
                                        colspan="5"
                                        class="text-center text-muted py-4"
                                    >
                                        No hay requisitos registrados para esta convocatoria.
                                    </td>
                                </tr>
                            {/each}
                        </tbody>

                    </table>
                </div>
            {/if}
        </div>
    </div>
</div>
