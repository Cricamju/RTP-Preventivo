<?php
// views/error/error_public.php
$codigo = $error_codigo ?? 404;
$mensaje = $error_mensaje ?? 'Página no encontrada';
$descripcion = $error_descripcion ?? 'La página que buscas no existe o ha sido movida.';

$emoji = '🔍';
if ($codigo == 403) $emoji = '🚫';
if ($codigo == 500) $emoji = '⚠️';
if ($codigo == 503) $emoji = '🛠️';
?>
<!DOCTYPE html>
<html lang="es-MX">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error <?= htmlspecialchars($codigo) ?> | RTP-Preventivo</title>
    <link rel="icon" href="/static/img/logos/main_logo.png" type="image/png">
    <link rel="stylesheet" href="/static/css/base/base_public.css">
    <link rel="stylesheet" href="/static/css/error/error.css">
</head>
<body class="theme-consulta">
    <div class="overlay"></div>
    
    <header class="glass-panel" style="display: flex; align-items: center; padding: 15px 40px; background: rgba(20, 25, 20, 0.85); backdrop-filter: blur(20px);">
        <a href="/" class="header-left" style="text-decoration: none; display: flex; align-items: center; gap: 15px;">
            <img src="/static/img/logos/logo-rtp.png" alt="Logo Oficial RTP" class="header-logo" style="height: 40px;">
            <h1 style="color: white; font-size: 1.1rem; margin: 0;">SISTEMA DE MANTENIMIENTO RTP</h1>
        </a>
    </header>

    <main class="error-container">
        <div class="error-card">
            <div style="font-size: 3.5rem; margin-bottom: 10px;"><?= $emoji ?></div>
            <h1><?= htmlspecialchars($codigo) ?></h1>
            <h2><?= htmlspecialchars($mensaje) ?></h2>
            <p><?= htmlspecialchars($descripcion) ?></p>
            <a href="/" class="back-btn-error">🔑 Ir a Iniciar Sesión</a>
        </div>
    </main>
</body>
</html>