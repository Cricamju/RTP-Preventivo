<div class="gsp-sticky-header" id="sticky-panel">
    <div class="header-content-inline">
        <div class="inline-title">
            <h2>🛠️ Captura GSP</h2>
        </div>
        <div class="inline-search">
            <input type="text" id="search-input" placeholder="🔍 Buscar por económico, orden, tipo..." onkeyup="filterTable()">
        </div>
        <div class="inline-controls">
            <button class="btn-export excel" onclick="exportToExcel()">📊 Excel</button>
            <button class="btn-export pdf" onclick="exportToPDF()">📄 Imprimir</button>

            <div id="admin-tools" style="display: none; gap: 10px;">
                <button class="btn-primary" id="btn-add-row" onclick="addNewRow()">+ Nueva Fila</button>
                <button class="btn-primary btn-save" id="btn-save-data" onclick="saveData()">💾 Guardar</button>
            </div>
            
            <?php if (strtolower($role) === 'admin'): ?>
                <button id="btn-toggle-edit" class="btn-toggle-mode readonly" onclick="toggleEditMode()">
                    👁️ Modo Consulta
                </button>
            <?php else: ?>
                <span class="view-mode-badge readonly">👁️ Modo Consulta</span>
            <?php endif; ?>
        </div>
    </div>
</div>

<div class="management-card gsp-card">
    <div class="table-wrapper">
        <table class="users-table excel-table" id="gsp-table">
            <colgroup>
                <col style="width: 80px;">
                <col style="width: 130px;">
                <col style="width: 90px;">
                <col style="width: 130px;">
                <col style="width: 110px;">
                <col style="width: 130px;">
                <col style="width: 110px;">
                <col style="width: 110px;">
                <col style="width: 90px;">
                <col style="width: 130px;">
                <col style="width: 180px;">
                <col style="width: 120px;">
                <col id="col-acciones" style="display: none; width: 60px;">
            </colgroup>
            <thead>
                <tr class="header-row-1">
                    <th rowspan="2" onclick="sortTable('no_orden')">No. Orden ⇅</th>
                    <th rowspan="2" onclick="sortTable('fecha_gsp')">Fecha GSP ⇅</th>
                    <th rowspan="2" onclick="sortTable('economico')">Económico ⇅</th>
                    <th colspan="2" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.2);">ODÓMETRO ACTUAL</th>
                    <th colspan="2" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.2);">ÚLTIMO MANTENIMIENTO</th>
                    <th rowspan="2" onclick="sortTable('km_acum')">Km Acumulado ⇅</th>
                    <th rowspan="2" onclick="sortTable('dias')">Días Trans. ⇅</th>
                    <th rowspan="2" onclick="sortTable('fecha_alta')">Fecha Alta ⇅</th>
                    <th rowspan="2" onclick="sortTable('tipo')">Tipo ⇅</th>
                    <th rowspan="2" onclick="sortTable('estado')">Estado ⇅</th>
                    <th rowspan="2" id="th-acciones" style="display: none; text-align: center;">Acciones</th>
                </tr>
                <tr class="header-row-2">
                    <th onclick="sortTable('fecha_actual')">Fecha ⇅</th>
                    <th onclick="sortTable('km_actual')">Km ⇅</th>
                    <th onclick="sortTable('fecha_mant')">Fecha ⇅</th>
                    <th onclick="sortTable('km_mant')">Km ⇅</th>
                </tr>
            </thead>
            <tbody id="gsp-body">
            </tbody>
        </table>
    </div>

    <div class="pagination-wrapper">
        <div id="pagination-controls" class="pagination-container"></div>
    </div>
</div>

<script>
    const userRole = "<?= strtolower($role) ?>";
</script>
<script src="/static/js/modulos/ gsp.js?v=16.0"></script>