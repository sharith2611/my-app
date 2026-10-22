// Guarda la preferencia elegida.
const cookieBanner = document.getElementById("cookieBanner");

try {
    const cookieChoice = localStorage.getItem("cookieChoice");

    if (!cookieChoice) {
    cookieBanner.hidden = false;
    }
} catch (error) {
    cookieBanner.hidden = false;
}

function saveCookieChoice(choice) {
    try {
    localStorage.setItem("cookieChoice", choice);
    } catch (error) {
    console.warn("No se pudo guardar la preferencia.");
    }

    cookieBanner.hidden = true;
}

document.getElementById("acceptCookies").addEventListener(
    "click", () => saveCookieChoice("accepted")
);

document.getElementById("rejectCookies").addEventListener(
    "click", () => saveCookieChoice("rejected")
);