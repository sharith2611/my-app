// 9. ACCESIBILIDAD
    const accessibilityPanel =
      document.getElementById("accessibilityPanel");

    const accessibilityToggle =
      document.getElementById("accessibilityToggle");

    accessibilityToggle.addEventListener("click", () => {
      const isOpen = accessibilityPanel.classList.toggle("visible");
      accessibilityToggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.getElementById("largeText").addEventListener("click", () => {
      document.body.classList.toggle("large-text");
    });

    document.getElementById("highContrast").addEventListener("click", () => {
      document.body.classList.toggle("high-contrast");
    });

    document.getElementById("resetAccessibility").addEventListener(
      "click", () => {
        document.body.classList.remove("large-text", "high-contrast");
      }
    );
