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

let roles = [
    {
        id: 1,
        nombre: 'Administrador',
        descripcion: 'Acceso completo al sistema'
    },
    {
        id: 2,
        nombre: 'Coordinador',
        descripcion: 'Gestiona convocatorias y postulaciones'
    },
    {
        id: 3,
        nombre: 'Estudiante',
        descripcion: 'Puede realizar postulaciones'
    }
];

// svelte-ignore non_reactive_update
let nombre = '';
// svelte-ignore non_reactive_update
let descripcion = '';
// svelte-ignore non_reactive_update
let estado = '';