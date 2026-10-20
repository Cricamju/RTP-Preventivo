<?php
// views/error/error_private.php
$codigo = $error_codigo ?? 404;
$mensaje = $error_mensaje ?? '¡Módulo no disponible!';
$descripcion = $error_descripcion ?? 'El módulo solicitado aún se encuentra en desarrollo o no existe.';

$emoji = '🚧'; 
if ($codigo == 403) $emoji = '🔒';
if ($codigo == 500) $emoji = '⚠️';
if ($codigo == 404) $emoji = '🔍';
?>
<link rel="stylesheet" href="/static/css/error/error.css">

<div class="error-container" style="display: flex; justify-content: center; align-items: center; width: 100%; min-height: 75vh;">
    <div class="error-card" style="margin: auto; text-align: center;">
        <span class="error-emoji" style="font-size: 4rem; margin-bottom: 15px; display: block;"><?= $emoji ?></span>
        <h1 style="font-size: 4.5rem; margin: 0; color: var(--rtp-green, #009345); font-weight: 800;"><?= htmlspecialchars($codigo) ?></h1>
        <h2 style="font-size: 1.6rem; margin: 20px 0 10px 0; color: var(--text-light, #ffffff);"><?= htmlspecialchars($mensaje) ?></h2>
        <p style="color: var(--text-muted, rgba(255, 255, 255, 0.7)); margin-bottom: 30px; font-size: 1.05rem;"><?= htmlspecialchars($descripcion) ?></p>
        <a href="/dashboard/<?= strtolower($role ?? 'consulta') ?>" class="back-btn-error" style="display: inline-block; padding: 12px 30px; background: var(--rtp-green, #009345); color: white; text-decoration: none; border-radius: 10px; font-weight: 600;">🏠 Volver al Inicio</a>
    </div>
</div>