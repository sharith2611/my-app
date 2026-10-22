

<script>
    import { goto } from "$app/navigation";
    import { apiFetch } from "$lib/api.js";

    let usuario = $state("");
    let clave = $state("");
    let mostrarClave = $state(false);
    let cargando = $state(false);
    let mensaje = $state("");
    let tipoMensaje = $state("danger");

    async function iniciarSesion(event) {
        event.preventDefault();

        if (cargando) return;

        mensaje = "";

        const codigoIngresado = usuario.trim().toUpperCase();

        if (!codigoIngresado || !clave) {
            mensaje = "Por favor, ingresa tu usuario y clave.";
            return;
        }

        cargando = true;

        try {
            // Enviar las credenciales al backend para autenticarlas con JWT.
            const respuesta = await apiFetch("/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    codigo_usuario: codigoIngresado,
                    clave: clave
                })
            });

            // Comprobar que el backend haya devuelto los datos esperados.
            if (!respuesta?.access_token || !respuesta?.usuario) {
                throw new Error(
                    "El servidor no devolvió los datos de autenticación esperados."
                );
            }

            const usuarioAutenticado = respuesta.usuario;

            if (
                usuarioAutenticado.id_usuario == null ||
                usuarioAutenticado.id_rol == null
            ) {
                throw new Error(
                    "Los datos del usuario están incompletos."
                );
            }

            // Guardar el token JWT.
            sessionStorage.setItem(
                "access_token",
                respuesta.access_token
            );

            // Mantener los datos del usuario para la navegación y el menú.
            sessionStorage.setItem(
                "usuario",
                JSON.stringify({
                    id_usuario: usuarioAutenticado.id_usuario,
                    codigo_usuario: usuarioAutenticado.codigo_usuario,
                    nombre: usuarioAutenticado.nombre,
                    cedula: usuarioAutenticado.cedula ?? null,
                    id_rol: usuarioAutenticado.id_rol
                })
            );

            // Limpiar la clave del formulario.
            clave = "";

            await goto("/Inicio");

        } catch (error) {
            console.error("Error al iniciar sesión:", error);

            mensaje =
                error?.message ||
                "No fue posible conectar con el servidor. Inténtalo nuevamente.";

            tipoMensaje = "danger";

        } finally {
            cargando = false;
        }
    }
</script>

<svelte:head>
    <title>Iniciar sesión | Gestión de Becas</title>
    <meta
        name="description"
        content="Inicio de sesión del sistema de gestión de becas y ayudas financieras."
    />
</svelte:head>

<div class="pagina-login">
    <div class="container">
        <div class="row justify-content-center align-items-center min-vh-100 py-4">
            <div class="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">
                <div class="text-center mb-4">
                    <div class="icono-institucional mx-auto mb-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="42"
                            height="42"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.7"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                        >
                            <path d="m2 10 10-6 10 6-10 6-10-6Z" />
                            <path d="M6 12.5V17c3.5 3 8.5 3 12 0v-4.5" />
                            <path d="M22 10v6" />
                        </svg>
                    </div>

                    <h2 class="fw-bold text-primary mb-2">
                        Gestión de Becas
                    </h2>

                    <p class="text-secondary mb-0">
                        Sistema de becas y ayudas financieras
                    </p>
                </div>

                <div class="card shadow border-0">
                    <div class="card-header bg-primary text-white text-center py-3">
                        <h5 class="mb-0 fw-bold">Iniciar sesión</h5>
                    </div>

                    <div class="card-body p-4 p-md-5">
                        <p class="text-secondary text-center mb-4">
                            Ingresa tus credenciales para continuar.
                        </p>

                        <form onsubmit={iniciarSesion}>
                            <div class="mb-3">
                                <label for="usuario" class="form-label fw-semibold">
                                    Usuario
                                </label>

                                <div class="input-group">
                                    <span class="input-group-text bg-light">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="1.7"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            aria-hidden="true"
                                        >
                                            <circle cx="12" cy="8" r="4" />
                                            <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
                                        </svg>
                                    </span>

                                    <input
                                        id="usuario"
                                        name="usuario"
                                        type="text"
                                        class="form-control"
                                        placeholder="Ingresa tu usuario"
                                        bind:value={usuario}
                                        autocomplete="username"
                                        autocapitalize="characters"
                                        required
                                        disabled={cargando}
                                    />
                                </div>
                            </div>

                            <div class="mb-3">
                                <label for="clave" class="form-label fw-semibold">
                                    Clave
                                </label>

                                <div class="input-group">
                                    <span class="input-group-text bg-light">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="1.7"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            aria-hidden="true"
                                        >
                                            <rect x="3" y="10" width="18" height="11" rx="2" />
                                            <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                                        </svg>
                                    </span>

                                    <input
                                        id="clave"
                                        name="clave"
                                        type={mostrarClave ? "text" : "password"}
                                        class="form-control"
                                        placeholder="Ingresa tu clave"
                                        bind:value={clave}
                                        autocomplete="current-password"
                                        required
                                        disabled={cargando}
                                    />

                                    <button
                                        type="button"
                                        class="btn btn-outline-secondary"
                                        onclick={() => mostrarClave = !mostrarClave}
                                        aria-label={mostrarClave ? "Ocultar clave" : "Mostrar clave"}
                                        title={mostrarClave ? "Ocultar clave" : "Mostrar clave"}
                                        disabled={cargando}
                                    >
                                        {#if mostrarClave}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="1.7"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                aria-hidden="true"
                                            >
                                                <path d="M3 3l18 18" />
                                                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                                                <path d="M9.9 5.2A11 11 0 0 1 12 5c5 0 9 5 9 7a9 9 0 0 1-3 3.8" />
                                                <path d="M6.2 6.2C3.8 7.7 2 10.3 2 12c0 2 4 7 10 7 1 0 2-.2 2.9-.5" />
                                            </svg>
                                        {:else}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="1.7"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                aria-hidden="true"
                                            >
                                                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        {/if}
                                    </button>
                                </div>
                            </div>

                            {#if mensaje}
                                <div
                                    class="alert alert-{tipoMensaje} py-2 mt-3"
                                    role="alert"
                                    aria-live="polite"
                                >
                                    {mensaje}
                                </div>
                            {/if}

                            <button
                                type="submit"
                                class="btn btn-primary w-100 py-2 mt-3 fw-semibold"
                                disabled={cargando}
                            >
                                {#if cargando}
                                    Validando...
                                {:else}
                                    Iniciar sesión
                                {/if}
                            </button>
                        </form>
                    </div>
                </div>

                <p class="text-center text-secondary small mt-4">
                    Sistema de Gestión de Becas y Ayudas Financieras
                </p>
            </div>
        </div>
    </div>
</div>

<style>
    .pagina-login {
        min-height: 100vh;
        background: linear-gradient(135deg, #f4f7fb 0%, #e8eff8 100%);
    }

    .icono-institucional {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 76px;
        height: 76px;
        border-radius: 50%;
        color: var(--campus-blue);
        background: #ffffff;
        box-shadow: 0 4px 15px rgb(0 0 0 / 8%);
    }

    .card {
        border-radius: 12px;
        overflow: hidden;
    }

    .card-header {
        border-bottom: none;
    }

    .form-control,
    .input-group-text,
    .input-group .btn {
        min-height: 44px;
    }

    .form-control:focus {
        border-color: #86b7fe;
        box-shadow: 0 0 0 0.2rem rgb(13 110 253 / 15%);
    }

    .btn-primary {
        transition: background-color 0.2s ease;
    }

    @media (max-width: 575px) {
        .card-body {
            padding: 1.5rem !important;
        }
    }
</style>
