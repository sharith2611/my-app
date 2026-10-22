<script src="./Adjudicacion.js"></script>

<Navbar>
    <div class="container-fluid py-3">
        <div class="mb-4">
            <h2 class="fw-bold text-primary">
                Gestión de Adjudicaciones
            </h2>

            <p class="text-secondary mb-0">
                Registra, consulta y actualiza las adjudicaciones
                asociadas a las postulaciones.
            </p>
        </div>

        {#if mensaje}
            <div
                class="alert alert-{tipoMensaje}"
                role="alert"
                aria-live="polite"
            >
                {mensaje}
            </div>
        {/if}

        <div
            class="card shadow-sm border-0 mb-4"
            id="formulario-adjudicacion"
        >
            <div class="card-header bg-primary text-white py-3">
                <h5 class="mb-0">
                    {editando
                        ? "Editar adjudicación"
                        : "Registrar adjudicación"}
                </h5>
            </div>

            <div class="card-body p-4">
                <form onsubmit={guardarAdjudicacion}>
                    <div class="row">
                        <div class="col-12 col-lg-6 mb-3">
                            <label
                                for="postulacion"
                                class="form-label fw-semibold"
                            >
                                Postulación pendiente
                            </label>

                            <select
                                id="postulacion"
                                class="form-select"
                                bind:value={idPostulacion}
                                required
                                disabled={
                                    guardando ||
                                    cargandoPostulaciones ||
                                    editando
                                }
                            >
                                <option value="">
                                    Selecciona una postulación
                                </option>

                                {#each postulaciones as postulacion}
                                    <option
                                        value={String(
                                            postulacion.id_postulacion
                                        )}
                                    >
                                        {obtenerNombrePostulacion(
                                            postulacion
                                        )}
                                    </option>
                                {/each}

                                {#if editando && idPostulacion && !postulaciones.some((p) => String(p.id_postulacion) === String(idPostulacion))}
                                    <option value={idPostulacion}>
                                        Postulación {idPostulacion} (actual)
                                    </option>
                                {/if}
                            </select>

                            {#if cargandoPostulaciones}
                                <div class="form-text">
                                    Cargando postulaciones...
                                </div>
                            {:else if postulaciones.length === 0 && !editando}
                                <div class="form-text text-danger">
                                    No hay postulaciones con escala pendiente.
                                </div>
                            {/if}
                        </div>

                        <div class="col-12 col-lg-6 mb-3">
                            <label
                                for="fechaAdjudicacion"
                                class="form-label fw-semibold"
                            >
                                Fecha de adjudicación
                            </label>

                            <input
                                id="fechaAdjudicacion"
                                type="date"
                                class="form-control"
                                bind:value={fechaAdjudicacion}
                                required
                                disabled={guardando}
                            />
                        </div>

                        <div class="col-12 col-lg-6 mb-3">
                            <label
                                for="resultado"
                                class="form-label fw-semibold"
                            >
                                Resultado
                            </label>

                            <select
                                id="resultado"
                                class="form-select"
                                bind:value={resultado}
                                required
                                disabled={guardando}
                            >
                                <option value="">
                                    Selecciona un resultado
                                </option>
                                <option value="Aprobada">
                                    Aprobada
                                </option>
                                <option value="Rechazada">
                                    Rechazada
                                </option>
                                <option value="Pendiente">
                                    Pendiente
                                </option>
                            </select>
                        </div>

                        <div class="col-12 col-lg-6 mb-3">
                            <label
                                for="porcentaje"
                                class="form-label fw-semibold"
                            >
                                Porcentaje aprobado
                            </label>

                            <div class="input-group">
                                <input
                                    id="porcentaje"
                                    type="number"
                                    class="form-control"
                                    bind:value={porcentajeAprobado}
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    placeholder="Ej. 80"
                                    disabled={guardando}
                                />

                                <span class="input-group-text">%</span>
                            </div>
                        </div>

                        <div class="col-12 col-lg-6 mb-3">
                            <label
                                for="monto"
                                class="form-label fw-semibold"
                            >
                                Monto aprobado (COP)
                            </label>

                            <input
                                id="monto"
                                type="number"
                                class="form-control"
                                bind:value={montoAprobado}
                                min="0"
                                step="0.01"
                                placeholder="Ingresa el monto aprobado"
                                disabled={guardando}
                            />
                        </div>

                        <div class="col-12 col-lg-6 mb-3">
                            <label
                                for="estado"
                                class="form-label fw-semibold"
                            >
                                Estado del registro
                            </label>

                            <select
                                id="estado"
                                class="form-select"
                                bind:value={estado}
                                disabled={guardando}
                            >
                                <option value={true}>Activo</option>
                                <option value={false}>Inactivo</option>
                            </select>
                        </div>

                        <div class="col-12 mb-3">
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
                                placeholder="Escribe observaciones adicionales."
                                disabled={guardando}
                            ></textarea>
                        </div>
                    </div>

                    <div
                        class="d-flex flex-column flex-sm-row justify-content-end gap-2"
                    >
                        <button
                            type="button"
                            class="btn btn-outline-secondary"
                            onclick={() => {
                                limpiarFormulario();
                                mensaje = "";
                            }}
                            disabled={guardando}
                        >
                            Limpiar
                        </button>

                        <button
                            type="submit"
                            class="btn btn-primary"
                            disabled={
                                guardando ||
                                cargandoPostulaciones ||
                                (!editando && postulaciones.length === 0)
                            }
                        >
                            {#if guardando}
                                <span
                                    class="spinner-border spinner-border-sm me-2"
                                    aria-hidden="true"
                                ></span>
                                Guardando...
                            {:else}
                                {editando
                                    ? "Actualizar adjudicación"
                                    : "Registrar adjudicación"}
                            {/if}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <DataTable
            data={adjudicaciones}
            columns={columnasAdjudicaciones}
            actions={accionesAdjudicaciones}
            title="Adjudicaciones registradas"
            loading={cargando || guardando}
            emptyMessage="No hay adjudicaciones registradas."
            pageSize={5}
            showSearch={true}
        />
    </div>

    <Footer />
</Navbar>
