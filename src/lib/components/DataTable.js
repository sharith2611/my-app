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