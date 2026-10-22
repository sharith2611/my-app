<script>
  import { onMount } from "svelte";

  let abierto = $state(false);
  let textoGrande = $state(false);
  let altoContraste = $state(false);
  let bodyElement;

  onMount(() => {
    bodyElement = document.body;
  });

  function alternarTexto() {
    textoGrande = !textoGrande;
    bodyElement?.classList.toggle("large-text", textoGrande);
  }

  function alternarContraste() {
    altoContraste = !altoContraste;
    bodyElement?.classList.toggle("high-contrast", altoContraste);
  }

  function restablecer() {
    textoGrande = false;
    altoContraste = false;
    bodyElement?.classList.remove("large-text", "high-contrast");
  }
</script>

<!-- 9. ACCESIBILIDAD -->
<div class="accessibility">
<div id="accessibilityPanel" class:visible={abierto} class="accessibility-panel">
    <strong>Accesibilidad</strong>

    <button class="btn" id="largeText" onclick={alternarTexto}>
    Aumentar texto
    </button>

    <button class="btn" id="highContrast" onclick={alternarContraste}>
    Alto contraste
    </button>

    <button class="btn btn-secondary" id="resetAccessibility" onclick={restablecer}>
    Restablecer
    </button>
</div>

<button
    id="accessibilityToggle"
    class="accessibility-toggle"
    aria-label="Abrir opciones de accesibilidad"
    aria-expanded={abierto}
    onclick={() => abierto = !abierto}
>♿</button>
</div>

<style>
    /* 9. ACCESIBILIDAD */

    :global(body.large-text) {
      font-size: 20px;
    }

    :global(body.high-contrast) {
      color: #000;
      background: #fff;
    }

    :global(body.high-contrast .demo-section),
    :global(body.high-contrast .header) {
      border: 2px solid #000;
    }

    .accessibility {
      position: fixed;
      left: 20px;
      bottom: 20px;
      z-index: 900;
    }

    .accessibility-toggle {
      width: 48px;
      height: 48px;
      border: 0;
      border-radius: 50%;
      background: #1d4ed8;
      color: white;
      font-size: 23px;
    }

    .accessibility-panel {
      display: none;
      width: 230px;
      margin-bottom: 10px;
      padding: 16px;
      background: white;
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: 0 5px 20px #0002;
    }

    .accessibility-panel.visible {
      display: grid;
      gap: 10px;
    }
</style>