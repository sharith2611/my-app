
const API_URL = (
    import.meta.env.VITE_API_URL ||
    "https://api-sistema-gestion-becas-1.onrender.com"
).replace(/\/+$/, "");

export async function apiFetch(endpoint, options = {}) {
    const path = endpoint.startsWith("/")
        ? endpoint
        : `/${endpoint}`;

    const headers = new Headers(options.headers || {});

    // Enviar JSON cuando corresponda.
    if (
        options.body &&
        !(options.body instanceof FormData) &&
        !headers.has("Content-Type")
    ) {
        headers.set("Content-Type", "application/json");
    }

    // Adjuntar el JWT si hay una sesión iniciada en el navegador.
    // No acceder a sessionStorage durante la ejecución del servidor.
    if (
        typeof sessionStorage !== "undefined" &&
        !headers.has("Authorization")
    ) {
        const token = sessionStorage.getItem("access_token");

        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        let message = `Error HTTP ${response.status}`;

        try {
            const data = await response.json();

            message =
                data.detail ||
                data.message ||
                message;
        } catch {
            // La respuesta no contiene JSON.
        }

        throw new Error(
            typeof message === "string"
                ? message
                : JSON.stringify(message)
        );
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export { API_URL };
