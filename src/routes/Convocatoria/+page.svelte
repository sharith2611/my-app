
<script>
    import { onMount } from "svelte";
    import Navbar from "../../lib/Navbar.svelte";
    import Footer from "../../lib/Footer.svelte";
    import DataTable from "$lib/components/DataTable.svelte";
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
</script>

<svelte:head>
    <title>Gestión de Convocatorias</title>
    <meta
        name="description"
        content="Registro y administración de convocatorias educativas"
    />
</svelte:head>

<Navbar>
    <div class="container py-4">

        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
                <h2 class="fw-bold mb-1">Gestión de Convocatorias</h2>
                <p class="text-muted mb-0">
                    Registro y administración de convocatorias educativas.
                </p>
            </div>

            <button
                type="button"
                class="btn btn-outline-primary"
                onclick={cargarDatos}
                disabled={cargando || guardando || procesando !== null}
            >
                <i class="bi bi-arrow-clockwise me-1"></i>
                Actualizar
            </button>
        </div>

        {#if mensaje}
            <div
                class="alert alert-{tipoMensaje} alert-dismissible fade show"
                role="alert"
            >
                {mensaje}
                <button
                    type="button"
                    class="btn-close"
                    aria-label="Cerrar"
                    onclick={() => mensaje = ""}
                ></button>
            </div>
        {/if}

        {#if mostrarComponenteRequisitos && convocatoriaSeleccionada}
            <RequisitosConvocatoria
                convocatoria={convocatoriaSeleccionada}
                onCerrar={cerrarRequisitos}
            />
        {:else}
            <!-- FORMULARIO -->
            <div class="card shadow-sm border-0">
                <div class="card-header bg-primary text-white py-3">
                    <h5 class="mb-0">
                        <i class="bi bi-calendar-event me-2"></i>
                        {editando ? "Editar convocatoria" : "Registrar convocatoria"}
                    </h5>
                </div>

                <div class="card-body p-4">
                    <form onsubmit={guardarConvocatoria}>
                        <div class="row g-3">

                            <div class="col-md-6">
                                <label for="nombre" class="form-label">
                                    Nombre de convocatoria *
                                </label>
                                <input
                                    id="nombre"
                                    type="text"
                                    class="form-control"
                                    bind:value={nombre}
                                    maxlength="200"
                                    placeholder="Ej. Beca Excelencia 2026"
                                    required
                                />
                            </div>

                            <div class="col-md-6">
                                <label for="auxilio" class="form-label">
                                    Auxilio educativo *
                                </label>
                                <select
                                    id="auxilio"
                                    class="form-select"
                                    bind:value={idAuxilio}
                                    required
                                >
                                    <option value="">Seleccione un auxilio</option>
                                    {#each auxilios.filter(a => estadoEsActivo(a.estado)) as auxilio}
                                        <option value={String(obtenerIdAuxilio(auxilio))}>
                                            {auxilio.nombre}
                                        </option>
                                    {/each}
                                </select>

                                {#if auxilios.length === 0 && !cargando}
                                    <small class="text-danger">
                                        No hay auxilios disponibles. Verifica la ruta de la API.
                                    </small>
                                {/if}
                            </div>

                            <div class="col-md-6">
                                <label for="fechaInicio" class="form-label">
                                    Fecha de inicio *
                                </label>
                                <input
                                    id="fechaInicio"
                                    type="date"
                                    class="form-control"
                                    bind:value={fechaInicio}
                                    required
                                />
                            </div>

                            <div class="col-md-6">
                                <label for="fechaFin" class="form-label">
                                    Fecha de finalización *
                                </label>
                                <input
                                    id="fechaFin"
                                    type="date"
                                    class="form-control"
                                    bind:value={fechaFin}
                                    min={fechaInicio || undefined}
                                    required
                                />
                            </div>

                            <div class="col-md-6">
                                <label for="cupos" class="form-label">
                                    Número de cupos *
                                </label>
                                <input
                                    id="cupos"
                                    type="number"
                                    class="form-control"
                                    bind:value={cupos}
                                    min="1"
                                    step="1"
                                    placeholder="Ej. 50"
                                    required
                                />
                            </div>

                            <div class="col-md-6">
                                <label for="estado" class="form-label">Estado</label>
                                <select
                                    id="estado"
                                    class="form-select"
                                    bind:value={estado}
                                >
                                    <option value="true">Activa</option>
                                    <option value="false">Inactiva</option>
                                </select>
                            </div>

                        </div>

                        <div class="d-flex flex-wrap gap-2 mt-4">
                            <button
                                type="submit"
                                class="btn btn-primary"
                                disabled={guardando || cargando || procesando !== null}
                            >
                                {#if guardando}
                                    <span class="spinner-border spinner-border-sm me-2"></span>
                                    Guardando...
                                {:else}
                                    <i class="bi bi-check-circle me-1"></i>
                                    {editando ? "Guardar cambios" : "Crear convocatoria"}
                                {/if}
                            </button>

                            <button
                                type="button"
                                class="btn btn-secondary"
                                onclick={() => {
                                    limpiarFormulario();
                                    mensaje = "";
                                }}
                                disabled={guardando || procesando !== null}
                            >
                                <i class="bi bi-eraser me-1"></i>
                                Limpiar
                            </button>

                            {#if editando}
                                <button
                                    type="button"
                                    class="btn btn-outline-dark"
                                    onclick={limpiarFormulario}
                                    disabled={guardando || procesando !== null}
                                >
                                    Cancelar edición
                                </button>
                            {/if}
                        </div>
                    </form>
                </div>
            </div>

            <!-- TABLA REUTILIZABLE -->
            <div class="card shadow-sm border-0 mt-5">
                <div class="card-header bg-dark text-white py-3">
                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <h5 class="mb-0">
                            <i class="bi bi-list-ul me-2"></i>
                            Convocatorias registradas
                        </h5>
                        <span class="badge bg-light text-dark">
                            {convocatoriasFiltradas.length} registros
                        </span>
                    </div>
                </div>

                <div class="card-body p-3 p-md-4">
                    <div class="row g-3 mb-4">
                        <div class="col-md-4">
                            <label for="filtroEstado" class="form-label">
                                Filtrar por estado
                            </label>
                            <select
                                id="filtroEstado"
                                class="form-select"
                                bind:value={filtroEstado}
                            >
                                <option value="todos">Todas</option>
                                <option value="activas">Activas</option>
                                <option value="inactivas">Inactivas</option>
                            </select>
                        </div>
                    </div>

                    <DataTable
                        data={convocatoriasFiltradas}
                        columns={columnasConvocatorias}
                        title="Convocatorias"
                        loading={cargando}
                        emptyMessage="No hay convocatorias para mostrar."
                        pageSize={5}
                        actions={accionesConvocatorias}
                        showSearch={true}
                    />
                </div>
            </div>
        {/if}
    </div>

    <Footer />
</Navbar>
