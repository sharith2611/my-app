<script>
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api.js";
    import Navbar from "../../lib/Navbar.svelte";
    import Footer from "../../lib/Footer.svelte";
    import DataTable from "$lib/components/DataTable.svelte";

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
</script>

<Navbar>
    <div class="container-fluid py-3">
        <div class="mb-4">
            <h2 class="fw-bold text-primary">
                Gestión de Adjudicaciones
            </h2>

            <p class="text-secondary mb-0">
                Registra, consulta y actualiza las adjudicaciones
                asociadas a las postulaciones.
            </p>
        </div>

        {#if mensaje}
            <div
                class="alert alert-{tipoMensaje}"
                role="alert"
                aria-live="polite"
            >
                {mensaje}
            </div>
        {/if}

        <div
            class="card shadow-sm border-0 mb-4"
            id="formulario-adjudicacion"
        >
            <div class="card-header bg-primary text-white py-3">
                <h5 class="mb-0">
                    {editando
                        ? "Editar adjudicación"
                        : "Registrar adjudicación"}
                </h5>
            </div>

            <div class="card-body p-4">
                <form onsubmit={guardarAdjudicacion}>
                    <div class="row">
                        <div class="col-12 col-lg-6 mb-3">
                            <label
                                for="postulacion"
                                class="form-label fw-semibold"
                            >
                                Postulación pendiente
                            </label>

                            <select
                                id="postulacion"
                                class="form-select"
                                bind:value={idPostulacion}
                                required
                                disabled={
                                    guardando ||
                                    cargandoPostulaciones ||
                                    editando
                                }
                            >
                                <option value="">
                                    Selecciona una postulación
                                </option>

                                {#each postulaciones as postulacion}
                                    <option
                                        value={String(
                                            postulacion.id_postulacion
                                        )}
                                    >
                                        {obtenerNombrePostulacion(
                                            postulacion
                                        )}
                                    </option>
                                {/each}

                                {#if editando && idPostulacion && !postulaciones.some((p) => String(p.id_postulacion) === String(idPostulacion))}
                                    <option value={idPostulacion}>
                                        Postulación {idPostulacion} (actual)
                                    </option>
                                {/if}
                            </select>

                            {#if cargandoPostulaciones}
                                <div class="form-text">
                                    Cargando postulaciones...
                                </div>
                            {:else if postulaciones.length === 0 && !editando}
                                <div class="form-text text-danger">
                                    No hay postulaciones con escala pendiente.
                                </div>
                            {/if}
                        </div>

                        <div class="col-12 col-lg-6 mb-3">
                            <label
                                for="fechaAdjudicacion"
                                class="form-label fw-semibold"
                            >
                                Fecha de adjudicación
                            </label>

                            <input
                                id="fechaAdjudicacion"
                                type="date"
                                class="form-control"
                                bind:value={fechaAdjudicacion}
                                required
                                disabled={guardando}
                            />
                        </div>

                        <div class="col-12 col-lg-6 mb-3">
                            <label
                                for="resultado"
                                class="form-label fw-semibold"
                            >
                                Resultado
                            </label>

                            <select
                                id="resultado"
                                class="form-select"
                                bind:value={resultado}
                                required
                                disabled={guardando}
                            >
                                <option value="">
                                    Selecciona un resultado
                                </option>
                                <option value="Aprobada">
                                    Aprobada
                                </option>
                                <option value="Rechazada">
                                    Rechazada
                                </option>
                                <option value="Pendiente">
                                    Pendiente
                                </option>
                            </select>
                        </div>

                        <div class="col-12 col-lg-6 mb-3">
                            <label
                                for="porcentaje"
                                class="form-label fw-semibold"
                            >
                                Porcentaje aprobado
                            </label>

                            <div class="input-group">
                                <input
                                    id="porcentaje"
                                    type="number"
                                    class="form-control"
                                    bind:value={porcentajeAprobado}
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    placeholder="Ej. 80"
                                    disabled={guardando}
                                />

                                <span class="input-group-text">%</span>
                            </div>
                        </div>

                        <div class="col-12 col-lg-6 mb-3">
                            <label
                                for="monto"
                                class="form-label fw-semibold"
                            >
                                Monto aprobado (COP)
                            </label>

                            <input
                                id="monto"
                                type="number"
                                class="form-control"
                                bind:value={montoAprobado}
                                min="0"
                                step="0.01"
                                placeholder="Ingresa el monto aprobado"
                                disabled={guardando}
                            />
                        </div>

                        <div class="col-12 col-lg-6 mb-3">
                            <label
                                for="estado"
                                class="form-label fw-semibold"
                            >
                                Estado del registro
                            </label>

                            <select
                                id="estado"
                                class="form-select"
                                bind:value={estado}
                                disabled={guardando}
                            >
                                <option value={true}>Activo</option>
                                <option value={false}>Inactivo</option>
                            </select>
                        </div>

                        <div class="col-12 mb-3">
                            <label
                                for="observaciones"
                                class="form-label fw-semibold"
                            >
                                Observaciones
                            </label>

                            <textarea
                                id="observaciones"
                                class="form-control"
                                rows="3"
                                bind:value={observaciones}
                                placeholder="Escribe observaciones adicionales."
                                disabled={guardando}
                            ></textarea>
                        </div>
                    </div>

                    <div
                        class="d-flex flex-column flex-sm-row justify-content-end gap-2"
                    >
                        <button
                            type="button"
                            class="btn btn-outline-secondary"
                            onclick={() => {
                                limpiarFormulario();
                                mensaje = "";
                            }}
                            disabled={guardando}
                        >
                            Limpiar
                        </button>

                        <button
                            type="submit"
                            class="btn btn-primary"
                            disabled={
                                guardando ||
                                cargandoPostulaciones ||
                                (!editando && postulaciones.length === 0)
                            }
                        >
                            {#if guardando}
                                <span
                                    class="spinner-border spinner-border-sm me-2"
                                    aria-hidden="true"
                                ></span>
                                Guardando...
                            {:else}
                                {editando
                                    ? "Actualizar adjudicación"
                                    : "Registrar adjudicación"}
                            {/if}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <DataTable
            data={adjudicaciones}
            columns={columnasAdjudicaciones}
            actions={accionesAdjudicaciones}
            title="Adjudicaciones registradas"
            loading={cargando || guardando}
            emptyMessage="No hay adjudicaciones registradas."
            pageSize={5}
            showSearch={true}
        />
    </div>

    <Footer />
</Navbar>
