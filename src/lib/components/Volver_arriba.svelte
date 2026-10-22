<!-- 3. VOLVER ARRIBA -->
<script>
    import { onMount } from "svelte";

    let visible = $state(false);

    onMount(() => {
        const actualizarVisibilidad = () => visible = window.scrollY > 300;
        window.addEventListener("scroll", actualizarVisibilidad, { passive: true });
        return () => window.removeEventListener("scroll", actualizarVisibilidad);
    });
</script>
<button
    id="backTop"
    class:visible
    class="back-top"
    aria-label="Volver al inicio"
    title="Volver arriba"
    onclick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
>↑</button>

<style>
/* 3. VOLVER ARRIBA */

.back-top {
    position: fixed;
    right: 28px;
    bottom: 95px;
    z-index: 999;
    width: 44px;
    height: 44px;
    border: 0;
    border-radius: 50%;
    background: #1f2937;
    color: white;
    font-size: 22px;
    display: none;
}

.back-top.visible {
    display: block;
}
</style>
