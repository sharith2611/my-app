
<script src="./Estudiante.js"></script>

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

        <!-- FORMULARIO DE REGISTRO Y EDICIÓN -->
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

        <!-- TABLA VISIBLE SOLAMENTE PARA EL ADMINISTRADOR -->
        {#if esAdministrador}
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
        {/if}
    </div>

    <Footer />
</Navbar>
