
<script src="./Requisito_convocatoria.js"></script>

<svelte:head>
    <title>Requisitos de Convocatoria</title>
</svelte:head>

<div class="container py-4">

    <div class="mb-4">
        <button
            type="button"
            class="btn btn-outline-secondary mb-3"
            onclick={onCerrar}
        >
            <i class="bi bi-arrow-left me-1"></i>
            Volver a convocatorias
        </button>

        <h2 class="fw-bold">Requisitos de Convocatoria</h2>

        <p class="text-muted">
            Asignación de requisitos a las convocatorias
        </p>

        <p>
            <strong>Convocatoria:</strong>
            {nombreConvocatoria}
        </p>
    </div>

    {#if mensaje}
        <div class="alert alert-{tipoMensaje}" role="alert">
            {mensaje}

            <button
                type="button"
                class="btn-close float-end"
                aria-label="Cerrar mensaje"
                onclick={() => mensaje = ""}
            ></button>
        </div>
    {/if}

    <div class="card shadow-sm">
        <div class="card-header bg-primary text-white">
            <h5 class="mb-0">
                {editando ? "Editar requisito" : "Asignar requisito"}
            </h5>
        </div>

        <div class="card-body">
            <form onsubmit={guardarRequisito}>
                <div class="row">

                    <div class="col-md-6 mb-3">
                        <label for="descripcion" class="form-label">
                            Descripción del requisito
                        </label>

                        <input
                            id="descripcion"
                            class="form-control"
                            type="text"
                            bind:value={descripcion}
                            placeholder="Ej. Certificado de notas"
                            maxlength="500"
                            required
                        />
                    </div>

                    <div class="col-md-3 mb-3">
                        <label for="obligatorio" class="form-label">
                            Obligatorio
                        </label>

                        <select
                            id="obligatorio"
                            class="form-select"
                            bind:value={obligatorio}
                            required
                        >
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                        </select>
                    </div>

                    <div class="col-md-3 mb-3">
                        <label for="valorMinimo" class="form-label">
                            Valor mínimo
                        </label>

                        <input
                            id="valorMinimo"
                            class="form-control"
                            type="number"
                            min="0"
                            step="any"
                            bind:value={valorMinimo}
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    class="btn btn-primary"
                    disabled={guardando || procesando || !idConvocatoria}
                >
                    {#if guardando}
                        <span class="spinner-border spinner-border-sm me-1"></span>
                        Guardando...
                    {:else}
                        <i class="bi bi-check-circle me-1"></i>
                        {editando ? "Guardar cambios" : "Asignar requisito"}
                    {/if}
                </button>

                <button
                    type="button"
                    class="btn btn-secondary ms-2"
                    onclick={limpiarFormulario}
                    disabled={guardando || procesando}
                >
                    Limpiar
                </button>
            </form>
        </div>
    </div>

    <div class="card shadow-sm mt-5">
        <div class="card-header bg-dark text-white">
            <h5 class="mb-0">
                Requisitos asignados a la convocatoria
            </h5>
        </div>

        <div class="card-body">

            {#if cargando}
                <div class="text-center py-4">
                    <div
                        class="spinner-border text-primary"
                        role="status"
                    >
                        <span class="visually-hidden">
                            Cargando...
                        </span>
                    </div>

                    <p class="text-muted mt-2">
                        Cargando requisitos...
                    </p>
                </div>

            {:else}
                <div class="table-responsive">
                    <table class="table table-striped table-hover align-middle">

                        <thead>
                            <tr>
                                <th>Descripción</th>
                                <th>Obligatorio</th>
                                <th>Valor mínimo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {#each requisitosFiltrados as registro (registro.id_requisito_convocatoria)}
                                <tr>
                                    <td>{registro.descripcion}</td>

                                    <td>
                                        {#if registro.obligatorio}
                                            <span class="badge bg-danger">
                                                Sí
                                            </span>
                                        {:else}
                                            <span class="badge bg-secondary">
                                                No
                                            </span>
                                        {/if}
                                    </td>

                                    <td>
                                        {Number(
                                            registro.valor_minimo ?? 0
                                        ).toLocaleString("es-CO")}
                                    </td>

                                    <td>
                                        {#if registro.estado !== false}
                                            <span class="badge bg-success">
                                                Activo
                                            </span>
                                        {:else}
                                            <span class="badge bg-secondary">
                                                Inactivo
                                            </span>
                                        {/if}
                                    </td>

                                    <td class="text-nowrap">
                                        <button
                                            type="button"
                                            class="btn btn-sm btn-warning"
                                            onclick={() => editarRequisito(registro)}
                                            disabled={procesando || guardando}
                                        >
                                            <i class="bi bi-pencil me-1"></i>
                                            Editar
                                        </button>

                                        <button
                                            type="button"
                                            class="btn btn-sm ms-1 {registro.estado !== false ? 'btn-danger' : 'btn-success'}"
                                            onclick={() => cambiarEstado(registro)}
                                            disabled={procesando || guardando}
                                        >
                                            {registro.estado !== false
                                                ? "Desactivar"
                                                : "Activar"}
                                        </button>
                                    </td>
                                </tr>

                            {:else}
                                <tr>
                                    <td
                                        colspan="5"
                                        class="text-center text-muted py-4"
                                    >
                                        No hay requisitos registrados para esta convocatoria.
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
