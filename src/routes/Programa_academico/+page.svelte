<script>
    import { onMount } from "svelte";
    import Navbar from "../../lib/Navbar.svelte";
    import Footer from "../../lib/Footer.svelte";
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
</script>

<svelte:head>
    <title>Programas Académicos</title>
    <meta name="description" content="Registro y administración de programas académicos" />
</svelte:head>

<Navbar>
    <div class="container py-4">

        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <h2 class="fw-bold mb-0">Gestión de Programas Académicos</h2>
            <button
                type="button"
                class="btn btn-outline-primary"
                onclick={cargarDatos}
                disabled={cargando || guardando || procesando !== null}
            >
                <i class="bi bi-arrow-clockwise me-1"></i> Actualizar
            </button>
        </div>

        {#if mensaje}
            <div class="alert alert-{tipoMensaje} alert-dismissible fade show" role="alert">
                {mensaje}
                <button type="button" class="btn-close" aria-label="Cerrar"
                    onclick={() => mensaje = ""}></button>
            </div>
        {/if}

        <!-- FORMULARIO -->
        <div class="card shadow-sm border-0">
            <div class="card-header bg-primary text-white py-3">
                <h5 class="mb-0">
                    {editando ? "Editar programa académico" : "Registrar programa académico"}
                </h5>
            </div>

            <div class="card-body">
                <form onsubmit={guardarPrograma}>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="facultad" class="form-label">Facultad *</label>
                            <select id="facultad" class="form-select"
                                bind:value={idFacultad} required>
                                <option value="">Seleccione facultad</option>
                                {#each facultades.filter(f => f.estado !== false) as facultad}
                                    <option value={String(obtenerIdFacultad(facultad))}>
                                        {facultad.nombre}
                                    </option>
                                {/each}
                            </select>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label for="nombre" class="form-label">Nombre del programa *</label>
                            <input id="nombre" type="text" class="form-control"
                                bind:value={nombre} placeholder="Nombre del programa" required />
                        </div>

                        <div class="col-md-6 mb-3">
                            <label for="nivel" class="form-label">Nivel *</label>
                            <select id="nivel" class="form-select" bind:value={nivel} required>
                                <option value="">Seleccione nivel</option>
                                <option value="Técnico">Técnico</option>
                                <option value="Tecnológico">Tecnológico</option>
                                <option value="Profesional">Profesional</option>
                                <option value="Especialización">Especialización</option>
                                <option value="Maestría">Maestría</option>
                                <option value="Doctorado">Doctorado</option>
                            </select>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label for="modalidad" class="form-label">Modalidad *</label>
                            <select id="modalidad" class="form-select"
                                bind:value={modalidad} required>
                                <option value="">Seleccione modalidad</option>
                                <option value="Presencial">Presencial</option>
                                <option value="Virtual">Virtual</option>
                                <option value="A distancia">A distancia</option>
                                <option value="Híbrida">Híbrida</option>
                            </select>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label for="estado" class="form-label">Estado</label>
                            <select id="estado" class="form-select" bind:value={estado}>
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary"
                        disabled={guardando || cargando || procesando !== null}>
                        {#if guardando}
                            <span class="spinner-border spinner-border-sm me-2"></span>
                            Guardando...
                        {:else}
                            {editando ? "Guardar cambios" : "Guardar programa"}
                        {/if}
                    </button>

                    <button type="button" class="btn btn-secondary ms-2"
                        onclick={() => { limpiarFormulario(); mensaje = ""; }}
                        disabled={guardando}>
                        Limpiar
                    </button>

                    {#if editando}
                        <button type="button" class="btn btn-outline-dark ms-2"
                            onclick={limpiarFormulario} disabled={guardando}>
                            Cancelar edición
                        </button>
                    {/if}
                </form>
            </div>
        </div>

        <!-- TABLA -->
        <div class="card shadow-sm border-0 mt-5">
            <div class="card-header bg-dark text-white py-3">
                <h5 class="mb-0">Programas registrados</h5>
            </div>

            <div class="card-body">
                {#if cargando}
                    <div class="text-center py-4">
                        <div class="spinner-border text-primary"></div>
                        <p class="text-muted mt-2">Cargando programas...</p>
                    </div>
                {:else if programas.length === 0}
                    <p class="text-center text-muted py-4">No hay programas registrados.</p>
                {:else}
                    <div class="table-responsive">
                        <table class="table table-striped table-hover align-middle">
                            <thead class="table-dark">
                                <tr>
                                    <th>Facultad</th>
                                    <th>Programa</th>
                                    <th>Nivel</th>
                                    <th>Modalidad</th>
                                    <th>Estado</th>
                                    <th class="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each programas as programa (obtenerIdPrograma(programa))}
                                    <tr>
                                        
                                        <td>{obtenerNombreFacultad(programa.id_facultad)}</td>
                                        <td>{programa.nombre}</td>
                                        <td>{programa.nivel}</td>
                                        <td>{programa.modalidad}</td>
                                        <td>
                                            {#if programa.estado === false}
                                                <span class="badge bg-secondary">Inactivo</span>
                                            {:else}
                                                <span class="badge bg-success">Activo</span>
                                            {/if}
                                        </td>
                                        <td>
                                            <div class="d-flex justify-content-center gap-1">
                                                <button type="button" class="btn btn-sm btn-warning"
                                                    title="Editar"
                                                    onclick={() => editarPrograma(programa)}
                                                    disabled={guardando || procesando !== null}>
                                                    <i class="bi bi-pencil-square"></i>
                                                </button>

                                                <button type="button" class="btn btn-sm btn-outline-primary"
                                                    title={programa.estado === false ? "Activar" : "Desactivar"}
                                                    onclick={() => cambiarEstado(programa)}
                                                    disabled={guardando || procesando !== null}>
                                                    <i class={programa.estado === false
                                                        ? "bi bi-toggle-off" : "bi bi-toggle-on"}></i>
                                                </button>

                                                <button type="button" class="btn btn-sm btn-danger"
                                                    title="Dar de baja"
                                                    onclick={() => eliminarPrograma(programa)}
                                                    disabled={guardando || procesando !== null || programa.estado === false}>
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                            </div>
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

    <Footer />
</Navbar>

