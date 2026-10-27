<?php
// views/modulos/odometro.php
$rol_usuario = isset($_SESSION['rol']) ? strtolower(trim($_SESSION['rol'])) : 'consulta';
$es_admin = ($rol_usuario === 'admin' || $rol_usuario === 'administrador');
$user_modulo = isset($_SESSION['modulo_usuario']) ? $_SESSION['modulo_usuario'] : ''; 
?>
<link rel="stylesheet" href="/static/css/modulos/odometro.css?v=29.0">

<!-- PANEL STICKY -->
<div class="odometro-sticky-header" id="sticky-panel">
    <div class="header-content-inline">
        <div class="inline-title">
            <h2>📊 Control de Odómetros</h2>
        </div>

        <div class="module-selector-box">
            <span class="module-label">MÓDULO</span>
            <select id="module-filter-select" class="module-select-input" onchange="filterTable()" <?php echo (!empty($user_modulo) && !$es_admin) ? 'disabled' : ''; ?>>
                <option value="">- Seleccione -</option>
                <option value="01" <?php echo ($user_modulo === '01') ? 'selected' : ''; ?>>Módulo 01</option>
                <option value="02" <?php echo ($user_modulo === '02') ? 'selected' : ''; ?>>Módulo 02</option>
                <option value="03" <?php echo ($user_modulo === '03') ? 'selected' : ''; ?>>Módulo 03</option>
                <option value="04" <?php echo ($user_modulo === '04') ? 'selected' : ''; ?>>Módulo 04</option>
                <option value="05" <?php echo ($user_modulo === '05') ? 'selected' : ''; ?>>Módulo 05</option>
                <option value="06" <?php echo ($user_modulo === '06') ? 'selected' : ''; ?>>Módulo 06</option>
                <option value="07" <?php echo ($user_modulo === '07') ? 'selected' : ''; ?>>Módulo 07</option>
            </select>
        </div>

        <div class="inline-search">
            <input type="text" id="search-input" placeholder="🔍 Búsqueda general (económico, modelo...)" onkeyup="filterTable()">
        </div>

        <div class="inline-controls">
            <button class="btn-export excel" onclick="exportToExcel()">📊 Excel</button>
            <button class="btn-export pdf" onclick="exportToPDF()">📄 Imprimir</button>

            <div id="admin-tools" style="display: none; gap: 10px;">
                <button class="btn-primary" id="btn-add-row" onclick="addNewRow()">+ Nueva Fila</button>
                <button class="btn-primary btn-save" id="btn-save-data" onclick="saveData()">💾 Guardar</button>
            </div>
            
            <?php if ($es_admin): ?>
                <button id="btn-toggle-edit" class="btn-toggle-mode readonly" onclick="toggleEditMode()">👁️ Modo Consulta</button>
            <?php else: ?>
                <span class="view-mode-badge readonly">👁️ Modo Consulta</span>
            <?php endif; ?>
        </div>
    </div>
</div>

<!-- TARJETA Y TABLA -->
<div class="management-card odometro-card">
    <div id="odometro-empty-state" class="empty-state" style="display: none;">
        <div class="empty-icon">📌</div>
        <h3>Seleccione un Módulo</h3>
        <p>Por favor, seleccione un Módulo en la barra superior para consultar el parque vehicular.</p>
    </div>

    <div class="table-wrapper" id="table-wrapper-container" style="display: none;">
        <table class="users-table excel-table" id="odometro-table">
            <colgroup>
                <col style="width: 50px;">  <!-- Conteo (#) -->
                <col style="width: 80px;">  <!-- Económico -->
                <col style="width: 150px;"> <!-- Modelo / Unidad -->
                <col style="width: 110px;"> <!-- Odo Fecha -->
                <col style="width: 90px;">   <!-- Odo Km -->
                <col style="width: 110px;"> <!-- Mant Fecha -->
                <col style="width: 90px;">   <!-- Mant Km -->
                <col style="width: 95px;">   <!-- Acumulado -->
                <col style="width: 125px;"> <!-- Estado Mantenimiento -->
                <col style="width: 60px;">   <!-- Días -->
                <?php if ($es_admin): ?>
                <col style="width: 75px;">   <!-- Servicios -->
                <?php endif; ?>
                <col style="width: 90px;">   <!-- Estado -->
                <col style="width: 70px;">   <!-- Orden Rep. -->
                <col id="col-acciones" style="display: none; width: 55px;"> <!-- Acciones -->
            </colgroup>
            <thead>
                <tr class="header-row-1">
                    <th rowspan="2">#</th>
                    <th rowspan="2" onclick="sortTable('economico')">Económico ⇅</th>
                    <th rowspan="2" onclick="sortTable('modelo')">Modelo / Unidad ⇅</th>
                    <th colspan="2" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.2);">ODÓMETRO ACTUAL</th>
                    <th colspan="2" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.2);">ÚLTIMO MANTENIMIENTO</th>
                    <th rowspan="2" onclick="sortTable('kmAcum')">Km Acum. ⇅</th>
                    <th rowspan="2" onclick="sortTable('siguienteServicio')">Estado Mantenimiento ⇅</th>
                    <th rowspan="2" onclick="sortTable('dias')">Días ⇅</th>
                    <?php if ($es_admin): ?>
                    <th rowspan="2" onclick="sortTable('servicios')">Servicios ⇅</th>
                    <?php endif; ?>
                    <th rowspan="2" onclick="sortTable('estado')">Estado ⇅</th>
                    <th rowspan="2">Orden Rep.</th>
                    <th rowspan="2" id="th-acciones" style="display: none; text-align: center;">Acciones</th>
                </tr>
                <tr class="header-row-2">
                    <th onclick="sortTable('fechaActual')">Fecha ⇅</th>
                    <th onclick="sortTable('kmActual')">Km ⇅</th>
                    <th onclick="sortTable('fechaMant')">Fecha ⇅</th>
                    <th onclick="sortTable('kmMant')">Km ⇅</th>
                </tr>
                <tr class="header-filter-row">
                    <th>-</th>
                    <th><input type="text" class="column-filter" placeholder="Filtrar..." onkeyup="filterTable()" data-col="economico"></th>
                    <th><input type="text" class="column-filter" placeholder="Filtrar modelo..." onkeyup="filterTable()" data-col="modelo"></th>
                    <th><input type="text" class="column-filter" placeholder="F. odo..." onkeyup="filterTable()" data-col="fechaActual"></th>
                    <th><input type="text" class="column-filter" placeholder="Km odo..." onkeyup="filterTable()" data-col="kmActual"></th>
                    <th><input type="text" class="column-filter" placeholder="F. mant..." onkeyup="filterTable()" data-col="fechaMant"></th>
                    <th><input type="text" class="column-filter" placeholder="Km mant..." onkeyup="filterTable()" data-col="kmMant"></th>
                    <th><input type="text" class="column-filter" placeholder="Acum..." onkeyup="filterTable()" data-col="kmAcum"></th>
                    <th><input type="text" class="column-filter" placeholder="Estado mant..." onkeyup="filterTable()" data-col="siguienteServicio"></th>
                    <th><input type="text" class="column-filter" placeholder="Días..." onkeyup="filterTable()" data-col="dias"></th>
                    <?php if ($es_admin): ?>
                    <th><input type="text" class="column-filter" placeholder="Serv..." onkeyup="filterTable()" data-col="servicios"></th>
                    <?php endif; ?>
                    <th><input type="text" class="column-filter" placeholder="Estado..." onkeyup="filterTable()" data-col="estado"></th>
                    <th>-</th>
                    <th id="th-filter-acciones" style="display: none;">-</th>
                </tr>
            </thead>
            <tbody id="odometro-body"></tbody>
        </table>
    </div>

    <div class="pagination-wrapper" id="pagination-wrapper-container" style="display: none;">
        <div id="pagination-controls" class="pagination-container"></div>
    </div>
</div>

<script>
    const userRole = "<?php echo $rol_usuario; ?>";
    const userAssignedModule = "<?php echo $user_modulo; ?>";
</script>
<script src="/static/js/modulos/odometro.js?v=29.0"></script>