<script>
    import Footer from "../../lib/Footer.svelte";
    import Navbar from "../../lib/Navbar.svelte";

</script>


<svelte:head>
    <title>Inicio - Sistema de Becas</title>
</svelte:head>
<Navbar>
<div class="container">

    <div class="text-center mb-5">
        <h1 class="fw-bold">
            Sistema de Gestión de Becas y Ayudas Económicas
        </h1>

        <p class="text-muted">
            Administración de estudiantes, convocatorias, postulaciones y adjudicaciones
        </p>
    </div>

    <div class="row g-4">

        <div class="col-md-3">
            <div class="card shadow-sm text-center">
                <div class="card-body">
                    <h6 class="text-muted">Estudiantes</h6>
                    <h2 class="fw-bold">120</h2>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="card shadow-sm text-center">
                <div class="card-body">
                    <h6 class="text-muted">Convocatorias</h6>
                    <h2 class="fw-bold">8</h2>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="card shadow-sm text-center">
                <div class="card-body">
                    <h6 class="text-muted">Postulaciones</h6>
                    <h2 class="fw-bold">75</h2>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="card shadow-sm text-center">
                <div class="card-body">
                    <h6 class="text-muted">Adjudicaciones</h6>
                    <h2 class="fw-bold">35</h2>
                </div>
            </div>
        </div>

    </div>

    <div class="card shadow-sm mt-5">

        <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Últimas postulaciones</h5>
        </div>

        <div class="card-body">

            <div class="table-responsive">

                <table class="table table-striped table-hover">

                    <thead>
                        <tr>
                            <th>Estudiante</th>
                            <th>Convocatoria</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                        </tr>
                    </thead>

                    <tbody>

                        <tr>
                            <td>Juan Pérez</td>
                            <td>Beca Excelencia</td>
                            <td>05/09/2026</td>
                            <td>
                                <span class="badge bg-warning text-dark">
                                    Pendiente
                                </span>
                            </td>
                        </tr>

                        <tr>
                            <td>María Gómez</td>
                            <td>Ayuda Educativa</td>
                            <td>06/09/2026</td>
                            <td>
                                <span class="badge bg-success">
                                    Aprobada
                                </span>
                            </td>
                        </tr>

                        <tr>
                            <td>Carlos Rodríguez</td>
                            <td>Beca Deportiva</td>
                            <td>07/09/2026</td>
                            <td>
                                <span class="badge bg-info">
                                    En revisión
                                </span>
                            </td>
                        </tr>

                    </tbody>

                </table>

            </div>

        </div>
    </div>
</div>
<Footer></Footer>
</Navbar>
