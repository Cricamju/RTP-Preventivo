<?php
// views/modulos/reportes/historicos_dia_dia.php
$user_modulo = trim($_SESSION['modulo_usuario'] ?? '');
$es_central = ($user_modulo === 'central');
?>
<link rel="stylesheet" href="/static/css/components/table/master-table-layout.css?v=6.0">
<link rel="stylesheet" href="/static/css/components/table/module-empty-state.css?v=4.0">
<link rel="stylesheet" href="/static/css/components/table/data-table.css?v=1.0">
<link rel="stylesheet" href="/static/css/components/table/pagination-fab.css?v=5.0">
<link rel="stylesheet" href="/static/css/modulos/reportes/reportes.css?v=2.0">
<link rel="stylesheet" href="/static/css/modulos/reportes/historicos_dia_dia.css?v=3.0">

<div class="module-sticky-header" id="sticky-panel">
    <div class="header-content-inline">
        <div class="inline-title">
            <h2>📅 Históricos KM Día Día</h2>
        </div>

        <div class="module-selector-box">
            <span class="module-label">MÓDULO</span>
            <select id="rep-modulo-select" class="module-select-input" onchange="filtrarHistoricosDiaDia()" <?= (!$es_central) ? 'disabled' : '' ?>>
                <option value="">- Seleccione -</option>
                <option value="01" <?= ($user_modulo === '01' || $user_modulo === '1') ? 'selected' : '' ?>>Módulo 01</option>
                <option value="02" <?= ($user_modulo === '02' || $user_modulo === '2') ? 'selected' : '' ?>>Módulo 02</option>
                <option value="03" <?= ($user_modulo === '03' || $user_modulo === '3') ? 'selected' : '' ?>>Módulo 03</option>
                <option value="04" <?= ($user_modulo === '04' || $user_modulo === '4') ? 'selected' : '' ?>>Módulo 04</option>
                <option value="05" <?= ($user_modulo === '05' || $user_modulo === '5') ? 'selected' : '' ?>>Módulo 05</option>
                <option value="06" <?= ($user_modulo === '06' || $user_modulo === '6') ? 'selected' : '' ?>>Módulo 06</option>
                <option value="07" <?= ($user_modulo === '07' || $user_modulo === '7') ? 'selected' : '' ?>>Módulo 07</option>
            </select>
        </div>

        <div class="inline-controls">
            <button type="button" class="btn-export excel" onclick="exportarDiaDiaExcel()">📊 Excel</button>
            <button type="button" class="btn-export pdf" onclick="exportarDiaDiaPDF()">📄 PDF</button>
        </div>
    </div>
    <div class="report-filter-row">
        <label class="report-filter-field">
            <span>Fecha</span>
            <input type="date" id="rep-date-filter">
        </label>
        <label class="report-filter-field report-economic-filter">
            <span>Económico</span>
            <input type="search" id="rep-search-input" placeholder="Todos" onkeydown="if(event.key==='Enter') filtrarHistoricosDiaDia()">
        </label>
        <div class="report-filter-actions">
            <button type="button" class="report-filter-button primary" onclick="filtrarHistoricosDiaDia()">Filtrar</button>
            <button type="button" class="report-filter-button" onclick="limpiarFiltrosDiaDia()">Cancelar</button>
        </div>
    </div>
</div>

<div class="management-card master-card">
    <div id="rep-empty-state" class="module-empty-card">
        <div class="empty-icon">📅</div>
        <h3>Históricos KM Día Día</h3>
        <p>Seleccione un módulo para consultar el registro diario de odómetro y operación de las unidades.</p>
    </div>
    <div id="rep-no-records" class="module-empty-card no-records-card" hidden>
        <div class="empty-icon">📭</div>
        <h3>No hay registros</h3>
        <p>No se encontraron datos para la fecha y filtros seleccionados.</p>
    </div>

    <div class="master-table-wrapper" id="rep-table-wrapper" style="display: none;">
        <table class="excel-table reporte-table" id="tabla-historicos-dia-dia">
            <thead>
                <tr>
                    <th>#</th>
                    <th>ECONÓMICO</th>
                    <th>FECHA</th>
                    <th>ODÓMETRO</th>
                </tr>
            </thead>
            <tbody id="tbody-historicos-dia-dia"></tbody>
        </table>
    </div>
</div>

<div class="pagination-wrapper" id="rep-pagination-wrapper">
    <div class="pagination-container" id="rep-pagination-controls"></div>
</div>

<script>
    const repUserModulo = "<?= htmlspecialchars($user_modulo) ?>";
</script>
<script src="/static/js/modulos/odometro_data.js?v=2.0"></script>
<script src="/static/js/components/pagination-fab.js?v=7.0"></script>
<script src="/static/js/modulos/reportes/historicos_dia_dia.js?v=5.0"></script>