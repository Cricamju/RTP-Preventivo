<?php
// views/base.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$role = $_SESSION['rol'] ?? 'consulta';
$username = $_SESSION['username'] ?? 'Usuario';

$requestPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$currentModuleCss = '';

switch ($requestPath) {
    case '/odometro':
        $currentModuleCss = '/static/css/modulos/odometro.css';
        break;
    case '/gsp':
        $currentModuleCss = '/static/css/modulos/gsp.css';
        break;
    case '/correctivo':
        $currentModuleCss = '/static/css/modulos/correctivo.css';
        break;
    case '/gestion-usuarios':
        $currentModuleCss = '/static/css/modulos/gestion_usuarios.css';
        break;
}
?>
<!DOCTYPE html>
<html lang="es-MX">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($page_title ?? 'Intranet') ?> | RTP-Preventivo</title>
    <link rel="icon" href="/static/img/logos/main_logo.png" type="image/png">
    
    <link rel="stylesheet" href="/static/css/base/base_private.css">
    <link rel="stylesheet" href="/static/css/components/accessibility.css">

    <?php if (!empty($currentModuleCss)): ?>
        <link rel="stylesheet" href="<?= $currentModuleCss ?>?v=3.0">
    <?php endif; ?>

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
        
        <div class="header-right">
            <div class="user-profile-wrapper" id="user-profile-btn">
                <div class="user-profile">
                    👤 <span style="margin-left: 8px;" class="username-text"><?= htmlspecialchars($username) ?></span> <span class="dropdown-arrow">▾</span>
                </div>
            </div>
        </div>
    </header>

    <div id="user-dropdown" class="user-dropdown">
        <a href="/logout" class="dropdown-link">
            🚪 Cerrar Sesión
        </a>
    </div>

    <nav id="sidebar" class="sidebar">
        <div class="sidebar-nav">
            <a href="/dashboard/<?= strtolower($role) ?>" class="sidebar-link <?= ($requestPath === '/dashboard/' . strtolower($role)) ? 'active' : '' ?>">
                <span class="icon">🏠</span> <span class="text">Inicio</span>
            </a>
            
            <?php if (strtolower($role) === 'admin' || strtolower($role) === 'editor'): ?>
                <a href="/odometro" class="sidebar-link <?= ($requestPath === '/odometro') ? 'active' : '' ?>">
                    <span class="icon">⏱️</span> <span class="text">Captura de Odómetro</span>
                </a>
                <a href="/gsp" class="sidebar-link <?= ($requestPath === '/gsp') ? 'active' : '' ?>">
                    <span class="icon">🛠️</span> <span class="text">Módulo GSP (Preventivo)</span>
                </a>
                <a href="/correctivo" class="sidebar-link <?= ($requestPath === '/correctivo') ? 'active' : '' ?>">
                    <span class="icon">📋</span> <span class="text">Órdenes de Reparación</span>
                </a>
            <?php endif; ?>

            <?php if (strtolower($role) === 'admin' || strtolower($role) === 'consulta'): ?>
                <a href="/reportes" class="sidebar-link <?= ($requestPath === '/reportes') ? 'active' : '' ?>">
                    <span class="icon">📊</span> <span class="text">Generar Reportes</span>
                </a>
            <?php endif; ?>

            <?php if (strtolower($role) === 'admin'): ?>
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