
<script>
    let {
        data = [],
        columns = [],
        title = "Registros",
        loading = false,
        emptyMessage = "No hay registros para mostrar.",
        pageSize = 5,
        actions = [],
        showSearch = true
    } = $props();

    let busqueda = $state("");
    let paginaActual = $state(1);
    let columnaOrden = $state("");
    let ordenAscendente = $state(true);

    // Obtener el valor de una columna, incluso si es calculado.
    function obtenerValor(fila, columna) {
        if (typeof columna.value === "function") {
            return columna.value(fila);
        }

        return fila[columna.key];
    }

    // Convertir los valores en texto para realizar la búsqueda.
    function textoCelda(fila, columna) {
        const valor = obtenerValor(fila, columna);

        return valor == null ? "" : String(valor);
    }

    // Búsqueda general en las columnas configuradas.
    let datosFiltrados = $derived.by(() => {
        const texto = busqueda.trim().toLowerCase();

        if (!texto) return data;

        return data.filter(fila =>
            columns.some(columna =>
                textoCelda(fila, columna)
                    .toLowerCase()
                    .includes(texto)
            )
        );
    });

    // Ordenar por la columna seleccionada.
    let datosOrdenados = $derived.by(() => {
        if (!columnaOrden) return datosFiltrados;

        const columna = columns.find(
            item => item.key === columnaOrden
        );

        if (!columna) return datosFiltrados;

        return [...datosFiltrados].sort((a, b) => {
            const valorA = obtenerValor(a, columna);
            const valorB = obtenerValor(b, columna);

            let resultado;

            if (
                typeof valorA === "number" &&
                typeof valorB === "number"
            ) {
                resultado = valorA - valorB;
            } else {
                resultado = String(valorA ?? "").localeCompare(
                    String(valorB ?? ""),
                    "es",
                    { numeric: true, sensitivity: "base" }
                );
            }

            return ordenAscendente ? resultado : -resultado;
        });
    });

    let totalPaginas = $derived(
        Math.max(1, Math.ceil(datosOrdenados.length / pageSize))
    );

    let datosPaginados = $derived(
        datosOrdenados.slice(
            (paginaActual - 1) * pageSize,
            paginaActual * pageSize
        )
    );

    let inicioRegistro = $derived(
        datosOrdenados.length === 0
            ? 0
            : (paginaActual - 1) * pageSize + 1
    );

    let finRegistro = $derived(
        Math.min(paginaActual * pageSize, datosOrdenados.length)
    );

    function buscar() {
        paginaActual = 1;
    }

    function cambiarOrden(columna) {
        if (columna.sortable === false) return;

        if (columnaOrden === columna.key) {
            ordenAscendente = !ordenAscendente;
        } else {
            columnaOrden = columna.key;
            ordenAscendente = true;
        }

        paginaActual = 1;
    }

    function cambiarPagina(pagina) {
        paginaActual = Math.max(
            1,
            Math.min(pagina, totalPaginas)
        );
    }
</script>

<div class="card border-0 shadow-sm">
    <div
        class="card-header bg-dark text-white py-3
               d-flex justify-content-between align-items-center gap-2"
    >
        <h5 class="mb-0">{title}</h5>

        <span class="badge bg-light text-dark">
            {datosOrdenados.length} registros
        </span>
    </div>

    <div class="card-body p-3 p-md-4">
        {#if showSearch}
            <div class="row mb-3">
                <div class="col-md-6 col-lg-5">
                    <label class="form-label" for="data-table-search">
                        Buscar registros
                    </label>

                    <input
                        id="data-table-search"
                        type="search"
                        class="form-control"
                        placeholder="Escribe para buscar..."
                        bind:value={busqueda}
                        oninput={buscar}
                    />
                </div>
            </div>
        {/if}

        {#if loading}
            <div class="text-center py-5">
                <div
                    class="spinner-border text-primary"
                    role="status"
                >
                    <span class="visually-hidden">Cargando...</span>
                </div>

                <p class="text-muted mt-3 mb-0">
                    Consultando información...
                </p>
            </div>
        {:else if datosOrdenados.length === 0}
            <div class="text-center py-5">
                <i class="bi bi-inbox display-4 text-muted"></i>

                <h6 class="mt-3">{emptyMessage}</h6>

                <p class="text-muted mb-0">
                    Intenta modificar la búsqueda.
                </p>
            </div>
        {:else}
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead class="table-light">
                        <tr>
                            {#each columns as columna (columna.key)}
                                <th>
                                    {#if columna.sortable !== false}
                                        <button
                                            type="button"
                                            class="btn btn-link text-dark
                                                   text-decoration-none
                                                   fw-semibold p-0"
                                            onclick={() =>
                                                cambiarOrden(columna)}
                                        >
                                            {columna.label}

                                            {#if columnaOrden === columna.key}
                                                <i
                                                    class={ordenAscendente
                                                        ? "bi bi-arrow-up"
                                                        : "bi bi-arrow-down"}
                                                ></i>
                                            {:else}
                                                <i class="bi bi-arrow-down-up text-muted"></i>
                                            {/if}
                                        </button>
                                    {:else}
                                        {columna.label}
                                    {/if}
                                </th>
                            {/each}

                            {#if actions.length > 0}
                                <th class="text-center">Acciones</th>
                            {/if}
                        </tr>
                    </thead>

                    <tbody>
                        {#each datosPaginados as fila, indice
                            (`${paginaActual}-${indice}-${columns.map(c => obtenerValor(fila, c)).join("|")}`)}
                            <tr>
                                {#each columns as columna (columna.key)}
                                    <td>
                                        {#if columna.type === "status"}
                                            <span
                                                class="badge {obtenerValor(fila, columna)
                                                    ? (columna.trueClass ?? 'bg-success')
                                                    : (columna.falseClass ?? 'bg-secondary')}"
                                            >
                                                {obtenerValor(fila, columna)
                                                    ? (columna.trueLabel ?? "Activo")
                                                    : (columna.falseLabel ?? "Inactivo")}
                                            </span>
                                        {:else}
                                            {textoCelda(fila, columna) || "—"}
                                        {/if}
                                    </td>
                                {/each}

                                {#if actions.length > 0}
                                    <td>
                                        <div
                                            class="d-flex justify-content-center
                                                   flex-wrap gap-1"
                                        >
                                            {#each actions as accion}
                                                <button
                                                    type="button"
                                                    class={accion.className ??
                                                        "btn btn-sm btn-outline-primary"}
                                                    title={accion.title ??
                                                        accion.label}
                                                    aria-label={`${accion.label}`}
                                                    onclick={() =>
                                                        accion.onClick(fila)}
                                                    disabled={
                                                        typeof accion.disabled === "function"
                                                            ? accion.disabled(fila)
                                                            : (accion.disabled ?? false)
                                                    }
                                                >
                                                    {#if accion.icon}
                                                        <i class={accion.icon}></i>
                                                    {:else}
                                                        {accion.label}
                                                    {/if}
                                                </button>
                                            {/each}
                                        </div>
                                    </td>
                                {/if}
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <div
                class="d-flex flex-wrap justify-content-between
                       align-items-center gap-3 mt-3"
            >
                <small class="text-muted">
                    Mostrando {inicioRegistro}–{finRegistro}
                    de {datosOrdenados.length} registros
                </small>

                <nav aria-label="Paginación de registros">
                    <ul class="pagination pagination-sm mb-0">
                        <li class:disabled={paginaActual === 1}
                            class="page-item">
                            <button
                                type="button"
                                class="page-link"
                                disabled={paginaActual === 1}
                                onclick={() =>
                                    cambiarPagina(paginaActual - 1)}
                            >
                                Anterior
                            </button>
                        </li>

                        {#each Array.from(
                            { length: totalPaginas },
                            (_, i) => i + 1
                        ) as pagina}
                            <li
                                class:active={pagina === paginaActual}
                                class="page-item"
                            >
                                <button
                                    type="button"
                                    class="page-link"
                                    aria-current={pagina === paginaActual
                                        ? "page"
                                        : undefined}
                                    onclick={() => cambiarPagina(pagina)}
                                >
                                    {pagina}
                                </button>
                            </li>
                        {/each}

                        <li
                            class:disabled={paginaActual === totalPaginas}
                            class="page-item"
                        >
                            <button
                                type="button"
                                class="page-link"
                                disabled={paginaActual === totalPaginas}
                                onclick={() =>
                                    cambiarPagina(paginaActual + 1)}
                            >
                                Siguiente
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        {/if}
    </div>
</div>
