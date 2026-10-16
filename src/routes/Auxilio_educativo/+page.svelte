
<script>
    import { onMount } from "svelte";
    import Navbar from "../../lib/Navbar.svelte";
    import Footer from "../../lib/Footer.svelte";
    import DataTable from "$lib/components/DataTable.svelte";
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
</script>

<Navbar>
    <div class="container py-4">
        <h2 class="fw-bold mb-4">
            Gestión de Auxilios Educativos
        </h2>

        {#if mensaje}
            <div
                class={`alert alert-${tipoMensaje} alert-dismissible`}
                role="alert"
            >
                {mensaje}
                <button
                    type="button"
                    class="btn-close"
                    aria-label="Cerrar"
                    onclick={() => (mensaje = "")}
                ></button>
            </div>
        {/if}

        <div class="card shadow-sm" id="formulario-auxilio">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">
                    {editando
                        ? "Editar auxilio educativo"
                        : "Registrar auxilio educativo"}
                </h5>
            </div>

            <div class="card-body">
                <form onsubmit={guardarAuxilio}>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label
                                for="facultad"
                                class="form-label"
                            >
                                Facultad *
                            </label>

                            <select
                                id="facultad"
                                class="form-select"
                                bind:value={idFacultad}
                                required
                            >
                                <option value="">
                                    Seleccione una facultad
                                </option>

                                {#each facultades as facultad}
                                    <option
                                        value={String(
                                            facultad.id_facultad ??
                                            facultad.id
                                        )}
                                    >
                                        {facultad.nombre ??
                                            facultad.nombre_facultad}
                                    </option>
                                {/each}
                            </select>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label
                                for="nombre"
                                class="form-label"
                            >
                                Nombre del auxilio *
                            </label>

                            <input
                                id="nombre"
                                class="form-control"
                                bind:value={nombre}
                                placeholder="Nombre del auxilio"
                                maxlength="150"
                                required
                            />
                        </div>

                        <div class="col-md-6 mb-3">
                            <label
                                for="tipo"
                                class="form-label"
                            >
                                Tipo de auxilio *
                            </label>

                            <select
                                id="tipo"
                                class="form-select"
                                bind:value={tipoAuxilio}
                                required
                            >
                                <option value="">
                                    Seleccione
                                </option>
                                <option value="Matrícula">
                                    Matrícula
                                </option>
                                <option value="Transporte">
                                    Transporte
                                </option>
                                <option value="Beca">
                                    Beca
                                </option>
                                <option value="Alimentación">
                                    Alimentación
                                </option>
                            </select>
                        </div>

                        <div class="col-md-3 mb-3">
                            <label
                                for="porcentaje"
                                class="form-label"
                            >
                                Porcentaje máximo
                            </label>

                            <div class="input-group">
                                <input
                                    id="porcentaje"
                                    class="form-control"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    bind:value={porcentajeMaximo}
                                    required
                                />
                                <span class="input-group-text">%</span>
                            </div>
                        </div>

                        <div class="col-md-3 mb-3">
                            <label
                                for="monto"
                                class="form-label"
                            >
                                Monto máximo (COP)
                            </label>

                            <input
                                id="monto"
                                class="form-control"
                                type="number"
                                min="0"
                                step="0.01"
                                bind:value={montoMaximo}
                                required
                            />
                        </div>

                        <div class="col-12 mb-3">
                            <label
                                for="descripcion"
                                class="form-label"
                            >
                                Descripción *
                            </label>

                            <textarea
                                id="descripcion"
                                class="form-control"
                                rows="3"
                                bind:value={descripcion}
                                placeholder="Descripción del auxilio educativo"
                                required
                            ></textarea>
                        </div>

                        {#if editando}
                            <div class="col-12 mb-3">
                                <div class="form-check form-switch">
                                    <input
                                        id="estado"
                                        class="form-check-input"
                                        type="checkbox"
                                        bind:checked={estado}
                                    />
                                    <label
                                        class="form-check-label"
                                        for="estado"
                                    >
                                        Auxilio activo
                                    </label>
                                </div>
                            </div>
                        {/if}
                    </div>

                    <button
                        type="submit"
                        class="btn btn-primary"
                        disabled={guardando || procesando}
                    >
                        {#if guardando}
                            Guardando...
                        {:else}
                            {editando
                                ? "Actualizar auxilio"
                                : "Guardar auxilio"}
                        {/if}
                    </button>

                    <button
                        type="button"
                        class="btn btn-secondary ms-2"
                        onclick={limpiarFormulario}
                        disabled={guardando}
                    >
                        {editando ? "Cancelar edición" : "Limpiar"}
                    </button>
                </form>
            </div>
        </div>

        <div class="card shadow-sm mt-5">
            <div class="card-header bg-dark text-white">
                <h5 class="mb-0">Auxilios registrados</h5>
            </div>

            <div class="card-body">
                <DataTable
                    data={auxilios}
                    columns={columnasAuxilios}
                    actions={accionesAuxilios}
                    title="Listado de auxilios educativos"
                    loading={cargando}
                    emptyMessage="No hay auxilios educativos registrados."
                    pageSize={5}
                />
            </div>
        </div>
    </div>

    <Footer />
</Navbar>
