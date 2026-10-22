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

let documentos = $state([
    {
        id: 1,
        adjudicacion: 'ADJ-001',
        nombre: 'Carta de aprobación',
        tipo: 'Carta',
        estado: 'Cargado'
    },
    {
        id: 2,
        adjudicacion: 'ADJ-002',
        nombre: 'Resolución de adjudicación',
        tipo: 'Resolución',
        estado: 'Pendiente'
    },
    {
        id: 3,
        adjudicacion: 'ADJ-003',
        nombre: 'Acta de adjudicación',
        tipo: 'Acta',
        estado: 'Cargado'
    }
]);

// svelte-ignore non_reactive_update
let adjudicacion = $state('');
// svelte-ignore non_reactive_update
let nombre = $state('');
// svelte-ignore non_reactive_update
let tipo = $state('');
// svelte-ignore non_reactive_update
let descripcion = $state('');
// svelte-ignore non_reactive_update
let estado = $state('');