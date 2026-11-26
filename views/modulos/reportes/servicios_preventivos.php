<?php
// views/modulos/reportes/servicios_preventivos.php
$user_modulo = trim($_SESSION['modulo_usuario'] ?? '');
$modulo_asignado = rtpNormalizeModuleId($user_modulo);
$puede_seleccionar_modulo = rtpCanSelectAnyModule();
?>
<link rel="stylesheet" href="/static/css/components/table/master-table-layout.css?v=6.0">
<link rel="stylesheet" href="/static/css/components/table/module-empty-state.css?v=4.0">
<link rel="stylesheet" href="/static/css/components/table/data-table.css?v=2.0">
<link rel="stylesheet" href="/static/css/components/table/pagination-fab.css?v=5.0">
<link rel="stylesheet" href="/static/css/modulos/reportes/reportes.css?v=2.0">
<link rel="stylesheet" href="/static/css/modulos/reportes/servicios_preventivos.css?v=3.0">

<div class="module-sticky-header" id="sticky-panel">
    <div class="header-content-inline">
        <div class="inline-title">
            <h2>🛠️ Reporte de Servicios Preventivos</h2>
        </div>

        <div class="module-selector-box">
            <span class="module-label">MÓDULO</span>
            <select id="rep-modulo-select" class="module-select-input" data-module-selector onchange="filtrarServiciosPreventivos()" <?= (!$puede_seleccionar_modulo) ? 'disabled' : '' ?>>
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

        <div class="inline-controls">
            <button type="button" class="btn-export excel" onclick="exportarServiciosExcel()">📊 Excel</button>
            <button type="button" class="btn-export pdf" onclick="exportarServiciosPDF()">🖨️ Imprimir</button>
        </div>
    </div>
    <div class="report-filter-row">
        <label class="report-filter-field">
            <span>Filtrar por</span>
            <select id="rep-criterio">
                <option value="fechaIngreso">Fecha ingreso a taller</option>
                <option value="noOrden">Folio</option>
                <option value="fechaSalida">Fecha salida de taller</option>
            </select>
        </label>
        <label class="report-filter-field">
            <span>Folio / fecha</span>
            <input type="search" id="rep-filtro-valor" placeholder="Opcional" onkeydown="if(event.key==='Enter') filtrarServiciosPreventivos()">
        </label>
        <label class="report-filter-field">
            <span>Mes</span>
            <select id="rep-mes">
                <option value="01">Enero</option><option value="02">Febrero</option>
                <option value="03">Marzo</option><option value="04">Abril</option>
                <option value="05">Mayo</option><option value="06">Junio</option>
                <option value="07">Julio</option><option value="08">Agosto</option>
                <option value="09">Septiembre</option><option value="10">Octubre</option>
                <option value="11">Noviembre</option><option value="12">Diciembre</option>
            </select>
        </label>
        <label class="report-filter-field">
            <span>Año</span>
            <input type="number" id="rep-anio" min="2020" max="2100">
        </label>
        <label class="report-filter-field report-economic-filter">
            <span>Económico</span>
            <input type="search" id="rep-search-input" placeholder="Todos" onkeydown="if(event.key==='Enter') filtrarServiciosPreventivos()">
        </label>
        <div class="report-filter-actions">
            <button type="button" class="report-filter-button primary" onclick="filtrarServiciosPreventivos()">Filtrar</button>
            <button type="button" class="report-filter-button" onclick="limpiarFiltrosServicios()">Cancelar</button>
        </div>
    </div>
</div>

<div class="management-card master-card">
    <div id="rep-empty-state" class="module-empty-card">
        <div class="empty-icon">🛠️</div>
        <h3>Servicios Preventivos</h3>
        <p>Seleccione un módulo para consultar y exportar el detalle de servicios preventivos programados y ejecutados.</p>
    </div>
    <div id="rep-no-records" class="module-empty-card no-records-card" hidden>
        <div class="empty-icon">📭</div>
        <h3>No hay registros</h3>
        <p>No se encontraron servicios para los filtros seleccionados.</p>
    </div>

    <div class="master-table-wrapper" id="rep-table-wrapper" style="display: none;">
        <table class="excel-table reporte-table" id="tabla-servicios-preventivos">
            <thead>
                <tr>
                    <th rowspan="2">#</th>
                    <th rowspan="2">ECONÓMICO</th>
                    <th colspan="4" class="group-header">FOLIO</th>
                    <th colspan="2" class="group-header">INGRESO A TALLER</th>
                    <th rowspan="2">FECHA SALE DE TALLER</th>
                </tr>
                <tr>
                    <th>No. Orden Reparación</th>
                    <th>Tipo Servicio</th>
                    <th>Fecha de creación</th>
                    <th>Kilometraje [Km]</th>
                    <th>Fecha</th>
                    <th>Kilometraje [Km]</th>
                </tr>
            </thead>
            <tbody id="tbody-servicios-preventivos"></tbody>
        </table>
    </div>
</div>

<div class="pagination-wrapper" id="rep-pagination-wrapper">
    <div class="pagination-container" id="rep-pagination-controls"></div>
</div>

<script>
    const repUserModulo = <?= json_encode($user_modulo, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
</script>
<script src="/static/js/modulos/odometro_data.js?v=3.0"></script>
<script src="/static/js/components/pagination-fab.js?v=7.0"></script>
<script src="/static/js/modulos/reportes/servicios_preventivos.js?v=5.0"></script>