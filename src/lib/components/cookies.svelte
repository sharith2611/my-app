<script>
    import { onMount } from "svelte";

    let visible = $state(false);

    function saveCookieChoice(choice) {
        try {
            localStorage.setItem("cookieChoice", choice);
        } catch {
            console.warn("No se pudo guardar la preferencia.");
        }
        visible = false;
    }

    onMount(() => {
        try {
            visible = !localStorage.getItem("cookieChoice");
        } catch {
            visible = true;
        }
    });
</script>

<!-- 4. COOKIES -->
<aside id="cookieBanner" class="cookie-banner" hidden={!visible}>
<h2>Usamos cookies</h2>
<p>
    Utilizamos cookies para mejorar tu experiencia.
    Puedes aceptar o rechazar las cookies opcionales.
</p>

<div class="cookie-actions">
    <button class="btn" id="acceptCookies" onclick={() => saveCookieChoice("accepted")}>Aceptar</button>
    <button class="btn btn-secondary" id="rejectCookies" onclick={() => saveCookieChoice("rejected")}>
    Rechazar opcionales
    </button>
</div>
</aside>

<style>

/* 4. AVISO DE COOKIES */

.cookie-banner {
    position: fixed;
    bottom: 16px;
    left: 16px;
    z-index: 2000;
    width: min(420px, calc(100% - 32px));
    padding: 22px;
    background: white;
    border: 1px solid var(--border);
    border-radius: 14px;
    box-shadow: 0 8px 30px #0002;
}

.cookie-banner p {
    font-size: 14px;
}

.cookie-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
</style>