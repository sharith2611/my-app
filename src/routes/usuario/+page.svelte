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

	let usuarios = $state([
		{ id: 1, nombre: "Juan Pérez", cedula: "1001001", telefono: "3001234567", nivel: "Administrador" },
		{ id: 2, nombre: "María Gómez", cedula: "1001002", telefono: "3017654321", nivel: "Coordinador" },
		{ id: 3, nombre: "Carlos Rodríguez", cedula: "1001003", telefono: "3024567890", nivel: "Estudiante" }
	]);
	let nombre = $state("");
	let cedula = $state("");
	let telefono = $state("");
	let nivel = $state("");
</script>



<svelte:head>
	<title>Usuarios</title>
</svelte:head>

<Navbar>

<div class="container">

	<div class="mb-4">

		<h2 class="fw-bold">
			Gestión de Usuarios
		</h2>

		<p class="text-muted">
			Registro y administración de usuarios del sistema
		</p>

	</div>

	<div class="card shadow-sm">

		<div class="card-header bg-primary text-white">
			<h5 class="mb-0">Registrar usuario</h5>
		</div>

		<div class="card-body">

			<div class="row">

				<div class="col-md-6 mb-3">

					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="form-label">
						Nombre completo
					</label>

					<input
						type="text"
						class="form-control"
						bind:value={nombre}
						placeholder="Nombre completo"
					/>

				</div>

				<div class="col-md-6 mb-3">

					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="form-label">
						Cédula
					</label>

					<input
						type="text"
						class="form-control"
						bind:value={cedula}
						placeholder="Número de cédula"
					/>

				</div>

				<div class="col-md-6 mb-3">

					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="form-label">
						Teléfono
					</label>

					<input
						type="text"
						class="form-control"
						bind:value={telefono}
						placeholder="Número de teléfono"
					/>

				</div>

				<div class="col-md-6 mb-3">

					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="form-label">
						Nivel
					</label>

					<select class="form-select" bind:value={nivel}>

						<option value="">
							Seleccione un nivel
						</option>

						<option>
							Administrador
						</option>

						<option>
							Coordinador
						</option>

						<option>
							Estudiante
						</option>

						<option>
							Consulta
						</option>

					</select>

				</div>

			</div>

			<button class="btn btn-primary">
				Guardar usuario
			</button>

			<button class="btn btn-secondary ms-2">
				Limpiar
			</button>

		</div>
	</div>

	<div class="card shadow-sm mt-5">

		<div class="card-header bg-dark text-white">
			<h5 class="mb-0">Usuarios registrados</h5>
		</div>

		<div class="card-body">

			<div class="table-responsive">

				<table class="table table-striped table-hover align-middle">

					<thead>

						<tr>
							<th>ID</th>
							<th>Nombre</th>
							<th>Cédula</th>
							<th>Teléfono</th>
							<th>Nivel</th>
							<th>Acciones</th>
						</tr>

					</thead>

					<tbody>

						{#each usuarios as usuario}

							<tr>

								<td>{usuario.id}</td>

								<td>
									<strong>
										{usuario.nombre}
									</strong>
								</td>

								<td>{usuario.cedula}</td>

								<td>{usuario.telefono}</td>

								<td>
									<span class="badge bg-info text-dark">
										{usuario.nivel}
									</span>
								</td>

								<td>

									<button
										class="btn btn-sm btn-warning"
									>
										Editar
									</button>

									<button
										class="btn btn-sm btn-danger ms-1"
									>
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

</div>

<Footer></Footer>
</Navbar>