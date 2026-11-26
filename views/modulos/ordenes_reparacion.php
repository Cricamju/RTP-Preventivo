<?php
// views/modulos/ordenes_reparacion.php
if (!isset($_SESSION['lista_ordenes_reparacion'])) {
    $_SESSION['lista_ordenes_reparacion'] = [
        [
            'economico' => '6002', 
            'modulo' => '03', 
            'modelo' => 'Volvo Caio Access 2020', 
            'tipo_servicio' => 'A (5000 +- 500)', 
            'color' => 'verde',
            'fecha_alta' => '2026-10-26', 
            'no_orden' => '585', 
            'fecha_odo' => '27-10-2026', 
            'km_odo' => '429,358.4', 
            'fecha_mant' => '24-09-2020', 
            'km_mant' => '345,254.0', 
            'km_acum' => '20,104.4', 
            'dias' => '106'
        ]
    ];
}

// 🟢 1. Lógica de permisos y seguridad estricta con manejo flexible de ceros ('4' vs '04')
$user_modulo = trim($_SESSION['modulo_usuario'] ?? '');
$es_central = ($user_modulo === 'central');
$modulos_validos = ['1', '2', '3', '4', '5', '6', '7', '01', '02', '03', '04', '05', '06', '07'];
$modulo_valido = in_array($user_modulo, $modulos_validos);

// 🟢 2. Filtrado seguro en el servidor (Negación por defecto si no hay módulo ni central)
if ($es_central) {
    $moduloActivo = $_SESSION['filtro_modulo_ordenes'] ?? '';
    // Si es central, puede ver todas o filtrar por la seleccionada en el select
    $ordenes = $_SESSION['lista_ordenes_reparacion'];
    if (!empty($moduloActivo) && $moduloActivo !== 'todos') {
        $ordenes = array_filter($ordenes, function($ord) use ($moduloActivo) {
            return intval($ord['modulo']) === intval($moduloActivo);
        });
    }
} elseif ($modulo_valido) {
    // Si tiene un módulo asignado, filtramos strictly por su módulo en PHP usando intval
    $moduloActivo = $user_modulo;
    $ordenes = array_filter($_SESSION['lista_ordenes_reparacion'], function($ord) use ($user_modulo) {
        return intval($ord['modulo']) === intval($user_modulo);
    });
} else {
    // 🔒 Seguridad: Si el admin o usuario no tiene módulo ni es central, no ve nada
    $moduloActivo = '';
    $ordenes = [];
}

function obtenerPdfManualOrden($modelo) {
    $m = strtolower($modelo);
    if (strpos($m, 'biarticulado') !== false) return 'biarticulado.pdf';
    if (strpos($m, 'articulado') !== false) return 'articulado.pdf';
    if (strpos($m, 'yutong') !== false) return 'yutong_2.pdf';
    if (strpos($m, 'dina') !== false) return 'Dina.pdf';
    if (strpos($m, 'masa') !== false) return 'MASA.pdf';
    if (strpos($m, 'cosmopolitan') !== false) return 'Cosmopolitan.pdf';
    if (strpos($m, 'procity') !== false) return 'procity2016.pdf';
    if (strpos($m, 'mercedes') || strpos($m, 'mb_torino') !== false) return 'MB_TORINO.pdf';
    if (strpos($m, 'torino') !== false) return 'torino_volvo.pdf';
    return 'Acces2020.pdf';
}
?>
<link rel="stylesheet" href="/static/css/modulos/ordenes_reparacion.css?v=5.0">
<link rel="stylesheet" href="/static/css/components/table/module-empty-state.css?v=4.0">
<link rel="stylesheet" href="/static/css/components/table/master-table-layout.css?v=7.0">
<link rel="stylesheet" href="/static/css/components/table/data-table.css?v=2.0">
<link rel="stylesheet" href="/static/css/components/table/pagination-fab.css?v=5.0">

<!-- PANEL STICKY SUPERIOR -->
<div class="odometro-sticky-header" id="sticky-panel">
    <div class="header-content-inline">
        <div class="inline-title">
            <h2>📋 Parque Vehicular - Órdenes de Reparación</h2>
        </div>

        <div class="module-selector-box">
            <span class="module-label">MÓDULO</span>
            <select id="module-filter-select" class="module-select-input" onchange="filtrarOrdenes()" <?php echo (!$es_central) ? 'disabled' : ''; ?>>
                <option value="" <?php echo empty($moduloActivo) ? 'selected' : ''; ?>>- Seleccione -</option>
                <option value="todos" <?php echo ($moduloActivo === 'todos') ? 'selected' : ''; ?>>Todos los módulos</option>
                <option value="01" <?php echo ($moduloActivo === '01') ? 'selected' : ''; ?>>Módulo 01</option>
                <option value="02" <?php echo ($moduloActivo === '02') ? 'selected' : ''; ?>>Módulo 02</option>
                <option value="03" <?php echo ($moduloActivo === '03') ? 'selected' : ''; ?>>Módulo 03</option>
                <option value="04" <?php echo ($moduloActivo === '04') ? 'selected' : ''; ?>>Módulo 04</option>
                <option value="05" <?php echo ($moduloActivo === '05') ? 'selected' : ''; ?>>Módulo 05</option>
                <option value="06" <?php echo ($moduloActivo === '06') ? 'selected' : ''; ?>>Módulo 06</option>
                <option value="07" <?php echo ($moduloActivo === '07') ? 'selected' : ''; ?>>Módulo 07</option>
            </select>
        </div>

        <div class="inline-search">
            <input type="text" id="search-input" placeholder="🔍 Buscar por económico, orden..." onkeyup="filtrarOrdenes()">
        </div>
    </div>
</div>

<!-- TARJETA Y TABLA PRINCIPAL -->
<div class="management-card odometro-card module-state-container master-card">
    <div id="ordenes-empty-state" class="module-empty-card" <?php echo empty($moduloActivo) ? '' : 'hidden'; ?>>
        <span class="empty-icon">📋</span>
        <h3>Órdenes de reparación</h3>
        <p>Seleccione un módulo en la barra superior para consultar las órdenes de reparación.</p>
    </div>
    <div id="ordenes-no-records" class="module-empty-card no-records-card" <?php echo (!empty($moduloActivo) && empty($ordenes)) ? '' : 'hidden'; ?>>
        <span class="empty-icon">📭</span>
        <h3>No hay registros</h3>
        <p>No hay órdenes de reparación para el módulo y los filtros seleccionados.</p>
    </div>
    <div class="table-wrapper master-table-wrapper" id="table-wrapper-container" <?php echo (empty($moduloActivo) || empty($ordenes)) ? 'style="display: none;"' : ''; ?>>
        <table class="users-table excel-table" id="tabla-ordenes">
            <colgroup>
                <col style="width: 40px;">
                <col style="width: 60px;" id="col-modulo">
                <col style="width: 70px;">
                <col style="width: 135px;">
                <col style="width: 90px;">
                <col style="width: 80px;">
                <col style="width: 90px;">
                <col style="width: 75px;">
                <col style="width: 85px;">
                <col style="width: 55px;">
                <col style="width: 70px;">
                <col style="width: 95px;">
                <col style="width: 140px;">
                <col style="width: 60px;"> <!-- Orden PDF Base -->
                <col style="width: 60px;"> <!-- Manual -->
                <col style="width: 60px;"> <!-- Editar -->
                <col style="width: 60px;"> <!-- Eliminar -->
                <col style="width: 65px;"> <!-- E/S Mant -->
            </colgroup>
            <thead>
                <tr class="header-row-1">
                    <th rowspan="2">#</th>
                    <th rowspan="2" id="th-col-modulo">Módulo</th>
                    <th rowspan="2">Económico</th>
                    <th rowspan="2">Modelo / Unidad</th>
                    <th colspan="2" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.2);">ODÓMETRO</th>
                    <th colspan="2" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.2);">ÚLTIMO MANTENIMIENTO</th>
                    <th rowspan="2">Km Acum.</th>
                    <th rowspan="2">Días</th>
                    <th rowspan="2">No. Orden</th>
                    <th rowspan="2">Fecha Alta</th>
                    <th rowspan="2">Tipo de Reparación / Servicio</th>
                    <th rowspan="2">Orden PDF</th>
                    <th rowspan="2">Imprimir</th>
                    <th rowspan="2">Editar</th>
                    <th rowspan="2">Eliminar</th>
                    <th rowspan="2">E/S Mant.</th>
                </tr>
                <tr class="header-row-2">
                    <th>Fecha</th>
                    <th>Km</th>
                    <th>Fecha</th>
                    <th>Km</th>
                </tr>
            </thead>
            <tbody id="body-ordenes">
                <?php if (!empty($ordenes)): ?>
                    <?php foreach ($ordenes as $index => $ord): 
                        $pdfFile = obtenerPdfManualOrden($ord['modelo']);
                        $colorClass = $ord['color'] ?? 'verde';
                    ?>
                        <tr class="row-semaforo-<?php echo $colorClass; ?>" data-modulo="<?php echo htmlspecialchars($ord['modulo']); ?>">
                            <td style="text-align: center; font-weight: bold; color: var(--text-muted);"><?php echo $index + 1; ?></td>
                            <td style="text-align: center; font-weight: bold; color: var(--rtp-green);" class="td-modulo">Mód. <?php echo htmlspecialchars($ord['modulo']); ?></td>
                            <td style="text-align: center; font-weight: bold;"><?php echo htmlspecialchars($ord['economico']); ?></td>
                            <td style="text-align: left; padding-left: 8px;"><?php echo htmlspecialchars($ord['modelo']); ?></td>
                            <td style="text-align: center;"><?php echo htmlspecialchars($ord['fecha_odo']); ?></td>
                            <td style="text-align: center;"><?php echo htmlspecialchars($ord['km_odo']); ?></td>
                            <td style="text-align: center;"><?php echo htmlspecialchars($ord['fecha_mant']); ?></td>
                            <td style="text-align: center;"><?php echo htmlspecialchars($ord['km_mant']); ?></td>
                            <td style="text-align: center;"><?php echo htmlspecialchars($ord['km_acum']); ?></td>
                            <td style="text-align: center; font-weight: bold;"><?php echo htmlspecialchars($ord['dias']); ?></td>
                            <td style="text-align: center;"><span style="color: #ef4444; font-weight: bold;"><?php echo htmlspecialchars($ord['no_orden']); ?></span></td>
                            <td style="text-align: center;"><?php echo htmlspecialchars($ord['fecha_alta']); ?></td>
                            <td style="text-align: center;">
                                <span class="semaforo-badge-cell <?php echo $colorClass; ?>">
                                    <?php echo htmlspecialchars($ord['tipo_servicio']); ?>
                                </span>
                            </td>
                            <!-- 📄 Columna: Orden de Mantenimiento Dinámica -->
                            <td style="text-align: center;">
                                <button onclick="generarOrdenPDF('<?php echo $ord['economico']; ?>', '<?php echo $ord['modulo']; ?>', '<?php echo addslashes($ord['modelo']); ?>', '<?php echo $ord['km_odo']; ?>', '<?php echo addslashes($ord['tipo_servicio']); ?>', '<?php echo $ord['no_orden']; ?>', '<?php echo $ord['fecha_odo']; ?>')" class="btn-action-icon" title="Generar Orden de Mantenimiento en PDF">📄</button>
                            </td>
                            <!-- 🖨️ Botón Imprimir PDF Manual Correspondiente -->
                            <td style="text-align: center;">
                                <a href="/assets/pdfs_gsp/<?php echo $pdfFile; ?>" target="_blank" class="btn-action-icon" title="Imprimir Manual G.S.P. (<?php echo htmlspecialchars($ord['modelo']); ?>)">🖨️</a>
                            </td>
                            <!-- ✏️ Botón Editar -->
                            <td style="text-align: center;">
                                <button onclick="editarOrden('<?php echo $ord['economico']; ?>', '<?php echo $ord['modulo']; ?>', '<?php echo addslashes($ord['modelo']); ?>', '<?php echo addslashes($ord['tipo_servicio']); ?>', '<?php echo $ord['fecha_odo']; ?>', '<?php echo $ord['km_odo']; ?>', '<?php echo $ord['fecha_mant']; ?>', '<?php echo $ord['km_mant']; ?>', '<?php echo $ord['km_acum']; ?>', '<?php echo $ord['dias']; ?>', '<?php echo $colorClass; ?>')" class="btn-action-icon" title="Editar Orden">✏️</button>
                            </td>
                            <!-- 🗑️ Botón Eliminar -->
                            <td style="text-align: center;">
                                <button onclick="eliminarOrden('<?php echo $ord['economico']; ?>')" class="btn-action-icon delete" title="Eliminar y devolver al Odómetro">🗑️</button>
                            </td>
                            <!-- 🔄 E/S Mantenimiento -->
                            <td style="text-align: center;"><button onclick="toggleEstadoMant('<?php echo $ord['economico']; ?>')" class="btn-action-icon" title="Entrada / Salida Mantenimiento">🔄</button></td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
<div class="pagination-wrapper module-pagination-hidden" id="ordenes-pagination-wrapper">
    <div class="pagination-container" id="ordenes-pagination-controls"></div>
</div>

<script>
    let paginaOrdenes = 1;
    const filasPorPaginaOrdenes = 50;

    function ajustarAnchoColumnasOrdenes(mostrarColumnaModulo) {
        const tabla = document.getElementById('tabla-ordenes');
        const columnas = Array.from(tabla?.querySelectorAll('colgroup col') || []);
        if (!tabla || !columnas.length) return;

        columnas.forEach((columna, indice) => {
            if (!columna.dataset.baseWidth) {
                columna.dataset.baseWidth = String(Number.parseFloat(columna.style.width) || 0);
            }
            if (indice === 1) columna.style.display = mostrarColumnaModulo ? '' : 'none';
        });

        const columnasVisibles = columnas.filter((columna, indice) =>
            indice !== 1 || mostrarColumnaModulo
        );
        const anchoBaseTotal = columnasVisibles.reduce(
            (total, columna) => total + Number.parseFloat(columna.dataset.baseWidth || '0'),
            0
        );
        if (!anchoBaseTotal) return;

        tabla.style.width = '100%';
        columnasVisibles.forEach(columna => {
            const anchoBase = Number.parseFloat(columna.dataset.baseWidth || '0');
            columna.style.width = `${(anchoBase / anchoBaseTotal) * 100}%`;
        });
    }

    function adjustOrdenesStickyHeaders() {
        const panel = document.getElementById('sticky-panel');
        const wrapper = document.getElementById('table-wrapper-container');
        const headerRows = document.querySelectorAll('#tabla-ordenes thead tr');
        
        if (!panel || !wrapper || headerRows.length === 0) return;

        const rect = panel.getBoundingClientRect();
        const panelBottom = Math.max(rect.bottom, 85); 

        const wrapperRect = wrapper.getBoundingClientRect();
        const theadHeight = document.querySelector('#tabla-ordenes thead').offsetHeight;

        let offset = 0;

        if (wrapperRect.top < panelBottom) {
            offset = panelBottom - wrapperRect.top;
            const maxOffset = wrapperRect.height - theadHeight;
            if (offset > maxOffset) offset = maxOffset;
        }

        headerRows.forEach(tr => {
            tr.style.transform = `translateY(${offset}px)`;
            tr.style.position = 'relative';
            tr.style.zIndex = '40';
            if (offset > 0) {
                tr.style.boxShadow = '0 5px 10px rgba(0,0,0,0.4)';
            } else {
                tr.style.boxShadow = 'none';
            }
        });
    }

    window.addEventListener('scroll', adjustOrdenesStickyHeaders);
    window.addEventListener('resize', adjustOrdenesStickyHeaders);

    // 🟢 Filtrado estricto por Módulo corregido
    function filtrarOrdenes(resetPage = true) {
        const selectModulo = document.getElementById('module-filter-select');
        const inputBusqueda = document.getElementById('search-input');
        const emptyState = document.getElementById('ordenes-empty-state');
        const noRecordsState = document.getElementById('ordenes-no-records');
        const tableWrapper = document.getElementById('table-wrapper-container');
        
        const moduloSeleccionado = selectModulo ? selectModulo.value.trim() : '';
        const textoBusqueda = inputBusqueda ? inputBusqueda.value.toLowerCase().trim() : '';

        if (!moduloSeleccionado) {
            paginaOrdenes = 1;
            if (emptyState) emptyState.hidden = false;
            if (noRecordsState) noRecordsState.hidden = true;
            if (tableWrapper) tableWrapper.style.display = 'none';
            renderPaginationFAB('ordenes-pagination-controls', 0, filasPorPaginaOrdenes, 1, () => {});
            if (typeof setTableModuleActive === 'function') setTableModuleActive(false);
            return;
        }

        if (resetPage) paginaOrdenes = 1;
        if (emptyState) emptyState.hidden = true;

        const esTodos = moduloSeleccionado === 'todos';
        
        const colModulo = document.getElementById('col-modulo');
        const thModulo = document.getElementById('th-col-modulo');
        const celdasModulo = document.querySelectorAll('.td-modulo');
        
        if (colModulo) colModulo.style.display = esTodos ? '' : 'none';
        if (thModulo) thModulo.style.display = esTodos ? '' : 'none';
        celdasModulo.forEach(td => {
            td.style.display = esTodos ? '' : 'none';
        });
        ajustarAnchoColumnasOrdenes(esTodos);

        const filas = Array.from(document.querySelectorAll('#tabla-ordenes tbody tr'))
            .filter(fila => !fila.classList.contains('table-end-filler'));
        const filasCoincidentes = [];
        
        filas.forEach(fila => {
            const moduloFila = fila.getAttribute('data-modulo') ? fila.getAttribute('data-modulo').trim() : '';
            const textoFila = fila.innerText.toLowerCase();
            
            const moduloCoincide = esTodos || parseInt(moduloFila, 10) === parseInt(moduloSeleccionado, 10);
            const textoCoincide = !textoBusqueda || textoFila.includes(textoBusqueda);
            
            if (moduloCoincide && textoCoincide) {
                filasCoincidentes.push(fila);
            } else {
                fila.style.display = 'none'; 
            }
        });

        const totalPaginas = Math.max(1, Math.ceil(filasCoincidentes.length / filasPorPaginaOrdenes));
        if (paginaOrdenes > totalPaginas) paginaOrdenes = totalPaginas;
        const inicio = (paginaOrdenes - 1) * filasPorPaginaOrdenes;
        const filasVisibles = filasCoincidentes.slice(inicio, inicio + filasPorPaginaOrdenes);
        filasCoincidentes.forEach(fila => {
            fila.style.display = filasVisibles.includes(fila) ? '' : 'none';
        });

        const hayRegistros = filasCoincidentes.length > 0;
        if (noRecordsState) noRecordsState.hidden = hayRegistros;
        if (tableWrapper) tableWrapper.style.display = hayRegistros ? 'block' : 'none';
        if (typeof setTableModuleActive === 'function') setTableModuleActive(hayRegistros);
        renderPaginationFAB(
            'ordenes-pagination-controls',
            filasCoincidentes.length,
            filasPorPaginaOrdenes,
            paginaOrdenes,
            pagina => {
                paginaOrdenes = pagina;
                filtrarOrdenes(false);
            }
        );
        if (hayRegistros && typeof updateTableEndFiller === 'function') {
            updateTableEndFiller(tableWrapper, document.getElementById('tabla-ordenes'), filasVisibles[0].cells.length);
        }

        setTimeout(adjustOrdenesStickyHeaders, 50);
    }

    document.addEventListener('DOMContentLoaded', function() {
        filtrarOrdenes();
        setTimeout(adjustOrdenesStickyHeaders, 50);
    });

    function editarOrden(economico, modulo, modelo, servicio, fechaOdo, kmOdo, fechaMant, kmMant, kmAcum, dias, color) {
        const url = `/orden-reparacion?economico=${encodeURIComponent(economico)}&modulo=${encodeURIComponent(modulo)}&modelo=${encodeURIComponent(modelo)}&servicio=${encodeURIComponent(servicio)}&fecha_odo=${encodeURIComponent(fechaOdo)}&km_odo=${encodeURIComponent(kmOdo)}&fecha_mant=${encodeURIComponent(fechaMant)}&km_mant=${encodeURIComponent(kmMant)}&km_acum=${encodeURIComponent(kmAcum)}&dias=${encodeURIComponent(dias)}&color=${encodeURIComponent(color)}`;
        window.location.href = url;
    }

    // 🟢 Confirmación con Toast Bloqueante en lugar de confirm() nativo
    function eliminarOrden(economico) {
        showToast(
            `⚠️ ¿Estás seguro de eliminar la orden del económico <b>${economico}</b>?<br>La unidad regresará al odómetro con su estatus original.`,
            'error',
            0,
            [
                {
                    text: '❌ Tache',
                    class: 'btn-secondary',
                    callback: (close) => close()
                },
                {
                    text: '✅ Palomita',
                    class: 'btn-primary',
                    callback: (close) => {
                        try {
                            let enReparacion = JSON.parse(localStorage.getItem('rtp_unidades_en_reparacion')) || [];
                            enReparacion = enReparacion.filter(eco => eco !== economico);
                            localStorage.setItem('rtp_unidades_en_reparacion', JSON.stringify(enReparacion));
                        } catch(e) {
                            console.error("Error al actualizar localStorage:", e);
                        }
                        close();
                        window.location.href = `/eliminar-orden?eco=${encodeURIComponent(economico)}`;
                    }
                }
            ],
            true // Bloqueante modal
        );
    }
</script>

<script src="/static/js/components/pagination-fab.js?v=7.0"></script>
<script src="/static/js/modulos/ordenes_reparacion.js?v=2.0"></script>