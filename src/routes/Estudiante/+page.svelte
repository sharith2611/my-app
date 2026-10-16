
<script>
    import { onMount } from "svelte";
    import Navbar from "$lib/Navbar.svelte";
    import Footer from "$lib/Footer.svelte";
    import DataTable from "$lib/components/DataTable.svelte";
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
</script>

<svelte:head>
    <title>Estudiantes</title>
</svelte:head>

<Navbar>
    <div class="container py-4">
        <div class="mb-4">
            <h2 class="fw-bold">Registro de estudiantes</h2>
            <p class="text-muted">
                Administra la información de los estudiantes registrados.
            </p>
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
                    onclick={() => (mensaje = "")}
                ></button>
            </div>
        {/if}

        <div class="card shadow-sm mb-5">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">
                    {editando ? "Editar estudiante" : "Datos del estudiante"}
                </h5>
            </div>

            <div class="card-body">
                <form onsubmit={guardarEstudiante}>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="nombres" class="form-label">
                                Nombres *
                            </label>
                            <input
                                id="nombres"
                                type="text"
                                class="form-control"
                                bind:value={nombres}
                                placeholder="Ingrese los nombres"
                                required
                            />
                        </div>

                        <div class="col-md-6 mb-3">
                            <label for="apellidos" class="form-label">
                                Apellidos *
                            </label>
                            <input
                                id="apellidos"
                                type="text"
                                class="form-control"
                                bind:value={apellidos}
                                placeholder="Ingrese los apellidos"
                                required
                            />
                        </div>

                        <div class="col-md-6 mb-3">
                            <label for="documento" class="form-label">
                                Documento *
                            </label>
                            <input
                                id="documento"
                                type="text"
                                class="form-control"
                                bind:value={documento}
                                placeholder="Ingrese el documento"
                                required
                            />
                        </div>

                        <div class="col-md-6 mb-3">
                            <label for="fechaIngreso" class="form-label">
                                Fecha de ingreso *
                            </label>
                            <input
                                id="fechaIngreso"
                                type="date"
                                class="form-control"
                                bind:value={fechaIngreso}
                                required
                            />
                        </div>

                        <div class="col-md-6 mb-3">
                            <label for="correo" class="form-label">
                                Correo electrónico
                            </label>
                            <input
                                id="correo"
                                type="email"
                                class="form-control"
                                bind:value={correo}
                                placeholder="correo@ejemplo.com"
                            />
                        </div>

                        <div class="col-md-6 mb-3">
                            <label for="telefono" class="form-label">
                                Teléfono
                            </label>
                            <input
                                id="telefono"
                                type="text"
                                class="form-control"
                                bind:value={telefono}
                                placeholder="Ingrese el teléfono"
                            />
                        </div>

                        <div class="col-md-12 mb-3">
                            <label for="idPrograma" class="form-label">
                                Programa académico *
                            </label>

                            <select
                                id="idPrograma"
                                class="form-select"
                                bind:value={idPrograma}
                                required
                            >
                                <option value="">
                                    Seleccione un programa
                                </option>

                                {#each programas as programa (programa.id_programa)}
                                    <option value={String(programa.id_programa)}>
                                        {programa.nombre_programa ??
                                            programa.nombre ??
                                            `Programa ${programa.id_programa}`}
                                    </option>
                                {/each}
                            </select>
                        </div>
                    </div>

                    <div class="mt-3">
                        <button
                            type="submit"
                            class="btn btn-primary"
                            disabled={guardando}
                        >
                            {#if guardando}
                                Guardando...
                            {:else}
                                {editando
                                    ? "Actualizar estudiante"
                                    : "Registrar estudiante"}
                            {/if}
                        </button>

                        <button
                            type="button"
                            class="btn btn-secondary ms-2"
                            onclick={limpiar}
                        >
                            {editando ? "Cancelar edición" : "Limpiar"}
                        </button>
                    </div>

                    <p class="text-muted small mt-2">
                        Los campos marcados con * son obligatorios.
                    </p>
                </form>
            </div>
        </div>

        <DataTable
            data={estudiantes}
            columns={columnasEstudiantes}
            actions={accionesEstudiantes}
            title="Estudiantes registrados"
            loading={cargando}
            emptyMessage="No hay estudiantes registrados."
            pageSize={10}
            showSearch={true}
        />
    </div>

    <Footer />
</Navbar>

