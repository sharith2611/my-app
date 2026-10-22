import Navbar from "../../lib/Navbar.svelte";
import Footer from "../../lib/Footer.svelte";
import DataTable from "$lib/components/DataTable.svelte";
import Accesibilidad from "$lib/components/accesibilidad.svelte";
import Cookies from "$lib/components/cookies.svelte";
import Logo from "$lib/components/logo.svelte";
import RedesSociales from "$lib/components/Redes_sociales.svelte";
import Toast from "$lib/components/toast.svelte";
import VolverArriba from "$lib/components/Volver_arriba.svelte";
import Whatsapp from "$lib/components/Whatsapp.svelte";

let usuarios = [
    {
        id: 1,
        nombre: 'Juan Pérez',
        cedula: '1001001',
        telefono: '3001234567',
        nivel: 'Administrador'
    },
    {
        id: 2,
        nombre: 'María Gómez',
        cedula: '1001002',
        telefono: '3017654321',
        nivel: 'Coordinador'
    },
    {
        id: 3,
        nombre: 'Carlos Rodríguez',
        cedula: '1001003',
        telefono: '3024567890',
        nivel: 'Estudiante'
    }
];

// svelte-ignore non_reactive_update
let nombre = '';
// svelte-ignore non_reactive_update
let cedula = '';
// svelte-ignore non_reactive_update
let telefono = '';
// svelte-ignore non_reactive_update
let nivel = '';