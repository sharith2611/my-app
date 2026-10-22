
<script>
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api.js";

    import Footer from "../../lib/Footer.svelte";
    import Navbar from "../../lib/Navbar.svelte";
    import Accesibilidad from "../../lib/components/accesibilidad.svelte";
    import Cookies from "../../lib/components/cookies.svelte";
    import Logo from "../../lib/components/logo.svelte";
    import RedesSociales from "../../lib/components/Redes_sociales.svelte";
    import Toast from "../../lib/components/toast.svelte";
    import VolverArriba from "../../lib/components/Volver_arriba.svelte";
    import Whatsapp from "../../lib/components/Whatsapp.svelte";

    let totalEstudiantes = $state(0);
    let totalConvocatorias = $state(0);
    let totalPostulaciones = $state(0);
    let totalAdjudicaciones = $state(0);

    let ultimasPostulaciones = $state([]);
    let cargando = $state(true);
    let error = $state("");

    function normalizarLista(respuesta) {
        if (Array.isArray(respuesta)) {
            return respuesta;
        }

        if (Array.isArray(respuesta?.items)) {
            return respuesta.items;
        }

        throw new Error("La API no devolvió una lista válida.");
    }

    function formatearFecha(fecha) {
        if (!fecha) return "—";

        const texto = String(fecha).slice(0, 10);
        const partes = texto.split("-");

        if (partes.length !== 3) return texto;

        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    function obtenerNombreEstudiante(postulacion) {
        const nombre = [
            postulacion.nombres,
            postulacion.apellidos
        ].filter(Boolean).join(" ");

        return nombre || `Estudiante ${postulacion.id_estudiante ?? ""}`.trim();
    }

    function obtenerNombreConvocatoria(postulacion, convocatorias) {
        const convocatoria = convocatorias.find(
            (item) =>
                String(item.id_convocatoria) ===
                String(postulacion.id_convocatoria)
        );

        return (
            postulacion.nombre_convocatoria ??
            postulacion.convocatoria?.nombre_convocatoria ??
            postulacion.convocatoria?.nombre ??
            convocatoria?.nombre_convocatoria ??
            convocatoria?.nombre ??
            convocatoria?.descripcion ??
            `Convocatoria ${postulacion.id_convocatoria ?? ""}`.trim()
        );
    }

    function obtenerEstado(postulacion) {
        return postulacion.escala ?? "Pendiente";
    }

    function claseEstado(estado) {
        const valor = String(estado ?? "").toLowerCase();

        if (
            valor.includes("aprob") ||
            valor.includes("adjudic")
        ) {
            return "bg-success";
        }

        if (
            valor.includes("rechaz") ||
            valor.includes("negad")
        ) {
            return "bg-danger";
        }

        if (
            valor.includes("revisi") ||
            valor.includes("evalu")
        ) {
            return "bg-info text-dark";
        }

        return "bg-warning text-dark";
    }

    async function cargarDashboard() {
        cargando = true;
        error = "";

        try {
            const resultados = await Promise.allSettled([
                apiFetch("/estudiantes/"),
                apiFetch("/convocatorias/"),
                apiFetch("/postulaciones/"),
                apiFetch("/adjudicaciones/")
            ]);

            const nombres = [
                "estudiantes",
                "convocatorias",
                "postulaciones",
                "adjudicaciones"
            ];

            const errores = resultados
                .map((resultado, indice) => {
                    if (resultado.status === "rejected") {
                        console.error(
                            `Error al cargar ${nombres[indice]}:`,
                            resultado.reason
                        );

                        return nombres[indice];
                    }

                    return null;
                })
                .filter(Boolean);

            const obtenerLista = (indice) => {
                const resultado = resultados[indice];

                if (resultado.status !== "fulfilled") {
                    return [];
                }

                try {
                    return normalizarLista(resultado.value);
                } catch (e) {
                    console.error(
                        `Respuesta inválida para ${nombres[indice]}:`,
                        e
                    );
                    errores.push(nombres[indice]);
                    return [];
                }
            };

            const estudiantes = obtenerLista(0);
            const convocatorias = obtenerLista(1);
            const postulaciones = obtenerLista(2);
            const adjudicaciones = obtenerLista(3);

            totalEstudiantes = estudiantes.length;
            totalConvocatorias = convocatorias.length;
            totalPostulaciones = postulaciones.length;
            totalAdjudicaciones = adjudicaciones.length;

            ultimasPostulaciones = postulaciones
                .slice()
                .sort((a, b) => {
                    const fechaA = new Date(
                        a.fecha_postulacion ?? 0
                    ).getTime();

                    const fechaB = new Date(
                        b.fecha_postulacion ?? 0
                    ).getTime();

                    return fechaB - fechaA;
                })
                .slice(0, 5)
                .map((postulacion) => ({
                    ...postulacion,
                    nombre_estudiante:
                        obtenerNombreEstudiante(postulacion),
                    nombre_convocatoria:
                        obtenerNombreConvocatoria(
                            postulacion,
                            convocatorias
                        )
                }));

            if (errores.length > 0) {
                error = `No fue posible cargar correctamente: ${[
                    ...new Set(errores)
                ].join(", ")}. Verifica los endpoints de la API.`;
            }
        } catch (e) {
            console.error("Error al cargar el dashboard:", e);
            error = "No fue posible cargar la información del inicio.";
        } finally {
            cargando = false;
        }
    }

    onMount(() => {
        cargarDashboard();
    });
</script>

<svelte:head>
    <title>Inicio - Sistema de Becas</title>
    <meta
        name="description"
        content="Panel principal del Sistema de Gestión de Becas y Ayudas Económicas."
    />
</svelte:head>

<Navbar>
    <div class="container py-4">

        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-5">
            <div>
                <h1 class="fw-bold mb-2">
                    Sistema de Gestión de Becas y Ayudas Económicas
                </h1>

                <p class="text-muted mb-0">
                    Administración de estudiantes, convocatorias,
                    postulaciones y adjudicaciones.
                </p>
            </div>

            <button
                type="button"
                class="btn btn-outline-primary"
                onclick={cargarDashboard}
                disabled={cargando}
            >
                <i class="bi bi-arrow-clockwise me-2"></i>
                Actualizar
            </button>
        </div>

        {#if error}
            <div class="alert alert-warning" role="alert">
                <i class="bi bi-exclamation-triangle me-2"></i>
                {error}
            </div>
        {/if}

        <div class="row g-4">

            <div class="col-12 col-sm-6 col-xl-3">
                <div class="card shadow-sm border-0 h-100">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <p class="text-muted mb-2">Estudiantes</p>
                                <h2 class="fw-bold mb-0">
                                    {#if cargando}
                                        <span class="placeholder col-5"></span>
                                    {:else}
                                        {totalEstudiantes}
                                    {/if}
                                </h2>
                            </div>

                            <div class="rounded-3 bg-primary-subtle text-primary p-3">
                                <i class="bi bi-people-fill fs-3"></i>
                            </div>
                        </div>
                        <small class="text-muted d-block mt-3">
                            Registros de estudiantes
                        </small>
                    </div>
                </div>
            </div>

            <div class="col-12 col-sm-6 col-xl-3">
                <div class="card shadow-sm border-0 h-100">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <p class="text-muted mb-2">Convocatorias</p>
                                <h2 class="fw-bold mb-0">
                                    {#if cargando}
                                        <span class="placeholder col-5"></span>
                                    {:else}
                                        {totalConvocatorias}
                                    {/if}
                                </h2>
                            </div>

                            <div class="rounded-3 bg-success-subtle text-success p-3">
                                <i class="bi bi-megaphone-fill fs-3"></i>
                            </div>
                        </div>
                        <small class="text-muted d-block mt-3">
                            Convocatorias registradas
                        </small>
                    </div>
                </div>
            </div>

            <div class="col-12 col-sm-6 col-xl-3">
                <div class="card shadow-sm border-0 h-100">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <p class="text-muted mb-2">Postulaciones</p>
                                <h2 class="fw-bold mb-0">
                                    {#if cargando}
                                        <span class="placeholder col-5"></span>
                                    {:else}
                                        {totalPostulaciones}
                                    {/if}
                                </h2>
                            </div>

                            <div class="rounded-3 bg-warning-subtle text-warning p-3">
                                <i class="bi bi-file-earmark-text-fill fs-3"></i>
                            </div>
                        </div>
                        <small class="text-muted d-block mt-3">
                            Solicitudes registradas
                        </small>
                    </div>
                </div>
            </div>

            <div class="col-12 col-sm-6 col-xl-3">
                <div class="card shadow-sm border-0 h-100">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <p class="text-muted mb-2">Adjudicaciones</p>
                                <h2 class="fw-bold mb-0">
                                    {#if cargando}
                                        <span class="placeholder col-5"></span>
                                    {:else}
                                        {totalAdjudicaciones}
                                    {/if}
                                </h2>
                            </div>

                            <div class="rounded-3 bg-info-subtle text-info p-3">
                                <i class="bi bi-award-fill fs-3"></i>
                            </div>
                        </div>
                        <small class="text-muted d-block mt-3">
                            Adjudicaciones registradas
                        </small>
                    </div>
                </div>
            </div>

        </div>

        <div class="card shadow-sm border-0 mt-5">
            <div class="card-header bg-primary text-white py-3">
                <h5 class="mb-0 fw-bold">
                    <i class="bi bi-clock-history me-2"></i>
                    Últimas postulaciones
                </h5>
            </div>

            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-striped table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-4">Estudiante</th>
                                <th>Convocatoria</th>
                                <th>Fecha</th>
                                <th>Estado</th>
                            </tr>
                        </thead>

                        <tbody>
                            {#if cargando}
                                <tr>
                                    <td colspan="4" class="text-center py-5">
                                        <div
                                            class="spinner-border text-primary"
                                            role="status"
                                        ></div>
                                        <p class="text-muted mt-2 mb-0">
                                            Cargando postulaciones...
                                        </p>
                                    </td>
                                </tr>
                            {:else if ultimasPostulaciones.length === 0}
                                <tr>
                                    <td colspan="4" class="text-center text-muted py-5">
                                        <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                                        No hay postulaciones registradas.
                                    </td>
                                </tr>
                            {:else}
                                {#each ultimasPostulaciones as postulacion (postulacion.id_postulacion)}
                                    <tr>
                                        <td class="ps-4 fw-semibold">
                                            {postulacion.nombre_estudiante}
                                        </td>

                                        <td>
                                            {postulacion.nombre_convocatoria}
                                        </td>

                                        <td>
                                            {formatearFecha(
                                                postulacion.fecha_postulacion
                                            )}
                                        </td>

                                        <td>
                                            <span
                                                class="badge {claseEstado(
                                                    obtenerEstado(postulacion)
                                                )}"
                                            >
                                                {obtenerEstado(postulacion)}
                                            </span>
                                        </td>
                                    </tr>
                                {/each}
                            {/if}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card-footer bg-white text-muted small">
                Se muestran las cinco postulaciones más recientes.
            </div>
        </div>

    </div>

    <Footer />
</Navbar>

<Accesibilidad />
<Cookies />
<Logo />
<RedesSociales />
<Toast />
<VolverArriba />
<Whatsapp />
