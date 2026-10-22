<script src="./Facultad.js"></script>

<svelte:head>
    <title>Gestión de Facultades</title>
    <meta
        name="description"
        content="Registro y administración de facultades"
    />
</svelte:head>

<Navbar>
    <div class="container py-4">

        <!-- ENCABEZADO -->

        <div
            class="d-flex flex-wrap justify-content-between
                   align-items-center gap-3 mb-4"
        >
            <div>
                <h2 class="fw-bold mb-1">
                    Gestión de Facultades
                </h2>

                <p class="text-muted mb-0">
                    Registro y administración de facultades.
                </p>
            </div>

            <button
                type="button"
                class="btn btn-outline-primary"
                onclick={cargarDatos}
                disabled={cargando || guardando || cambiandoEstado !== null}
            >
                <i class="bi bi-arrow-clockwise me-1"></i>
                Actualizar
            </button>
        </div>

        <!-- MENSAJES -->

        {#if mensaje}
            <div
                class="alert alert-{tipoMensaje}
                       alert-dismissible fade show"
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

        <!-- FORMULARIO -->

        <div class="card border-0 shadow-sm mb-5">
            <div class="card-header bg-primary text-white py-3">
                <h5 class="mb-0">
                    <i class="bi bi-building me-2"></i>

                    {editando
                        ? "Editar facultad"
                        : "Registrar facultad"}
                </h5>
            </div>

            <div class="card-body p-4">
                <form onsubmit={guardarFacultad}>
                    <div class="row g-3">

                        <div class="col-md-6">
                            <label
                                for="institucion"
                                class="form-label"
                            >
                                Institución *
                            </label>

                            <select
                                id="institucion"
                                class="form-select"
                                bind:value={institucion}
                                required
                            >
                                <option value="">
                                    Seleccione una institución
                                </option>

                                {#each instituciones as item}
                                    <option
                                        value={String(
                                            item.id_institucion
                                            ?? item.id
                                        )}
                                    >
                                        {item.nombre}
                                    </option>
                                {/each}
                            </select>

                            {#if instituciones.length === 0 && !cargando}
                                <small class="text-danger">
                                    No hay instituciones disponibles.
                                </small>
                            {/if}
                        </div>

                        <div class="col-md-6">
                            <label
                                for="nombre"
                                class="form-label"
                            >
                                Nombre de la facultad *
                            </label>

                            <input
                                id="nombre"
                                type="text"
                                class="form-control"
                                bind:value={nombre}
                                maxlength="150"
                                placeholder="Nombre de la facultad"
                                required
                            />
                        </div>

                        <div class="col-md-6">
                            <label
                                for="direccion"
                                class="form-label"
                            >
                                Dirección *
                            </label>

                            <input
                                id="direccion"
                                type="text"
                                class="form-control"
                                bind:value={direccion}
                                placeholder="Dirección"
                                required
                            />
                        </div>

                        <div class="col-md-6">
                            <label
                                for="extension"
                                class="form-label"
                            >
                                Extensión *
                            </label>

                            <input
                                id="extension"
                                type="text"
                                class="form-control"
                                bind:value={extension}
                                placeholder="Extensión telefónica"
                                required
                            />
                        </div>

                        <div class="col-md-8">
                            <label
                                for="email"
                                class="form-label"
                            >
                                Correo electrónico
                            </label>

                            <input
                                id="email"
                                type="email"
                                class="form-control"
                                bind:value={email}
                                placeholder="facultad@universidad.edu"
                            />
                        </div>

                        <div class="col-md-4">
                            <label
                                for="estado"
                                class="form-label"
                            >
                                Estado
                            </label>

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

                    <!-- BOTONES DEL FORMULARIO -->

                    <div class="d-flex flex-wrap gap-2 mt-4">
                        <button
                            type="submit"
                            class="btn btn-primary"
                            disabled={
                                guardando ||
                                cargando ||
                                instituciones.length === 0 ||
                                cambiandoEstado !== null
                            }
                        >
                            {#if guardando}
                                <span
                                    class="spinner-border
                                           spinner-border-sm me-2"
                                    aria-hidden="true"
                                ></span>

                                Guardando...
                            {:else}
                                <i class="bi bi-check-circle me-1"></i>

                                {editando
                                    ? "Guardar cambios"
                                    : "Registrar facultad"}
                            {/if}
                        </button>

                        <button
                            type="button"
                            class="btn btn-outline-secondary"
                            onclick={() => {
                                limpiarFormulario();
                                mensaje = "";
                            }}
                            disabled={guardando || cambiandoEstado !== null}
                        >
                            Limpiar
                        </button>

                        {#if editando}
                            <button
                                type="button"
                                class="btn btn-light"
                                onclick={limpiarFormulario}
                                disabled={guardando || cambiandoEstado !== null}
                            >
                                Cancelar edición
                            </button>
                        {/if}
                    </div>
                </form>
            </div>
        </div>

        <!-- TABLA REUTILIZABLE -->

        <DataTable
            data={facultades}
            columns={columnasFacultades}
            actions={accionesFacultades}
            title="Facultades registradas"
            loading={cargando}
            emptyMessage="No hay facultades para mostrar."
            pageSize={5}
        />

    </div>

    <Footer />
</Navbar>
