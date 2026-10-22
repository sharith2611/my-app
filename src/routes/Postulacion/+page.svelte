<script src="./Postulacion.js"></script>

<Navbar>
    <div class="container py-4">
        <div class="row justify-content-center">
            <div class="col-12 col-lg-9 col-xl-8">

                <div class="mb-4">
                    <h2 class="fw-bold text-primary">
                        Gestión de Postulaciones
                    </h2>

                    <p class="text-secondary">
                        Registra tu postulación a una convocatoria de auxilio
                        educativo.
                    </p>
                </div>

                {#if mensaje}
                    <div class="alert alert-{tipoMensaje}" role="alert">
                        {mensaje}
                    </div>
                {/if}

                {#if validandoEstudiante}
                    <div class="card shadow-sm border-0">
                        <div class="card-body text-center py-5">
                            <div
                                class="spinner-border text-primary mb-3"
                                role="status"
                            >
                                <span class="visually-hidden">
                                    Validando datos...
                                </span>
                            </div>

                            <p class="mb-0">
                                Validando tus datos de estudiante...
                            </p>
                        </div>
                    </div>

                {:else if estudiante?.id_estudiante}
                    <div class="card shadow-sm border-0">
                        <div class="card-header bg-primary text-white py-3">
                            <h5 class="mb-0">
                                Formulario de postulación
                            </h5>
                        </div>

                        <div class="card-body p-4">
                            <form onsubmit={registrarPostulacion}>
                                <div class="mb-3">
                                    <label
                                        for="nombreEstudiante"
                                        class="form-label fw-semibold"
                                    >
                                        Nombre del estudiante
                                    </label>

                                    <input
                                        id="nombreEstudiante"
                                        type="text"
                                        class="form-control"
                                        value={`${estudiante.nombres ?? ""} ${estudiante.apellidos ?? ""}`.trim()}
                                        readonly
                                    />
                                </div>

                                <div class="mb-3">
                                    <label
                                        for="documento"
                                        class="form-label fw-semibold"
                                    >
                                        Cédula
                                    </label>

                                    <input
                                        id="documento"
                                        type="text"
                                        class="form-control"
                                        value={estudiante.documento ?? ""}
                                        readonly
                                    />
                                </div>

                                <div class="mb-3">
                                    <label
                                        for="convocatoria"
                                        class="form-label fw-semibold"
                                    >
                                        Convocatoria
                                    </label>

                                    <select
                                        id="convocatoria"
                                        class="form-select"
                                        bind:value={idConvocatoria}
                                        required
                                        disabled={
                                            cargandoConvocatorias ||
                                            convocatorias.length === 0 ||
                                            guardando
                                        }
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
                                        <div class="form-text">
                                            Cargando convocatorias...
                                        </div>
                                    {/if}
                                </div>

                                <div class="mb-3">
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
                                        value={fechaPostulacion}
                                        readonly
                                    />
                                </div>

                                <div class="mb-3">
                                    <label
                                        for="escala"
                                        class="form-label fw-semibold"
                                    >
                                        Escala inicial
                                    </label>

                                    <input
                                        id="escala"
                                        type="text"
                                        class="form-control"
                                        value="Pendiente"
                                        readonly
                                    />
                                </div>

                                <div class="mb-4">
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
                                        placeholder="Escribe una observación, si es necesario."
                                        disabled={guardando}
                                    ></textarea>
                                </div>

                                <div class="d-flex flex-column flex-sm-row gap-2 justify-content-end">
                                    <button
                                        type="button"
                                        class="btn btn-outline-secondary"
                                        disabled={guardando}
                                        onclick={() => {
                                            idConvocatoria = "";
                                            fechaPostulacion = obtenerFechaActual();
                                            observaciones = "";
                                            mensaje = "";
                                        }}
                                    >
                                        Limpiar
                                    </button>

                                    <button
                                        type="submit"
                                        class="btn btn-primary"
                                        disabled={
                                            guardando ||
                                            cargandoConvocatorias ||
                                            convocatorias.length === 0
                                        }
                                    >
                                        {#if guardando}
                                            <span
                                                class="spinner-border spinner-border-sm me-2"
                                                aria-hidden="true"
                                            ></span>
                                            Registrando...
                                        {:else}
                                            Registrar postulación
                                        {/if}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div class="mt-4">
                        {#if errorPostulaciones}
                            <div class="alert alert-danger" role="alert">
                                {errorPostulaciones}
                            </div>
                        {/if}

                        <DataTable
                            data={postulaciones}
                            columns={columnasPostulaciones}
                            title="Mi historial de postulaciones"
                            loading={cargandoPostulaciones}
                            emptyMessage="Aún no tienes postulaciones registradas."
                            pageSize={10}
                        />
                    </div>

                {:else}
                    <div class="d-flex justify-content-center align-items-center" style="min-height: 65vh;">
                        <div class="card shadow-sm border-0 text-center" style="width: 100%; max-width: 550px;">
                            <div class="card-body p-4 p-md-5">
                                <div class="mb-3">
                                    <i
                                        class="bi bi-person-exclamation text-warning"
                                        style="font-size: 3.5rem;"
                                    ></i>
                                </div>

                                <h4 class="fw-bold text-primary mb-3">
                                    Actualización de datos requerida
                                </h4>

                                <p class="text-secondary mb-4">
                                    No tienes un registro de estudiante asociado
                                    a tu cédula. Debes actualizar tus datos antes
                                    de realizar una postulación.
                                </p>

                                <div class="bg-light rounded p-3 mb-4 text-start">
                                    <div class="mb-3">
                                        <label class="form-label text-secondary mb-1">
                                            Nombre del usuario
                                        </label>

                                        <div class="fw-semibold">
                                            {usuario?.nombre ?? "No disponible"}
                                        </div>
                                    </div>

                                    <div>
                                        <label class="form-label text-secondary mb-1">
                                            Cédula del usuario
                                        </label>

                                        <div class="fw-semibold">
                                            {usuario?.cedula ?? "No disponible"}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    class="btn btn-primary px-4"
                                    onclick={() => goto("/Estudiante")}
                                >
                                    <i class="bi bi-pencil-square me-2"></i>
                                    Actualizar mis datos
                                </button>
                            </div>
                        </div>
                    </div>
                {/if}

            </div>
        </div>
    </div>

    <Footer />
</Navbar>
