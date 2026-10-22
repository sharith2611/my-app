// 5. NOTIFICACIONES TOAST
let toastTimer;

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.toggle("error", type === "error");
    toast.classList.add("visible");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
    toast.classList.remove("visible");
    }, 3000);
}