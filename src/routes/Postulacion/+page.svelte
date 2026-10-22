
<script src="./Postulacion.js"></script>

<svelte:head>
    <title>Postulaciones</title>
</svelte:head>

<Navbar>
    <div class="container py-4">

        <div class="text-center mb-4">
            <h1 class="fw-bold">
                {esAdministrador
                    ? "Gestión de postulaciones"
                    : "Postulación a convocatorias"}
            </h1>

            <p class="text-muted">
                {esAdministrador
                    ? "Consulta todas las postulaciones registradas en el sistema."
                    : "Consulta las convocatorias disponibles y realiza tu postulación."}
            </p>
        </div>

        {#if mensaje}
            <div
                class="alert"
                class:alert-success={tipoMensaje === "success"}
                class:alert-warning={tipoMensaje === "warning"}
                class:alert-danger={tipoMensaje === "danger"}
                role="alert"
            >
                {mensaje}
            </div>
        {/if}

        {#if validandoEstudiante}
            <div class="text-center py-5">
                <div
                    class="spinner-border text-primary"
                    role="status"
                    aria-label="Cargando"
                ></div>
                <p class="mt-3">Cargando información...</p>
            </div>

        {:else if esAdministrador}
            <!-- VISTA DEL ADMINISTRADOR: NO REQUIERE REGISTRO DE ESTUDIANTE -->

            <div class="card shadow-sm border-0 mb-4">
                <div class="card-body">
                    <h5 class="card-title fw-bold">
                        Todas las postulaciones
                    </h5>
                    <p class="text-muted mb-0">
                        Consulta las postulaciones de todos los estudiantes.
                    </p>
                </div>
            </div>

            {#if errorPostulaciones}
                <div class="alert alert-danger" role="alert">
                    {errorPostulaciones}
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-danger ms-2"
                        onclick={() => cargarPostulaciones()}
                    >
                        Reintentar
                    </button>
                </div>
            {/if}

            <DataTable
                data={postulaciones}
                columns={columnasPostulaciones}
                title="Todas las postulaciones"
                loading={cargandoPostulaciones}
                emptyMessage="No hay postulaciones registradas."
                pageSize={10}
            />

        {:else if estudiante?.id_estudiante}
            <!-- VISTA DEL ESTUDIANTE -->

            <div class="card shadow-sm border-0 mb-4">
                <div class="card-header bg-primary text-white py-3">
                    <h5 class="mb-0 fw-bold">
                        Registrar nueva postulación
                    </h5>
                </div>

                <div class="card-body p-4">
                    <form onsubmit={registrarPostulacion}>
                        <div class="row g-3">

                            <div class="col-md-6">
                                <label
                                    for="idConvocatoria"
                                    class="form-label fw-semibold"
                                >
                                    Convocatoria
                                </label>

                                <select
                                    id="idConvocatoria"
                                    class="form-select"
                                    bind:value={idConvocatoria}
                                    required
                                    disabled={cargandoConvocatorias || convocatorias.length === 0 || guardando}
                                >
                                    <option value="">
                                        Selecciona una convocatoria
                                    </option>

                                    {#each convocatorias as convocatoria}
                                        <option
                                            value={String(convocatoria.id_convocatoria)}
                                        >
                                            {obtenerNombreConvocatoria(convocatoria)}
                                        </option>
                                    {/each}
                                </select>

                                {#if cargandoConvocatorias}
                                    <small class="text-muted">
                                        Cargando convocatorias...
                                    </small>
                                {:else if convocatorias.length === 0}
                                    <small class="text-muted">
                                        No hay convocatorias disponibles.
                                    </small>
                                {/if}
                            </div>

                            <div class="col-md-6">
                                <label
                                    for="fechaPostulacion"
                                    class="form-label fw-semibold"
                                >
                                    Fecha de postulación
                                </label>

                                <input
                                    id="fechaPostulacion"
                                    type="date"
                                    class="form-control"
                                    bind:value={fechaPostulacion}
                                    readonly
                                    required
                                />
                            </div>

                            <div class="col-12">
                                <label
                                    for="observaciones"
                                    class="form-label fw-semibold"
                                >
                                    Observaciones
                                    <span class="text-muted fw-normal">
                                        (opcional)
                                    </span>
                                </label>

                                <textarea
                                    id="observaciones"
                                    class="form-control"
                                    rows="3"
                                    bind:value={observaciones}
                                    placeholder="Escribe alguna observación relacionada con tu postulación..."
                                    disabled={guardando}
                                ></textarea>
                            </div>

                            <div class="col-12 text-end">
                                <button
                                    type="submit"
                                    class="btn btn-primary px-4"
                                    disabled={guardando || cargandoConvocatorias || convocatorias.length === 0}
                                >
                                    {#if guardando}
                                        <span
                                            class="spinner-border spinner-border-sm me-2"
                                            role="status"
                                            aria-hidden="true"
                                        ></span>
                                        Registrando...
                                    {:else}
                                        Registrar postulación
                                    {/if}
                                </button>
                            </div>

                        </div>
                    </form>
                </div>
            </div>

            <!-- HISTORIAL PERSONAL DEL ESTUDIANTE -->

            <div class="mt-5">
                <h4 class="fw-bold mb-3">
                    Mi historial de postulaciones
                </h4>

                {#if errorPostulaciones}
                    <div class="alert alert-danger" role="alert">
                        {errorPostulaciones}
                        <button
                            type="button"
                            class="btn btn-sm btn-outline-danger ms-2"
                            onclick={() => cargarPostulaciones()}
                        >
                            Reintentar
                        </button>
                    </div>
                {/if}

                <DataTable
                    data={postulaciones}
                    columns={columnasPostulaciones}
                    title="Mi historial"
                    loading={cargandoPostulaciones}
                    emptyMessage="Aún no tienes postulaciones registradas."
                    pageSize={10}
                />
            </div>

        {:else}
            <!-- VALIDACIÓN DE DATOS PARA LOS DEMÁS ROLES -->

            <div class="row justify-content-center">
                <div class="col-12 col-md-8 col-lg-6">
                    <div class="card shadow-sm border-0 text-center">
                        <div class="card-body p-4 p-md-5">

                            <div class="mb-3">
                                <span
                                    class="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning-subtle text-warning"
                                    style="width: 72px; height: 72px;"
                                >
                                    <i class="bi bi-person-exclamation fs-1"></i>
                                </span>
                            </div>

                            <h4 class="fw-bold mb-3">
                                Actualización de datos requerida
                            </h4>

                            <p class="text-muted">
                                No tienes un registro de estudiante asociado
                                a tu cédula. Debes actualizar tus datos antes
                                de realizar una postulación.
                            </p>

                            <div class="text-start bg-light rounded p-3 my-4">
                                <p class="mb-2">
                                    <strong>Nombre del usuario</strong>
                                </p>
                                <p class="mb-3">
                                    {usuario?.nombre ?? "No disponible"}
                                </p>

                                <p class="mb-2">
                                    <strong>Cédula del usuario</strong>
                                </p>
                                <p class="mb-0">
                                    {usuario?.cedula ?? "No disponible"}
                                </p>
                            </div>

                            <a
                                href="/Estudiantes"
                                class="btn btn-primary"
                            >
                                Actualizar mis datos
                            </a>

                        </div>
                    </div>
                </div>
            </div>
        {/if}

    </div>
</Navbar>

<Footer />

<Accesibilidad />
<Cookies />
<Logo />
<RedesSociales />
<Toast />
<VolverArriba />
<Whatsapp />
