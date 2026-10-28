<?php
// views/modulos/ordenes_reparacion.php[cite: 25]
if (!isset($_SESSION['lista_ordenes_reparacion'])) {
    $_SESSION['lista_ordenes_reparacion'] = [
        [
            'economico' => '6002', 
            'modulo' => '03', 
            'modelo' => 'Volvo Caio Access 2020', 
            'tipo_servicio' => 'A (5000 +- 500)', 
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
$ordenes = $_SESSION['lista_ordenes_reparacion'];

// Mapeo exacto de los manuales PDF por modelo para el botón Imprimir
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
<link rel="stylesheet" href="/static/css/modulos/ordenes_reparacion.css?v=1.2">

<!-- PANEL STICKY SUPERIOR -->
<div class="odometro-sticky-header">
    <div class="header-content-inline">
        <div class="inline-title">
            <h2>📋 Parque Vehicular - Órdenes de Reparación</h2>
        </div>

        <div class="module-selector-box">
            <span class="module-label">MÓDULO</span>
            <select id="module-filter-select" class="module-select-input" onchange="filtrarOrdenes()">
                <option value="">- Todos -</option>
                <option value="01">Módulo 01</option>
                <option value="02">Módulo 02</option>
                <option value="03" selected>Módulo 03</option>
                <option value="04">Módulo 04</option>
                <option value="05">Módulo 05</option>
                <option value="06">Módulo 06</option>
                <option value="07">Módulo 07</option>
            </select>
        </div>

        <div class="inline-search">
            <input type="text" id="search-input" placeholder="🔍 Buscar por económico, orden..." onkeyup="filtrarOrdenes()">
        </div>
    </div>
</div>

<!-- TARJETA Y TABLA PRINCIPAL -->
<div class="management-card odometro-card">
    <div class="table-wrapper">
        <table class="users-table excel-table" id="tabla-ordenes">
            <colgroup>
                <col style="width: 45px;"><col style="width: 75px;"><col style="width: 145px;"><col style="width: 100px;"><col style="width: 90px;"><col style="width: 100px;"><col style="width: 85px;"><col style="width: 90px;"><col style="width: 60px;"><col style="width: 75px;"><col style="width: 100px;"><col style="width: 160px;"><col style="width: 65px;"><col style="width: 65px;"><col style="width: 65px;"><col style="width: 75px;">
            </colgroup>
            <thead>
                <tr class="header-row-1">
                    <th rowspan="2">#</th>
                    <th rowspan="2">Económico</th>
                    <th rowspan="2">Modelo / Unidad</th>
                    <th colspan="2" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.2);">ODÓMETRO</th>
                    <th colspan="2" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.2);">ÚLTIMO MANTENIMIENTO</th>
                    <th rowspan="2">Km Acum.</th>
                    <th rowspan="2">Días</th>
                    <th rowspan="2">No. Orden</th>
                    <th rowspan="2">Fecha Alta</th>
                    <th rowspan="2">Tipo de Reparación / Servicio</th>
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
                <?php if (empty($ordenes)): ?>
                    <tr>
                        <td colspan="16" style="text-align: center; padding: 40px; color: var(--text-muted);">
                            📭 No hay órdenes de reparación registradas. Selecciona unidades desde el Odómetro.
                        </td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($ordenes as $index => $ord): 
                        $pdfFile = obtenerPdfManualOrden($ord['modelo']);
                    ?>
                        <tr data-modulo="<?php echo htmlspecialchars($ord['modulo']); ?>">
                            <td style="text-align: center; font-weight: bold; color: var(--text-muted);"><?php echo $index + 1; ?></td>
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
                                <span class="semaforo-badge-cell verde">
                                    <?php echo htmlspecialchars($ord['tipo_servicio']); ?>
                                </span>
                            </td>
                            <!-- 🖨️ Botón Imprimir PDF Manual Correspondiente -->
                            <td style="text-align: center;">
                                <a href="/assets/pdfs_gsp/<?php echo $pdfFile; ?>" target="_blank" class="btn-action-icon" title="Imprimir Manual G.S.P. (<?php echo htmlspecialchars($ord['modelo']); ?>)">🖨️</a>
                            </td>
                            <!-- ✏️ Botón Editar (Redirige a Generación con datos) -->
                            <td style="text-align: center;">
                                <button onclick="editarOrden('<?php echo $ord['economico']; ?>', '<?php echo $ord['modulo']; ?>', '<?php echo addslashes($ord['modelo']); ?>', '<?php echo addslashes($ord['tipo_servicio']); ?>', '<?php echo $ord['fecha_odo']; ?>', '<?php echo $ord['km_odo']; ?>', '<?php echo $ord['fecha_mant']; ?>', '<?php echo $ord['km_mant']; ?>', '<?php echo $ord['km_acum']; ?>', '<?php echo $ord['dias']; ?>')" class="btn-action-icon" title="Editar Orden">✏️</button>
                            </td>
                            <!-- 🗑️ Botón Eliminar (Regresa la unidad al Odómetro) -->
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

<script>
    // 🟢 Función para Editar: Envía los parámetros por URL a la vista de generación
    function editarOrden(economico, modulo, modelo, servicio, fechaOdo, kmOdo, fechaMant, kmMant, kmAcum, dias) {
        const url = `/orden-reparacion?economico=${encodeURIComponent(economico)}&modulo=${encodeURIComponent(modulo)}&modelo=${encodeURIComponent(modelo)}&servicio=${encodeURIComponent(servicio)}&fecha_odo=${encodeURIComponent(fechaOdo)}&km_odo=${encodeURIComponent(kmOdo)}&fecha_mant=${encodeURIComponent(fechaMant)}&km_mant=${encodeURIComponent(kmMant)}&km_acum=${encodeURIComponent(kmAcum)}&dias=${encodeURIComponent(dias)}`;
        window.location.href = url;
    }

    // 🟢 Función para Eliminar: Remueve el económico del almacenamiento local y del servidor
    function eliminarOrden(economico) {
        if (confirm(`¿Estás seguro de eliminar la orden del económico ${economico}? La unidad regresará al odómetro con su estatus original.`)) {
            try {
                // Remover de la lista de exclusión en localStorage para que el odómetro la vuelva a mostrar
                let enReparacion = JSON.parse(localStorage.getItem('rtp_unidades_en_reparacion')) || [];
                enReparacion = enReparacion.filter(eco => eco !== economico);
                localStorage.setItem('rtp_unidades_en_reparacion', JSON.stringify(enReparacion));
            } catch(e) {
                console.error("Error al actualizar localStorage:", e);
            }
            // Enviar petición al servidor para quitarlo de la sesión PHP de órdenes
            window.location.href = `/eliminar-orden?eco=${encodeURIComponent(economico)}`;
        }
    }
</script>

<script src="/static/js/modulos/ordenes_reparacion.js?v=1.2"></script>