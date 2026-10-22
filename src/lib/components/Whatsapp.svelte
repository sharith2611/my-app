<!-- 2. BOTÓN DE WHATSAPP -->
<a
    class="whatsapp"
    href="https://wa.me/573001234567?text=Hola%2C%20quiero%20informaci%C3%B3n"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Contactar por WhatsApp"
    title="Escríbenos por WhatsApp">✆
</a>

<style>

/* 2. WHATSAPP */

.whatsapp {
    position: fixed;
    right: 22px;
    bottom: 22px;
    z-index: 1000;
    display: grid;
    place-items: center;
    width: 60px;
    height: 60px;
    color: white;
    background: #25d366;
    border-radius: 50%;
    text-decoration: none;
    box-shadow: 0 4px 15px #0002;
    font-size: 27px;
}

.whatsapp:hover {
    background: #1ebe5d;
    transform: scale(1.05);
}

@media (max-width: 600px) {
    .whatsapp {
    right: 15px;
    bottom: 15px;
    }
}
</style>