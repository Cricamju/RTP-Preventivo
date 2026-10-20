<?php
// views/modulos/reportes.php
?>
<div class="welcome-card" style="max-width: 800px; margin: 40px auto; padding: 40px;">
    <h2>📊 Generación de Reportes del Sistema</h2>
    <p>Módulo analítico para la consulta y exportación consolidada del estatus de la flota en la Red de Transporte de Pasajeros.</p>
    
    <div style="margin-top: 30px; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; text-align: left;">
        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
            <h4 style="color: var(--rtp-green); margin-top: 0;">📈 Reporte Kilométrico</h4>
            <p style="font-size: 0.9rem; color: var(--text-muted);">Kilometraje acumulado por unidad y módulo operativo.</p>
            <button class="btn-primary" onclick="alert('Generando reporte en desarrollo...');" style="margin-top: 10px; width: 100%;">Descargar PDF</button>
        </div>
        
        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
            <h4 style="color: var(--rtp-green); margin-top: 0;">🛠️ Reporte Preventivo</h4>
            <p style="font-size: 0.9rem; color: var(--text-muted);">Historial de servicios GSP y mantenimientos mayores.</p>
            <button class="btn-primary" onclick="alert('Generando reporte en desarrollo...');" style="margin-top: 10px; width: 100%;">Descargar Excel</button>
        </div>
    </div>
</div>