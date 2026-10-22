
<script src="./Auxilio_educativo.js"></script>

<Navbar>
    <div class="container py-4">
        <h2 class="fw-bold mb-4">
            Gestión de Auxilios Educativos
        </h2>

        {#if mensaje}
            <div
                class={`alert alert-${tipoMensaje} alert-dismissible`}
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

        <div class="card shadow-sm" id="formulario-auxilio">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">
                    {editando
                        ? "Editar auxilio educativo"
                        : "Registrar auxilio educativo"}
                </h5>
            </div>

            <div class="card-body">
                <form onsubmit={guardarAuxilio}>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label
                                for="facultad"
                                class="form-label"
                            >
                                Facultad *
                            </label>

                            <select
                                id="facultad"
                                class="form-select"
                                bind:value={idFacultad}
                                required
                            >
                                <option value="">
                                    Seleccione una facultad
                                </option>

                                {#each facultades as facultad}
                                    <option
                                        value={String(
                                            facultad.id_facultad ??
                                            facultad.id
                                        )}
                                    >
                                        {facultad.nombre ??
                                            facultad.nombre_facultad}
                                    </option>
                                {/each}
                            </select>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label
                                for="nombre"
                                class="form-label"
                            >
                                Nombre del auxilio *
                            </label>

                            <input
                                id="nombre"
                                class="form-control"
                                bind:value={nombre}
                                placeholder="Nombre del auxilio"
                                maxlength="150"
                                required
                            />
                        </div>

                        <div class="col-md-6 mb-3">
                            <label
                                for="tipo"
                                class="form-label"
                            >
                                Tipo de auxilio *
                            </label>

                            <select
                                id="tipo"
                                class="form-select"
                                bind:value={tipoAuxilio}
                                required
                            >
                                <option value="">
                                    Seleccione
                                </option>
                                <option value="Matrícula">
                                    Matrícula
                                </option>
                                <option value="Transporte">
                                    Transporte
                                </option>
                                <option value="Beca">
                                    Beca
                                </option>
                                <option value="Alimentación">
                                    Alimentación
                                </option>
                            </select>
                        </div>

                        <div class="col-md-3 mb-3">
                            <label
                                for="porcentaje"
                                class="form-label"
                            >
                                Porcentaje máximo
                            </label>

                            <div class="input-group">
                                <input
                                    id="porcentaje"
                                    class="form-control"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    bind:value={porcentajeMaximo}
                                    required
                                />
                                <span class="input-group-text">%</span>
                            </div>
                        </div>

                        <div class="col-md-3 mb-3">
                            <label
                                for="monto"
                                class="form-label"
                            >
                                Monto máximo (COP)
                            </label>

                            <input
                                id="monto"
                                class="form-control"
                                type="number"
                                min="0"
                                step="0.01"
                                bind:value={montoMaximo}
                                required
                            />
                        </div>

                        <div class="col-12 mb-3">
                            <label
                                for="descripcion"
                                class="form-label"
                            >
                                Descripción *
                            </label>

                            <textarea
                                id="descripcion"
                                class="form-control"
                                rows="3"
                                bind:value={descripcion}
                                placeholder="Descripción del auxilio educativo"
                                required
                            ></textarea>
                        </div>

                        {#if editando}
                            <div class="col-12 mb-3">
                                <div class="form-check form-switch">
                                    <input
                                        id="estado"
                                        class="form-check-input"
                                        type="checkbox"
                                        bind:checked={estado}
                                    />
                                    <label
                                        class="form-check-label"
                                        for="estado"
                                    >
                                        Auxilio activo
                                    </label>
                                </div>
                            </div>
                        {/if}
                    </div>

                    <button
                        type="submit"
                        class="btn btn-primary"
                        disabled={guardando || procesando}
                    >
                        {#if guardando}
                            Guardando...
                        {:else}
                            {editando
                                ? "Actualizar auxilio"
                                : "Guardar auxilio"}
                        {/if}
                    </button>

                    <button
                        type="button"
                        class="btn btn-secondary ms-2"
                        onclick={limpiarFormulario}
                        disabled={guardando}
                    >
                        {editando ? "Cancelar edición" : "Limpiar"}
                    </button>
                </form>
            </div>
        </div>

        <div class="card shadow-sm mt-5">
            <div class="card-header bg-dark text-white">
                <h5 class="mb-0">Auxilios registrados</h5>
            </div>

            <div class="card-body">
                <DataTable
                    data={auxilios}
                    columns={columnasAuxilios}
                    actions={accionesAuxilios}
                    title="Listado de auxilios educativos"
                    loading={cargando}
                    emptyMessage="No hay auxilios educativos registrados."
                    pageSize={5}
                />
            </div>
        </div>
    </div>

    <Footer />
</Navbar>
