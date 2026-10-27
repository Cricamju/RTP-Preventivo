<?php
// views/modulos/orden_reparacion.php
$economico = $_GET['economico'] ?? 'N/A';
$modulo = $_GET['modulo'] ?? '03';
$servicio_sugerido = $_GET['servicio'] ?? 'A'; 
$modelo_unidad = $_GET['modelo'] ?? 'Volvo Caio Access 2020'; 
$color_semaforo = $_GET['color'] ?? 'verde'; 

// Mapeo exacto de los nombres de tus archivos en assets/pdfs_gsp/
function obtenerPdfManual($modelo) {
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

$pdfManual = obtenerPdfManual($modelo_unidad);

// Asignación de colores basada en el parámetro de la tabla
$colorHex = '#10b981'; // Verde por defecto
$bgHex = 'rgba(16, 185, 129, 0.12)';

if ($color_semaforo === 'amarillo') {
    $colorHex = '#f59e0b';
    $bgHex = 'rgba(245, 158, 11, 0.12)';
} elseif ($color_semaforo === 'rojo') {
    $colorHex = '#ef4444';
    $bgHex = 'rgba(239, 68, 68, 0.12)';
}
?>
<link rel="stylesheet" href="/static/css/modulos/correctivo.css?v=4.1">

<div class="correctivo-sticky-header">
    <div class="header-content-inline">
        <div class="inline-title">
            <h2>⚙️ Generación de Orden de Reparación</h2>
        </div>
        <div class="inline-controls">
            <a href="/odometro" class="btn-volver-capsule">
                <span>🔙 Volver a Odómetros</span>
            </a>
        </div>
    </div>
</div>

<!-- 🟢 Margen superior aumentado a 90px para separarlo holgadamente de la barra superior -->
<div class="management-card correctivo-card" style="max-width: 900px; margin: 90px auto 60px auto; padding: 25px;">
    <div class="document-container" style="text-align: center;">
        
        <!-- Encabezado Institucional -->
        <div class="doc-header" style="display: flex; align-items: center; gap: 20px; border-bottom: 2px solid var(--rtp-green); padding-bottom: 15px; margin-bottom: 20px; text-align: left;">
            <div class="doc-logo">
                <img src="/static/img/logos/logo-rtp.png" alt="RTP" style="width: 80px;">
            </div>
            <div class="doc-title-box" style="flex: 1;">
                <h2 style="margin: 0; font-size: 1.2rem; color: var(--rtp-green);">RED DE TRANSPORTE DE PASAJEROS (RTP)</h2>
                <h3 style="margin: 5px 0; font-size: 0.95rem; color: var(--text-muted);">SISTEMA DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO</h3>
                <span class="badge-modulo" style="background: rgba(0,147,69,0.15); color: var(--rtp-green); padding: 3px 10px; border-radius: 6px; font-weight: 700; font-size: 0.8rem;">MÓDULO: <?php echo htmlspecialchars($modulo); ?></span>
            </div>
            <div>
                <a href="/assets/pdfs_gsp/<?php echo $pdfManual; ?>" target="_blank" class="btn-primary" style="background: #dc2626; color: white; padding: 8px 14px; border-radius: 8px; text-decoration: none; font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;">
                    🖨️ Imprimir G.S.P.
                </a>
            </div>
        </div>

        <!-- DATOS DE LA UNIDAD -->
        <div class="doc-section" style="margin-bottom: 25px;">
            <div class="section-title" style="font-size: 0.9rem; font-weight: 700; margin-bottom: 10px; color: var(--text-light); text-align: center;">
                📊 DATOS DE LA UNIDAD SELECCIONADA (ECONÓMICO: <?php echo htmlspecialchars($economico); ?>)
            </div>
            <div class="table-responsive">
                <table class="doc-table" style="width: 100%; border-collapse: collapse; text-align: center; font-size: 0.85rem;">
                    <thead>
                        <tr style="background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <th style="padding: 8px; text-align: center;">ECONÓMICO</th>
                            <th style="padding: 8px; text-align: center;">MODELO / UNIDAD</th>
                            <th style="padding: 8px; text-align: center;">FECHA ODÓMETRO</th>
                            <th style="padding: 8px; text-align: center;">KILOMETRAJE [Km]</th>
                            <th style="padding: 8px; text-align: center;">SERVICIO SUGERIDO</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 8px; text-align: center;"><strong><?php echo htmlspecialchars($economico); ?></strong></td>
                            <td style="padding: 8px; text-align: center;"><?php echo htmlspecialchars($modelo_unidad); ?></td>
                            <td style="padding: 8px; text-align: center;"><?php echo date('d-m-Y'); ?></td>
                            <td style="padding: 8px; text-align: center;">429,358.4</td>
                            <td style="padding: 8px; text-align: center;">
                                <span style="background: <?php echo $bgHex; ?>; color: <?php echo $colorHex; ?>; border: 1px solid <?php echo $colorHex; ?>; padding: 4px 10px; border-radius: 6px; font-weight: bold;">
                                    <?php echo htmlspecialchars($servicio_sugerido); ?>
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- FORMULARIO DE ORDEN -->
        <div class="doc-section form-section" style="background: rgba(0,0,0,0.15); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); text-align: left;">
            
            <div class="section-title green-bg" style="font-weight: 700; margin-bottom: 20px; padding: 10px 15px; background: var(--rtp-green); color: white; border-radius: 8px; text-align: center; font-size: 0.95rem;">
                📝 DATOS DE LA ORDEN DE REPARACIÓN
            </div>
            
            <form action="/correctivo/guardar" method="POST" class="order-form">
                <input type="hidden" name="economico" value="<?php echo htmlspecialchars($economico); ?>">
                <input type="hidden" name="modulo" value="<?php echo htmlspecialchars($modulo); ?>">
                <input type="hidden" name="tipo_servicio" value="<?php echo htmlspecialchars($servicio_sugerido); ?>">
                
                <!-- Tipo de Servicio Fijo con Color Sincronizado -->
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 6px; font-size: 0.85rem; text-align: center;">TIPO DE SERVICIO (INAMOVIBLE SEGÚN G.S.P.):</label>
                    <div style="max-width: 500px; margin: 0 auto; padding: 15px; background: <?php echo $bgHex; ?>; border: 1.5px solid <?php echo $colorHex; ?>; border-radius: 10px; text-align: center;">
                        <div style="font-size: 1.2rem; font-weight: bold; color: <?php echo $colorHex; ?>;">
                            <?php echo htmlspecialchars($servicio_sugerido); ?>
                        </div>
                        <div style="font-size: 0.9rem; font-weight: 600; color: var(--text-light); margin-top: 4px;">
                            (Preventivo Normativo Oficial)
                        </div>
                        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 6px;">
                            Operaciones estipuladas en el manual asignado (<?php echo $pdfManual; ?>).
                        </div>
                    </div>
                </div>

                <!-- Fecha de Alta (Restringido a partir de hoy) -->
                <div class="form-group" style="margin-bottom: 25px; text-align: center;">
                    <label style="display: block; font-weight: 600; margin-bottom: 6px; font-size: 0.85rem;">FECHA DE ALTA (MÍNIMO HOY):</label>
                    <input type="date" name="fecha_alta" class="custom-date-input" required min="<?php echo date('Y-m-d'); ?>" value="<?php echo date('Y-m-d'); ?>" style="width: 100%; max-width: 300px; padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: var(--text-light); text-align: center;">
                </div>

                <!-- Botones de Acción -->
                <div class="form-actions" style="display: flex; justify-content: flex-end; gap: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
                    <a href="/odometro" class="btn-action-cancel" style="padding: 9px 18px; background: #6b7280; color: white; border-radius: 8px; text-decoration: none; font-size: 0.9rem;">Cancelar</a>
                    <button type="submit" class="btn-action-save" style="padding: 9px 18px; background: var(--rtp-green); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem;">💾 Salvar Orden</button>
                </div>
            </form>
        </div>

    </div>
</div>