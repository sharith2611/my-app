
<script>
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api.js";

    let usuario = $state(null);
    let menu = $state([]);
    let cargandoMenu = $state(true);
    let errorMenu = $state("");

    // Relación entre los nombres de los módulos y las rutas existentes.
    const rutasModulos = {
        "inicio": {
            nombre: "Inicio",
            ruta: "/Inicio"
        },
        "usuarios": {
            nombre: "Usuarios",
            ruta: "/Usuarios"
        },
        "roles": {
            nombre: "Roles",
            ruta: "/Roles"
        },
        "modulos": {
            nombre: "Módulos",
            ruta: "/Modulos"
        },
        "permisos del menu": {
            nombre: "Permisos del menú",
            ruta: "/Modulo_rol"
        },
        "estudiantes": {
            nombre: "Actualizar Datos",
            ruta: "/Estudiante"
        },
        "convocatorias": {
            nombre: "Convocatorias",
            ruta: "/Convocatoria"
        },
        "convocatoria": {
            nombre: "Convocatoria",
            ruta: "/Convocatoria"
        },
        "postulaciones": {
            nombre: "Postulaciones",
            ruta: "/Postulacion"
        },
        "postulacion": {
            nombre: "Postulación",
            ruta: "/Postulacion"
        },
        "adjudicaciones": {
            nombre: "Adjudicaciones",
            ruta: "/Adjudicacion"
        },
        "adjudicacion": {
            nombre: "Adjudicación",
            ruta: "/Adjudicacion"
        },
       
        "programa academico": {
            nombre: "Programa Académico",
            ruta: "/Programa_academico"
        },
        "institucion": {
            nombre: "Institución",
            ruta: "/Institucion"
        },
        "facultad": {
            nombre: "Facultad",
            ruta: "/Facultad"
        },
        "actualizar datos": {
            nombre: "Actualizar Datos",
            ruta: "/Estudiante"
        },
        "estudiante": {
            nombre: "Actualizar Datos",
            ruta: "/Estudiante"
        },
       
        "auxilio educativo": {
            nombre: "Auxilio Educativo",
            ruta: "/Auxilio_educativo"
        }
    };

    function normalizarNombre(nombre) {
        return String(nombre ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toLowerCase();
    }

    async function cargarMenu() {
        cargandoMenu = true;
        errorMenu = "";
        menu = [];

        try {
            const datosUsuario = sessionStorage.getItem("usuario");

            if (!datosUsuario) {
                errorMenu = "No hay una sesión de usuario activa.";
                return;
            }

            usuario = JSON.parse(datosUsuario);

            if (usuario?.id_rol == null) {
                errorMenu = "No se encontró el rol del usuario.";
                return;
            }

            // Consultar los módulos activos asignados al rol del usuario.
            const respuesta = await apiFetch(
                `/modulo-rol/${usuario.id_rol}`
            );

            if (!Array.isArray(respuesta)) {
                console.error(
                    "Respuesta recibida al consultar los módulos:",
                    respuesta
                );

                throw new Error(
                    "El servidor no devolvió una lista válida de módulos. Verifica el endpoint en FastAPI."
                );
            }

            const opciones = respuesta
                .filter((modulo) => modulo.estado === true)
                .map((modulo) => {
                    const nombreModulo =
                        modulo.nombre_modulo ??
                        modulo.nombre ??
                        modulo.modulo ??
                        "";

                    const nombreNormalizado =
                        normalizarNombre(nombreModulo);

                    const configuracion =
                        rutasModulos[nombreNormalizado];

                    if (!configuracion) {
                        console.warn(
                            "No hay una ruta configurada para el módulo:",
                            nombreModulo
                        );

                        return null;
                    }

                    return configuracion;
                })
                .filter((item) => item !== null);

            // Evitar enlaces repetidos.
            menu = opciones.filter(
                (item, indice, lista) =>
                    lista.findIndex(
                        (otro) => otro.ruta === item.ruta
                    ) === indice
            );

        } catch (error) {
            console.error("Error cargando el menú:", error);

            errorMenu =
                error?.message ||
                "No fue posible cargar las opciones del menú.";
        } finally {
            cargandoMenu = false;
        }
    }

    onMount(() => {
        cargarMenu();
    });
</script>

<div class="d-flex min-vh-100">

    <!-- BARRA LATERAL -->
    <aside
        class="bg-primary text-white p-3 d-flex flex-column sidebar"
    >
        <a
            href="/Inicio"
            class="text-white text-decoration-none fs-5 fw-bold mb-4 pb-2 border-bottom border-light border-opacity-25"
        >
            🎓 Sistema de Becas
        </a>

        {#if usuario}
            <div class="mb-3 px-2">
                <div class="fw-semibold">
                    {usuario.nombre}
                </div>

                <small class="text-white-50">
                    Usuario: {usuario.codigo_usuario}
                </small>
            </div>
        {/if}

        {#if cargandoMenu}
            <p class="text-white-50 px-2">
                Cargando menú...
            </p>
        {:else if errorMenu}
            <div class="alert alert-warning py-2">
                {errorMenu}
            </div>
        {:else if menu.length === 0}
            <p class="text-white-50 px-2">
                No hay módulos habilitados para este rol.
            </p>
        {:else}
            <ul class="nav nav-pills flex-column mb-auto gap-1">
                {#each menu as item (item.ruta)}
                    <li class="nav-item">
                        <a
                            class="nav-link text-white py-2 px-3 hover-sidebar"
                            href={item.ruta}
                        >
                            {item.nombre}
                        </a>
                    </li>
                {/each}
            </ul>
        {/if}
    </aside>

    <!-- CONTENIDO PRINCIPAL -->
    <main class="flex-grow-1 p-4 bg-light overflow-auto">
        <slot />
    </main>

</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
    }

    .sidebar {
        width: 260px;
        min-width: 260px;
        height: 100vh;
        position: sticky;
        top: 0;
        overflow-y: auto;
    }

    .hover-sidebar:hover {
        background-color: rgba(255, 255, 255, 0.15);
        border-radius: 6px;
    }

    @media (max-width: 768px) {
        .sidebar {
            width: 220px;
            min-width: 220px;
        }
    }
</style>
