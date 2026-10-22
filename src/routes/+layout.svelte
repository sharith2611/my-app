<script>
	import favicon from '$lib/assets/favicon.svg';
	import Accesibilidad from '$lib/components/accesibilidad.svelte';
	import Cookies from '$lib/components/cookies.svelte';
	import Toast from '$lib/components/toast.svelte';
	import VolverArriba from '$lib/components/Volver_arriba.svelte';
	import Whatsapp from '$lib/components/Whatsapp.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<Accesibilidad />
<Cookies />
<Toast />
<VolverArriba />
<Whatsapp />

<style>
	:global(:root) {
		--campus-blue: #164a78;
		--campus-blue-dark: #10385d;
		--campus-blue-light: #eaf2f9;
		--primary: var(--campus-blue);
		--border: #d7e2ec;
		--bs-primary: var(--campus-blue);
		--bs-primary-rgb: 22, 74, 120;
		--bs-link-color: var(--campus-blue);
		--bs-link-hover-color: var(--campus-blue-dark);
		--bs-focus-ring-color: rgb(22 74 120 / 25%);
	}

	:global(body) {
		background-color: #f3f7fb;
		color: #243447;
		overflow-x: hidden;
	}

	:global(.bg-primary) {
		background-color: var(--campus-blue) !important;
	}

	:global(.text-primary) {
		color: var(--campus-blue) !important;
	}

	:global(.btn-primary) {
		--bs-btn-bg: var(--campus-blue);
		--bs-btn-border-color: var(--campus-blue);
		--bs-btn-hover-bg: var(--campus-blue-dark);
		--bs-btn-hover-border-color: var(--campus-blue-dark);
		--bs-btn-active-bg: var(--campus-blue-dark);
		--bs-btn-active-border-color: var(--campus-blue-dark);
		--bs-btn-disabled-bg: var(--campus-blue);
		--bs-btn-disabled-border-color: var(--campus-blue);
	}

	:global(.btn-outline-primary) {
		--bs-btn-color: var(--campus-blue);
		--bs-btn-border-color: var(--campus-blue);
		--bs-btn-hover-bg: var(--campus-blue);
		--bs-btn-hover-border-color: var(--campus-blue);
		--bs-btn-active-bg: var(--campus-blue-dark);
		--bs-btn-active-border-color: var(--campus-blue-dark);
	}

	:global(.card) {
		border-color: var(--border);
		border-radius: 0.75rem;
	}

	:global(.card-header.bg-dark),
	:global(thead.table-dark) {
		background-color: var(--campus-blue-dark) !important;
	}

	:global(.form-control:focus),
	:global(.form-select:focus) {
		border-color: #7fa6ca;
		box-shadow: 0 0 0 0.2rem rgb(22 74 120 / 15%);
	}
</style>
