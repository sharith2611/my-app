
<script src="./Institucion.js"></script>

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
