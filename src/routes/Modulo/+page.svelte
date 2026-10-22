<script>
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

	let modulos = $state([
		{ id: 1, nombre: "Estudiantes", descripcion: "Gestión de estudiantes" },
		{ id: 2, nombre: "Convocatorias", descripcion: "Gestión de convocatorias" },
		{ id: 3, nombre: "Postulaciones", descripcion: "Gestión de postulaciones" },
		{ id: 4, nombre: "Adjudicaciones", descripcion: "Gestión de adjudicaciones" }
	]);
	let nombre = $state("");
	let descripcion = $state("");
</script>



<svelte:head>
	<title>Módulos</title>
</svelte:head>

<Navbar>

<div class="container">

	<h2 class="fw-bold mb-4">Gestión de Módulos</h2>

	<div class="card shadow-sm">

		<div class="card-header bg-primary text-white">
			<h5 class="mb-0">Registrar módulo</h5>
		</div>

		<div class="card-body">

			<div class="mb-3">

				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="form-label">Nombre del módulo</label>

				<input
					type="text"
					class="form-control"
					bind:value={nombre}
					placeholder="Ingrese el nombre del módulo"
				/>

			</div>

			<div class="mb-3">

				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="form-label">Descripción</label>

				<textarea
					class="form-control"
					rows="3"
					bind:value={descripcion}
					placeholder="Descripción del módulo"
				></textarea>

			</div>

			<button class="btn btn-primary">
				Guardar módulo
			</button>

			<button class="btn btn-secondary ms-2">
				Limpiar
			</button>

		</div>
	</div>

	<div class="card shadow-sm mt-5">

		<div class="card-header bg-dark text-white">
			<h5 class="mb-0">Módulos registrados</h5>
		</div>

		<div class="card-body">

			<table class="table table-striped table-hover">

				<thead>
					<tr>
						<th>ID</th>
						<th>Nombre</th>
						<th>Descripción</th>
						<th>Acciones</th>
					</tr>
				</thead>

				<tbody>

					{#each modulos as modulo}

						<tr>
							<td>{modulo.id}</td>
							<td>{modulo.nombre}</td>
							<td>{modulo.descripcion}</td>

							<td>
								<button class="btn btn-sm btn-warning">
									Editar
								</button>

								<button class="btn btn-sm btn-danger ms-1">
									Eliminar
								</button>
							</td>
						</tr>

					{/each}

				</tbody>

			</table>

		</div>
	</div>

</div>

<Footer></Footer>
</Navbar>
