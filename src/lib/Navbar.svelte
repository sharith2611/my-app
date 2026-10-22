<script>
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api.js";
    import Logo from "$lib/components/logo.svelte";

    let usuario = $state(null);
    let menu = $state([]);
    let cargandoMenu = $state(true);
    let errorMenu = $state("");

    const rutasModulos = {
        inicio: { nombre: "Inicio", ruta: "/Inicio" },
        usuarios: { nombre: "Usuarios", ruta: "/Usuarios" },
        roles: { nombre: "Roles", ruta: "/Roles" },
        modulos: { nombre: "Módulos", ruta: "/Modulos" },
        "permisos del menu": { nombre: "Permisos del menú", ruta: "/Modulo_rol" },
        estudiantes: { nombre: "Actualizar Datos", ruta: "/Estudiante" },
        convocatorias: { nombre: "Convocatorias", ruta: "/Convocatoria" },
        convocatoria: { nombre: "Convocatoria", ruta: "/Convocatoria" },
        postulaciones: { nombre: "Postulaciones", ruta: "/Postulacion" },
        postulacion: { nombre: "Postulación", ruta: "/Postulacion" },
        adjudicaciones: { nombre: "Adjudicaciones", ruta: "/Adjudicacion" },
        adjudicacion: { nombre: "Adjudicación", ruta: "/Adjudicacion" },
        "programa academico": { nombre: "Programa Académico", ruta: "/Programa_academico" },
        institucion: { nombre: "Institución", ruta: "/Institucion" },
        facultad: { nombre: "Facultad", ruta: "/Facultad" },
        "actualizar datos": { nombre: "Actualizar Datos", ruta: "/Estudiante" },
        estudiante: { nombre: "Actualizar Datos", ruta: "/Estudiante" },
        "auxilio educativo": { nombre: "Auxilio Educativo", ruta: "/Auxilio_educativo" }
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

            const respuesta = await apiFetch(`/modulo-rol/${usuario.id_rol}`);
            if (!Array.isArray(respuesta)) {
                throw new Error("El servidor no devolvió una lista válida de módulos.");
            }

            const opciones = respuesta
                .filter((modulo) => modulo.estado === true)
                .map((modulo) => {
                    const nombreModulo = modulo.nombre_modulo ?? modulo.nombre ?? modulo.modulo ?? "";
                    const configuracion = rutasModulos[normalizarNombre(nombreModulo)];
                    if (!configuracion) console.warn("No hay una ruta configurada para el módulo:", nombreModulo);
                    return configuracion ?? null;
                })
                .filter(Boolean);

            menu = opciones.filter((item, indice, lista) =>
                lista.findIndex((otro) => otro.ruta === item.ruta) === indice
            );
        } catch (error) {
            console.error("Error cargando el menú:", error);
            errorMenu = error?.message || "No fue posible cargar las opciones del menú.";
        } finally {
            cargandoMenu = false;
        }
    }

    onMount(cargarMenu);
</script>

<div class="d-flex min-vh-100">

    <!-- BARRA LATERAL -->
    <aside
        class="bg-primary text-white p-3 d-flex flex-column sidebar"
    >
        <Logo />

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
        :global(.d-flex.min-vh-100) {
            flex-direction: column;
        }

        .sidebar {
            width: 100%;
            min-width: 0;
            height: auto;
            min-height: auto;
            position: relative;
            top: auto;
            overflow: visible;
        }

        main {
            width: 100%;
            min-width: 0;
            padding: 1rem !important;
        }

        :global(.container),
        :global(.container-fluid) {
            max-width: 100%;
            padding-right: 0.75rem;
            padding-left: 0.75rem;
        }
    }
</style>
