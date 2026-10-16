<script> 
    import Navbar from "../../lib/Navbar.svelte";
    import Footer from "../../lib/Footer.svelte";

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
</script>



<svelte:head>
	<title>Roles</title>
</svelte:head>

<Navbar>

<div class="container">

	<h2 class="fw-bold mb-4">Gestión de Roles</h2>

	<div class="card shadow-sm">

		<div class="card-header bg-primary text-white">
			<h5 class="mb-0">Registrar rol</h5>
		</div>

		<div class="card-body">

			<div class="row">

				<div class="col-md-6 mb-3">

					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="form-label">
						Nombre del rol
					</label>

					<input
						type="text"
						class="form-control"
						bind:value={nombre}
						placeholder="Ej: Administrador"
					/>

				</div>

				<div class="col-md-6 mb-3">

					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="form-label">
						Estado
					</label>

					<select class="form-select" bind:value={estado}>
						<option value="">Seleccione</option>
						<option>Activo</option>
						<option>Inactivo</option>
					</select>

				</div>

				<div class="col-md-12 mb-3">

					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="form-label">
						Descripción
					</label>

					<textarea
						class="form-control"
						rows="3"
						bind:value={descripcion}
						placeholder="Descripción del rol"
					></textarea>

				</div>

			</div>

			<button class="btn btn-primary">
				Guardar rol
			</button>

			<button class="btn btn-secondary ms-2">
				Limpiar
			</button>

		</div>
	</div>

	<div class="card shadow-sm mt-5">

		<div class="card-header bg-dark text-white">
			<h5 class="mb-0">Roles registrados</h5>
		</div>

		<div class="card-body">

			<table class="table table-striped table-hover">

				<thead>
					<tr>
						<th>ID</th>
						<th>Nombre</th>
						<th>Descripción</th>
						<th>Estado</th>
						<th>Acciones</th>
					</tr>
				</thead>

				<tbody>

					{#each roles as rol}

						<tr>

							<td>{rol.id}</td>

							<td>
								<strong>{rol.nombre}</strong>
							</td>

							<td>{rol.descripcion}</td>

							<td>
								<span class="badge bg-success">
									Activo
								</span>
							</td>

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