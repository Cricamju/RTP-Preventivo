<?php
// views/base.php
require_once __DIR__ . '/../helpers/module_access.php';
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$role = $_SESSION['rol'] ?? 'consulta';
$username = $_SESSION['username'] ?? 'Usuario';
$user_modulo = $_SESSION['modulo_usuario'] ?? '';

// Formatear el texto del módulo para que se vea amigable
if ($user_modulo === 'central') {
    $moduloTexto = '🏢 Oficinas Centrales';
} elseif (!empty($user_modulo)) {
    $moduloTexto = 'Módulo ' . str_pad($user_modulo, 2, '0', STR_PAD_LEFT);
} else {
    $moduloTexto = 'Sin Módulo Asignado';
}


// Formatear el rol con su debida capitalización
$roleLower = strtolower($role);
$rolTexto = ucfirst($roleLower);

$requestPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$currentModuleCss = '';

switch ($requestPath) {
    case '/odometro':
        $currentModuleCss = '/static/css/modulos/odometro.css';
        break;
    case '/gsp':
        $currentModuleCss = '/static/css/modulos/gsp.css';
        break;
    case '/orden-reparacion':
        $currentModuleCss = '/static/css/modulos/generar_orden_reparacion.css';
        break;
    case '/gestion-usuarios':
        $currentModuleCss = '/static/css/modulos/gestion_usuarios.css';
        break;
    case '/reportes':
    case '/reportes/servicios-preventivos':
        $currentModuleCss = '/static/css/modulos/reportes/servicios_preventivos.css';
        break;
    case '/reportes/historicos-km-preventivos':
        $currentModuleCss = '/static/css/modulos/reportes/historicos_km_preventivos.css';
        break;
    case '/reportes/historicos-dia-dia':
        $currentModuleCss = '/static/css/modulos/reportes/historicos_dia_dia.css';
        break;
}

$isReportesRoute = str_starts_with($requestPath, '/reportes');


?>
<!DOCTYPE html>
<html lang="es-MX">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($page_title ?? 'Intranet') ?> | RTP-Preventivo</title>
    <link rel="icon" href="/static/img/logos/main_logo.png" type="image/png">
    
    <link rel="stylesheet" href="/static/css/base/base_private.css?v=9.0">
    <link rel="stylesheet" href="/static/css/components/accessibility.css">

    <?php if (!empty($currentModuleCss)): ?>
        <link rel="stylesheet" href="<?= $currentModuleCss ?>?v=14.0">
    <?php endif; ?>
    <link rel="stylesheet" href="/static/css/components/module-topbar.css?v=1.1">

    <script>
        window.RTP_MODULE_CONTEXT = <?= json_encode(rtpModuleContext(), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
    </script>
    <script defer src="/static/js/components/module-context.js?v=1.0"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js"></script>
</head>
<body class="theme-<?= strtolower($role) ?>">

    <div class="overlay"></div>

    <header>
        <a href="/" class="header-left" style="text-decoration: none; cursor: pointer;">
            <img src="/static/img/logos/logo-rtp.png" alt="Logo Oficial RTP" class="header-logo">
            <h1>SISTEMA DE MANTENIMIENTO RTP</h1>
        </a>
        
        <!-- 🟢 CONTENEDOR DERECHO CON MAYOR ESPACIADO -->
        <div class="header-right" style="display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
            <div class="user-profile-wrapper" id="user-profile-btn" style="cursor: pointer; text-align: center;">
                <div class="user-profile" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <span>👤</span> 
                    <span class="username-text" style="font-weight: bold;"><?= htmlspecialchars($username) ?></span> 
                    <span class="dropdown-arrow">▾</span>
                </div>
                <!-- 🟢 MÓDULO Y ROL CON MARGEN SUPERIOR AUMENTADO -->
                <div class="user-profile-meta" style="font-size: 0.75rem; color: var(--text-muted, #9ca3af); margin-top: 10px; text-align: center; line-height: 1.2;">
                    <?= htmlspecialchars($moduloTexto) ?> - <span style="font-weight: 600;"><?= htmlspecialchars($rolTexto) ?></span>
                </div>
            </div>
        </div>
    </header>

    <!-- 🟢 MENÚ DESPLEGABLE CENTRADO CON RESPECTO AL PERFIL -->
    <div id="user-dropdown" class="user-dropdown" style="text-align: center;">
        <a href="/logout" class="dropdown-link" style="display: block; width: 100%; text-align: center;">
            🚪 Cerrar Sesión
        </a>
    </div>

    <nav id="sidebar" class="sidebar">
        <div class="sidebar-nav">
            <a href="/dashboard/<?= $roleLower ?>" class="sidebar-link <?= ($requestPath === '/dashboard/' . $roleLower) ? 'active' : '' ?>">
                <span class="icon">🏠</span> <span class="text">Inicio</span>
            </a>
            
            <?php if ($roleLower === 'admin' || $roleLower === 'editor'): ?>
                <a href="/odometro" class="sidebar-link <?= ($requestPath === '/odometro') ? 'active' : '' ?>">
                    <span class="icon">⏱️</span> <span class="text">Captura de Odómetro</span>
                </a>
                <a href="/ordenes-reparacion" class="sidebar-link <?= ($requestPath === '/ordenes-reparacion' || $requestPath === '/correctivo') ? 'active' : '' ?>">
                    <span class="icon">📋</span> <span class="text">Órdenes de Reparación</span>
                </a>
            <?php endif; ?>

            <?php if ($roleLower === 'admin' || $roleLower === 'consulta'): ?>
                <div class="sidebar-group <?= $isReportesRoute ? 'open current' : '' ?>" id="reportes-group">
                    <button type="button" class="sidebar-link sidebar-toggle <?= $isReportesRoute ? 'active' : '' ?>" id="btn-toggle-reportes" aria-expanded="<?= $isReportesRoute ? 'true' : 'false' ?>">
                        <span class="icon">📊</span>
                        <span class="text">Generar Reportes</span>
                        <span class="submenu-arrow">▾</span>
                    </button>
                    <div class="sidebar-submenu" id="reportes-submenu">
                        <a href="/reportes/servicios-preventivos" class="sidebar-sublink <?= ($requestPath === '/reportes/servicios-preventivos' || $requestPath === '/reportes') ? 'active' : '' ?>">
                            <span class="sub-icon">🛠️</span>
                            <span class="text">Servicios Preventivos</span>
                        </a>
                        <a href="/reportes/historicos-km-preventivos" class="sidebar-sublink <?= ($requestPath === '/reportes/historicos-km-preventivos') ? 'active' : '' ?>">
                            <span class="sub-icon">📈</span>
                            <span class="text">Históricos KM y Preventivos</span>
                        </a>
                        <a href="/reportes/historicos-dia-dia" class="sidebar-sublink <?= ($requestPath === '/reportes/historicos-dia-dia') ? 'active' : '' ?>">
                            <span class="sub-icon">📅</span>
                            <span class="text">Históricos KM Día Día</span>
                        </a>
                    </div>
                </div>
            <?php endif; ?>

            <?php if ($roleLower === 'admin'): ?>
                <a href="/gestion-usuarios" class="sidebar-link <?= ($requestPath === '/gestion-usuarios') ? 'active' : '' ?>">
                    <span class="icon">👥</span> <span class="text">Gestión de Usuarios</span>
                </a>
            <?php endif; ?>
        </div>
        
        <div class="sidebar-bottom">
            <a href="/ayuda" class="sidebar-link <?= ($requestPath === '/ayuda') ? 'active' : '' ?>">
                <span class="icon">❓</span> <span class="text">Ayuda del Sistema</span>
            </a>
        </div>
    </nav>
    
    <main class="content-area">
        <?php 
        if (isset($content_view) && file_exists($content_view)) {
            include $content_view;
        } else {
            $error_codigo = 404;
            $error_mensaje = '¡Módulo no disponible!';
            $error_descripcion = 'El módulo solicitado aún se encuentra en desarrollo o no existe.';
            include __DIR__ . '/error/error_private.php';
        }
        ?>
    </main>
    
    <?php 
    @include __DIR__ . '/components/footer.php';
    @include __DIR__ . '/components/fab.php';
    @include __DIR__ . '/components/toast.php';
    ?>
    <script src="/static/js/components/sidebar.js"></script>
    <script src="/static/js/components/theme.js"></script>
    <script src="/static/js/components/cache-control.js"></script>    
</body>
</html>