<script> 
    import Navbar from "../../lib/Navbar.svelte";
    import Footer from "../../lib/Footer.svelte";

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
</script>



<svelte:head>
	<title>Módulo Rol</title>
</svelte:head>

<Navbar>
<div class="container">

	<h2 class="fw-bold mb-4">Asignación de Módulos</h2>

	<div class="card shadow-sm">

		<div class="card-header bg-primary text-white">
			<h5 class="mb-0">Asignar módulo a usuario</h5>
		</div>

		<div class="card-body">

			<div class="row">

				<div class="col-md-6 mb-3">

					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="form-label">Módulo</label>

					<select class="form-select" bind:value={modulo}>
						<option value="">Seleccione un módulo</option>
						<option>Estudiantes</option>
						<option>Convocatorias</option>
						<option>Postulaciones</option>
						<option>Adjudicaciones</option>
					</select>

				</div>

				<div class="col-md-6 mb-3">

					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="form-label">Usuario</label>

					<select class="form-select" bind:value={usuario}>
						<option value="">Seleccione un usuario</option>
						<option>Juan Pérez</option>
						<option>María Gómez</option>
						<option>Carlos Rodríguez</option>
					</select>

				</div>

			</div>

			<button class="btn btn-primary">
				Asignar módulo
			</button>

			<button class="btn btn-secondary ms-2">
				Limpiar
			</button>

		</div>
	</div>

	<div class="card shadow-sm mt-5">

		<div class="card-header bg-dark text-white">
			<h5 class="mb-0">Módulos asignados</h5>
		</div>

		<div class="card-body">

			<table class="table table-striped table-hover">

				<thead>
					<tr>
						<th>ID</th>
						<th>Usuario</th>
						<th>Módulo</th>
						<th>Acciones</th>
					</tr>
				</thead>

				<tbody>

					{#each asignaciones as asignacion}

						<tr>

							<td>{asignacion.id}</td>
							<td>{asignacion.usuario}</td>
							<td>{asignacion.modulo}</td>

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