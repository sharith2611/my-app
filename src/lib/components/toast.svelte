<script>
    import { onMount } from "svelte";

    let message = $state("");
    let type = $state("success");
    let visible = $state(false);
    let toastTimer;

    onMount(() => {
        function showToast(event) {
            message = event.detail?.message ?? "";
            type = event.detail?.type ?? "success";
            visible = Boolean(message);
            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => visible = false, 3500);
        }

        window.addEventListener("app:toast", showToast);
        return () => {
            window.removeEventListener("app:toast", showToast);
            clearTimeout(toastTimer);
        };
    });
</script>

<!-- 5. TOAST -->
<div id="toast" class:error={type === "error"} class:visible class="toast" role="status" aria-live="polite">{message}</div>

<style>
/* 5. NOTIFICACIONES TOAST */

.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 3000;
    max-width: calc(100% - 40px);
    padding: 14px 20px;
    background: #166534;
    color: white;
    border-radius: 10px;
    box-shadow: 0 5px 20px #0002;
    display: none;
}

.toast.visible {
    display: block;
}

.toast.error {
    background: #b91c1c;
}
</style>