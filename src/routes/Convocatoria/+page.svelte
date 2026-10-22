
<script src="./Convocatoria.js"></script>

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
