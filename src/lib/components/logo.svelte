<!-- 1. LOGO REUTILIZABLE -->
<header class="header">
<a class="logo" href="/Inicio" aria-label="Ir al inicio del Sistema de Becas">
    <span class="logo-mark" aria-hidden="true">🎓</span>
    <span>Sistema de Becas</span>
</a>

<span class="logo-caption">Gestión universitaria</span>
</header>

<style>
/* 1. LOGO */

.logo {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    font-size: 17px;
    font-weight: 800;
    color: white;
}

.header {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 1.25rem;
    padding: 0 0 1rem;
    border-bottom: 1px solid rgb(255 255 255 / 20%);
}

.logo-caption {
    margin-left: 48px;
    color: rgb(255 255 255 / 70%);
    font-size: 0.75rem;
}

.logo-mark {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    background: rgb(255 255 255 / 16%);
    color: white;
    border-radius: 10px;
    font-size: 19px;
}

</style>