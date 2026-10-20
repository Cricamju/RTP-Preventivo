<?php
// views/modulos/ayuda.php
?>
<div class="welcome-card" style="max-width: 800px; margin: 40px auto; padding: 40px;">
    <h2>❓ Ayuda y Soporte Técnico</h2>
    <p>Manual de usuario del Sistema de Mantenimiento RTP-Preventivo.</p>
    
    <div style="margin-top: 25px; text-align: left;">
        <h4 style="color: var(--rtp-green);">Módulos disponibles según tu perfil de usuario:</h4>
        <ul style="color: var(--text-muted); line-height: 1.8;">
            <?php if (strtolower($role) === 'admin' || strtolower($role) === 'editor'): ?>
                <li><strong>Captura de Odómetro:</strong> Registro diario de kilometraje y estatus de unidades.</li>
                <li><strong>Módulo GSP (Preventivo):</strong> Programación y seguimiento de servicios de mantenimiento.</li>
                <li><strong>Órdenes de Reparación:</strong> Alta y seguimiento de órdenes correctivas.</li>
            <?php endif; ?>

            <?php if (strtolower($role) === 'admin' || strtolower($role) === 'consulta'): ?>
                <li><strong>Generar Reportes:</strong> Visualización y exportación de métricas de la flota.</li>
            <?php endif; ?>

            <?php if (strtolower($role) === 'admin'): ?>
                <li><strong>Gestión de Usuarios:</strong> Control de cuentas, contraseñas, permisos y estatus de bloqueo.</li>
            <?php endif; ?>
        </ul>
    </div>
</div>