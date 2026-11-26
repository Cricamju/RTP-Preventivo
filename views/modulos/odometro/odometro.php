<?php
// views/modulos/odometro.php
$rol_usuario = isset($_SESSION['rol']) ? strtolower(trim($_SESSION['rol'])) : 'consulta';
$user_modulo = isset($_SESSION['modulo_usuario']) ? trim($_SESSION['modulo_usuario']) : ''; 
$modulo_asignado = rtpNormalizeModuleId($user_modulo);
$puede_seleccionar_modulo = rtpCanSelectAnyModule();

$modulo_valido = $modulo_asignado !== null;
$es_admin = (in_array($rol_usuario, ['admin', 'administrador'], true)
    && ($puede_seleccionar_modulo || $modulo_valido));
?>
<link rel="stylesheet" href="/static/css/components/table/master-table-layout.css?v=5.0">
<link rel="stylesheet" href="/static/css/components/table/module-empty-state.css?v=4.0">
<link rel="stylesheet" href="/static/css/components/table/data-table.css?v=2.0">
<link rel="stylesheet" href="/static/css/components/table/pagination-fab.css?v=5.0">
<link rel="stylesheet" href="/static/css/components/table/comparison-fab.css?v=3.0">


<!-- PANEL STICKY -->
<div class="odometro-sticky-header module-sticky-header" id="sticky-panel">
    <div class="header-content-inline">
        <div class="inline-title">
            <h2>📊 Control de Odómetros</h2>
        </div>

        <div class="module-selector-box">
            <span class="module-label">MÓDULO</span>
            <select id="module-filter-select" class="module-select-input" data-module-selector onchange="filterTable()" <?php echo (!$puede_seleccionar_modulo) ? 'disabled' : ''; ?>>
                <option value="">- Seleccione -</option>
                <?php
                    $modulosOpciones = $puede_seleccionar_modulo
                        ? range(1, 7)
                        : ($modulo_asignado !== null ? [(int) $modulo_asignado] : []);
                    foreach ($modulosOpciones as $numeroModulo):
                    $opcionModulo = str_pad((string) $numeroModulo, 2, '0', STR_PAD_LEFT);
                ?>
                    <option value="<?= $opcionModulo ?>" <?= ($modulo_asignado === $opcionModulo) ? 'selected' : '' ?>>Módulo <?= $opcionModulo ?></option>
                <?php endforeach; ?>
            </select>
        </div>

        <div class="inline-search">
            <input type="text" id="search-input" placeholder="🔍 Búsqueda general (económico, modelo...)" onkeyup="filterTable()">
        </div>

        <div class="inline-controls">
            <button class="btn-export reportes" onclick="abrirReportes()">📈 Reportes</button>
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
<div class="management-card odometro-card master-card">
    <div id="odometro-empty-state" class="module-empty-card" hidden>
        <div class="empty-icon">📌</div>
        <h3>Seleccione un Módulo</h3>
        <p>Por favor, seleccione un Módulo en la barra superior para consultar el parque vehicular.</p>
    </div>
    <div id="odometro-no-records" class="module-empty-card no-records-card" hidden>
        <div class="empty-icon">📭</div>
        <h3>No hay registros</h3>
        <p>No se encontraron unidades con los filtros seleccionados.</p>
    </div>

    <div class="table-wrapper master-table-wrapper" id="table-wrapper-container" style="display: none;">
        <!-- views/modulos/odometro.php -->
<table class="users-table excel-table" id="odometro-table">
    <colgroup>
        <col style="width: 3%;">   <!-- Anclar -->
        <col style="width: 3%;">   <!-- # -->
        <col style="width: 5%;">   <!-- Logo RTP / MB -->
        <col style="width: 8%;">   <!-- Económico -->
        <col style="width: 17%;">  <!-- Modelo / Unidad -->
        <col style="width: 8%;">   <!-- Últ. Mant. Fecha -->
        <col style="width: 8%;">   <!-- Últ. Mant. Km -->
        <col style="width: 8%;">   <!-- Odómetro (Km) -->
        <col style="width: 8%;">   <!-- Km Acumulado -->
        <col style="width: 13%;">  <!-- Estado Mantenimiento -->
        <col style="width: 7%;">   <!-- Generar Documentos -->
        <col style="width: 4%;">   <!-- Detalles -->
        <col id="col-acciones" style="display: none; width: 5%;"> <!-- Acciones admin -->
    </colgroup>
    <thead>
        <!-- FILA 1: CABECERAS AGRUPADAS -->
        <tr>
            <th rowspan="2" title="Anclar esta unidad en la parte superior">📌</th>
            <th rowspan="2">#</th>
            <th rowspan="2">Servicio</th>
            <th rowspan="2" onclick="sortTable('economico')">Económico ⇅</th>
            <th rowspan="2" onclick="sortTable('modelo')">Modelo / Unidad ⇅</th>
            <th colspan="2" class="group-header">ÚLTIMO MANTENIMIENTO</th>
            <th rowspan="2" onclick="sortTable('kmActual')">Odómetro (Km) ⇅</th>
            <th rowspan="2" onclick="sortTable('kmAcum')">Km Acum. ⇅</th>
            <th rowspan="2" onclick="sortTable('siguienteServicio')">Estado Mantenimiento ⇅</th>
            <th rowspan="2" class="documents-header" title="Generar documentos">Generar<br>Documentos</th>
            <th rowspan="2">Detalles</th>
            <th rowspan="2" id="th-acciones" style="display: none; text-align: center;">Eliminar</th>
        </tr>
        <!-- FILA 2: SUB-COLUMNAS -->
        <tr>
            <th onclick="sortTable('fechaMant')">Fecha ⇅</th>
            <th onclick="sortTable('kmMant')">Kilometraje [Km] ⇅</th>
        </tr>
        <!-- FILA 3: FILTROS POR COLUMNA -->
        <tr class="header-filter-row">
            <th>-</th>
            <th>-</th>
            <th>-</th>
            <th><input type="text" class="column-filter" placeholder="Filtrar..." onkeyup="filterTable()" data-col="economico"></th>
            <th><input type="text" class="column-filter" placeholder="Modelo..." onkeyup="filterTable()" data-col="modelo"></th>
            <th><input type="text" class="column-filter" placeholder="F. mant..." onkeyup="filterTable()" data-col="fechaMant"></th>
            <th><input type="text" class="column-filter" placeholder="Km mant..." onkeyup="filterTable()" data-col="kmMant"></th>
            <th><input type="text" class="column-filter" placeholder="Km odo..." onkeyup="filterTable()" data-col="kmActual"></th>
            <th><input type="text" class="column-filter" placeholder="Acum..." onkeyup="filterTable()" data-col="kmAcum"></th>
            <th><input type="text" class="column-filter" placeholder="Estado mant..." onkeyup="filterTable()" data-col="siguienteServicio"></th>
            <th>-</th>
            <th>-</th>
            <th id="th-filter-acciones" style="display: none;">-</th>
        </tr>
    </thead>
    <tbody id="odometro-body"></tbody>
</table>
    </div>

</div>

<!-- PAGINACIÓN ESTILIZADA -->
<div class="pagination-wrapper" id="pagination-wrapper-container" style="display: none;">
    <div id="pagination-controls" class="pagination-container"></div>
</div>

<!-- FLOATING ACTION BUTTON (FAB) -->
<div id="comparison-fab-bar" class="rtp-fab-container" style="display: none;">
    <button class="rtp-fab-btn undo" onclick="undoSelection()" title="Deshacer última selección (Ctrl+Z)">
        ↩️ <span class="fab-label">Deshacer</span>
    </button>
    <button class="rtp-fab-btn collapse" onclick="collapseAllSelections()" title="Colapsar todas las filas expandidas">
        📂 <span class="fab-label">Colapsar Todo</span>
    </button>
    <button class="rtp-fab-btn clear" onclick="clearAllSelections()" title="Limpiar selecciones activas">
        🗑️ <span class="fab-label">Limpiar Selección</span>
    </button>
</div>

<script>
    const userRole = <?= json_encode($rol_usuario, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
    const userAssignedModule = <?= json_encode($user_modulo, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
</script>
<script src="/static/js/modulos/odometro_data.js?v=3.0"></script>
<script src="/static/js/components/comparison-fab.js?v=3.0"></script>
<script src="/static/js/modulos/odometro.js?v=50.0"></script>
<script src="/static/js/components/pagination-fab.js?v=7.0"></script>