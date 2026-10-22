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

let modulos = [
    {
        id: 1,
        nombre: 'Estudiantes',
        descripcion: 'Gestión de estudiantes'
    },
    {
        id: 2,
        nombre: 'Convocatorias',
        descripcion: 'Gestión de convocatorias'
    },
    {
        id: 3,
        nombre: 'Postulaciones',
        descripcion: 'Gestión de postulaciones'
    },
    {
        id: 4,
        nombre: 'Adjudicaciones',
        descripcion: 'Gestión de adjudicaciones'
    }
];

// svelte-ignore non_reactive_update
let nombre = '';
// svelte-ignore non_reactive_update
let descripcion = '';