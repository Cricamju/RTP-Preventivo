<div class="odometro-sticky-header" id="sticky-panel">
    <div class="header-content-inline">
        
        <div class="inline-title">
            <h2>📊 Control de Odómetros</h2>
        </div>

        <div class="inline-search">
            <input type="text" id="search-input" placeholder="🔍 Buscar por económico, orden..." onkeyup="filterTable()">
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

<div class="management-card odometro-card">
    <div class="table-wrapper">
        <table class="users-table excel-table" id="odometro-table">
            <colgroup>
                <col style="width: 70px;">
                <col style="width: 90px;">
                <?php if (strtolower($role) === 'admin'): ?>
                <col style="width: 120px;">
                <?php endif; ?>
                <col style="width: 130px;">
                <col style="width: 110px;">
                <col style="width: 130px;">
                <col style="width: 110px;">
                <col style="width: 110px;">
                <col style="width: 90px;">
                <col style="width: 100px;">
                <?php if (strtolower($role) === 'admin'): ?>
                <col style="width: 100px;">
                <?php endif; ?>
                <col style="width: 110px;">
                <col id="col-acciones" style="display: none; width: 60px;">
            </colgroup>
            <thead>
                <tr class="header-row-1">
                    <th rowspan="2" onclick="sortTable('modulo')">Mód. ⇅</th>
                    <th rowspan="2" onclick="sortTable('economico')">Económico ⇅</th>
                    
                    <?php if (strtolower($role) === 'admin'): ?>
                    <th rowspan="2" onclick="sortTable('fecha_alta')">Fecha Alta ⇅</th>
                    <?php endif; ?>

                    <th colspan="2" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.2);">ODÓMETRO ACTUAL</th>
                    <th colspan="2" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.2);">ÚLTIMO MANTENIMIENTO</th>
                    <th rowspan="2" onclick="sortTable('kmAcum')">Km Acum. ⇅</th>
                    <th rowspan="2" onclick="sortTable('dias')">Días ⇅</th>
                    <th rowspan="2" onclick="sortTable('orden')">Orden ⇅</th>
                    
                    <?php if (strtolower($role) === 'admin'): ?>
                    <th rowspan="2" onclick="sortTable('servicios')">Servicios ⇅</th>
                    <?php endif; ?>

                    <th rowspan="2" onclick="sortTable('estado')">Estado ⇅</th>
                    <th rowspan="2" id="th-acciones" style="display: none; text-align: center;">Acciones</th>
                </tr>
                <tr class="header-row-2">
                    <th onclick="sortTable('fechaActual')">Fecha ⇅</th>
                    <th onclick="sortTable('kmActual')">Km ⇅</th>
                    <th onclick="sortTable('fechaMant')">Fecha ⇅</th>
                    <th onclick="sortTable('kmMant')">Km ⇅</th>
                </tr>
            </thead>
            <tbody id="odometro-body">
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
<script src="/static/js/modulos/odometro.js?v=17.0"></script>