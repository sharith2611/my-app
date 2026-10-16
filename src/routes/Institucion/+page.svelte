
<script>
    import { onMount } from "svelte";
    import Navbar from "../../lib/Navbar.svelte";
    import Footer from "../../lib/Footer.svelte";
    import DataTable from "$lib/components/DataTable.svelte";
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
</script>

<svelte:head>
    <title>Gestión de Instituciones</title>
    <meta
        name="description"
        content="Administración de instituciones educativas"
    />
</svelte:head>

<Navbar>
    <div class="container py-4">
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
            <div>
                <h2 class="fw-bold mb-1">Gestión de Instituciones</h2>
                <p class="text-muted mb-0">
                    Administre las instituciones educativas del sistema.
                </p>
            </div>

            <span class="badge bg-primary fs-6">
                Total: {instituciones.length}
            </span>
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
                    aria-label="Cerrar mensaje"
                    onclick={() => mensaje = ""}
                ></button>
            </div>
        {/if}

        <div class="card shadow-sm border-0 mb-5">
            <div class="card-header bg-primary text-white py-3">
                <h5 class="mb-0">
                    {idEditando !== null
                        ? "Editar institución"
                        : "Registrar institución"}
                </h5>
            </div>

            <div class="card-body p-4">
                <form onsubmit={guardarInstitucion}>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="nombre" class="form-label">
                                Nombre de la institución *
                            </label>
                            <input
                                id="nombre"
                                type="text"
                                class="form-control"
                                bind:value={nombre}
                                placeholder="Nombre de la institución"
                                maxlength="150"
                                required
                            />
                        </div>

                        <div class="col-md-6 mb-3">
                            <label for="estado" class="form-label">
                                Estado *
                            </label>
                            <select
                                id="estado"
                                class="form-select"
                                bind:value={estado}
                                required
                            >
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </select>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label for="direccion" class="form-label">
                                Dirección *
                            </label>
                            <input
                                id="direccion"
                                type="text"
                                class="form-control"
                                bind:value={direccion}
                                placeholder="Dirección de la institución"
                                maxlength="250"
                                required
                            />
                        </div>

                        <div class="col-md-6 mb-3">
                            <label for="telefono" class="form-label">
                                Teléfono *
                            </label>
                            <input
                                id="telefono"
                                type="tel"
                                class="form-control"
                                bind:value={telefono}
                                placeholder="Teléfono de contacto"
                                maxlength="30"
                                required
                            />
                        </div>

                        <div class="col-md-12 mb-3">
                            <label for="correo" class="form-label">
                                Correo electrónico *
                            </label>
                            <input
                                id="correo"
                                type="email"
                                class="form-control"
                                bind:value={correo}
                                placeholder="correo@institucion.edu"
                                maxlength="150"
                                required
                            />
                        </div>
                    </div>

                    <div class="d-flex flex-wrap gap-2 mt-2">
                        <button
                            type="submit"
                            class="btn btn-primary"
                            disabled={guardando || cambiandoEstadoId !== null}
                        >
                            {#if guardando}
                                <span
                                    class="spinner-border spinner-border-sm me-2"
                                    aria-hidden="true"
                                ></span>
                                Guardando...
                            {:else}
                                {idEditando !== null
                                    ? "Actualizar institución"
                                    : "Guardar institución"}
                            {/if}
                        </button>

                        <button
                            type="button"
                            class="btn btn-outline-secondary"
                            onclick={limpiarFormulario}
                            disabled={guardando || cambiandoEstadoId !== null}
                        >
                            Limpiar
                        </button>


                        {#if idEditando !== null}
                            <button
                                type="button"
                                class="btn btn-outline-danger"
                                onclick={limpiarFormulario}
                                disabled={guardando || cambiandoEstadoId !== null}
                            >
                                Cancelar edición
                            </button>
                        {/if}
                    </div>
                </form>
            </div>
        </div>

        <DataTable
            data={instituciones}
            columns={columnasInstituciones}
            title="Instituciones registradas"
            loading={cargando}
            emptyMessage="No hay instituciones registradas."
            pageSize={5}
            actions={accionesInstituciones}
            showSearch={true}
        />
    </div>

    <Footer />
</Navbar>
