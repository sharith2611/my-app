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

let asignaciones = [
    {
        id: 1,
        modulo: 'Estudiantes',
        usuario: 'Juan Pérez'
    },
    {
        id: 2,
        modulo: 'Convocatorias',
        usuario: 'María Gómez'
    },
    {
        id: 3,
        modulo: 'Postulaciones',
        usuario: 'Carlos Rodríguez'
    }
];

// svelte-ignore non_reactive_update
let modulo = '';
// svelte-ignore non_reactive_update
let usuario = '';