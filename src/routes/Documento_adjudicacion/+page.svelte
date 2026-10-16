<script> 
    import Navbar from "../../lib/Navbar.svelte";
    import Footer from "../../lib/Footer.svelte";

	let documentos = [
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
	];

	// svelte-ignore non_reactive_update
	let adjudicacion = '';
	// svelte-ignore non_reactive_update
	let nombre = '';
	// svelte-ignore non_reactive_update
	let tipo = '';
	// svelte-ignore non_reactive_update
	let descripcion = '';
	// svelte-ignore non_reactive_update
	let estado = '';
</script>



<svelte:head>
	<title>Documento Adjudicación</title>
</svelte:head>

<Navbar>
<div class="container">

	<div class="mb-4">
		<h2 class="fw-bold">Documentos de Adjudicación</h2>
		<p class="text-muted">
			Gestión de documentos asociados a las adjudicaciones
		</p>
	</div>

	<div class="card shadow-sm">

		<div class="card-header bg-primary text-white">
			<h5 class="mb-0">Registrar documento</h5>
		</div>

		<div class="card-body">

			<div class="row">

				<div class="col-md-6 mb-3">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="form-label">Adjudicación</label>

					<select class="form-select" bind:value={adjudicacion}>
						<option value="">Seleccione una adjudicación</option>
						<option>ADJ-001</option>
						<option>ADJ-002</option>
						<option>ADJ-003</option>
					</select>
				</div>

				<div class="col-md-6 mb-3">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="form-label">Nombre del documento</label>

					<input
						type="text"
						class="form-control"
						bind:value={nombre}
						placeholder="Ingrese el nombre"
					/>
				</div>

				<div class="col-md-6 mb-3">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="form-label">Tipo de documento</label>

					<select class="form-select" bind:value={tipo}>
						<option value="">Seleccione un tipo</option>
						<option>Carta</option>
						<option>Resolución</option>
						<option>Acta</option>
						<option>Certificado</option>
					</select>
				</div>

				<div class="col-md-6 mb-3">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="form-label">Estado</label>

					<select class="form-select" bind:value={estado}>
						<option value="">Seleccione</option>
						<option>Cargado</option>
						<option>Pendiente</option>
						<option>Revisado</option>
					</select>
				</div>

				<div class="col-md-12 mb-3">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="form-label">Descripción</label>

					<textarea
						class="form-control"
						rows="3"
						bind:value={descripcion}
						placeholder="Descripción del documento"
					></textarea>
				</div>

			</div>

			<button type="button" class="btn btn-primary">
				Registrar documento
			</button>

			<button type="button" class="btn btn-secondary ms-2">
				Limpiar
			</button>

		</div>
	</div>

	<div class="card shadow-sm mt-5">

		<div class="card-header bg-dark text-white">
			<h5 class="mb-0">Documentos registrados</h5>
		</div>

		<div class="card-body">

			<div class="table-responsive">

				<table class="table table-striped table-hover">

					<thead>
						<tr>
							<th>ID</th>
							<th>Adjudicación</th>
							<th>Documento</th>
							<th>Tipo</th>
							<th>Estado</th>
							<th>Acciones</th>
						</tr>
					</thead>

					<tbody>

						{#each documentos as documento}
							<tr>
								<td>{documento.id}</td>
								<td>{documento.adjudicacion}</td>
								<td>{documento.nombre}</td>
								<td>{documento.tipo}</td>

								<td>
									{#if documento.estado === 'Cargado'}
										<span class="badge bg-success">
											{documento.estado}
										</span>
									{:else}
										<span class="badge bg-warning text-dark">
											{documento.estado}
										</span>
									{/if}
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

</div>

<Footer></Footer>
</Navbar>