<?php
// views/modulos/ayuda.php
?>
<div class="welcome-card dashboard-card">
    <h2>❓ Ayuda y Soporte Técnico</h2>
    <p>Guía rápida de los módulos disponibles para tu perfil en RTP-Preventivo.</p>
    
    <h3 class="help-section-title">Módulos de tu perfil</h3>
    <ul class="dashboard-list">
        <?php if (strtolower($role) === 'admin' || strtolower($role) === 'editor'): ?>
            <li><strong>⏱️ Captura de Odómetro:</strong> consulta y captura de kilometraje, estado y datos de mantenimiento de las unidades.</li>
            <li><strong>🧰 Órdenes de Reparación:</strong> consulta y seguimiento de órdenes, con acceso a sus documentos.</li>
        <?php endif; ?>

        <?php if (strtolower($role) === 'admin' || strtolower($role) === 'consulta'): ?>
            <li><strong>📊 Generar Reportes:</strong> consulta de servicios preventivos, históricos de kilometraje y datos diarios; puedes exportar los resultados a Excel o PDF.</li>
        <?php endif; ?>

        <?php if (strtolower($role) === 'admin'): ?>
            <li><strong>👥 Gestión de Usuarios:</strong> administración de cuentas, roles, módulos asignados y estado de acceso.</li>
        <?php endif; ?>
    </ul>

    <p><strong>💡 Consejo:</strong> en los módulos con selector, elige primero el módulo de la unidad para mostrar los datos correspondientes.</p>
    <p class="help-support-note"><em>Si no puedes acceder a una función que necesitas, contacta a la persona administradora del sistema.</em></p>
</div>