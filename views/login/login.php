<!DOCTYPE html>
<html lang="es-MX">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login | RTP-Preventivo</title>
    <link rel="icon" href="/static/img/logos/main_logo.png" type="image/png">
    
    <!-- 🟢 NUEVAS RUTAS DE CSS ORGANIZADAS -->
    <link rel="stylesheet" href="/static/css/base/base_public.css">
    <link rel="stylesheet" href="/static/css/login/login.css">
    <link rel="stylesheet" href="/static/css/components/accessibility.css">
</head>
<body>

    <div class="overlay"></div>

    <header class="glass-panel">
        <a href="/" class="header-left" style="text-decoration: none; cursor: pointer;">
            <img src="/static/img/logos/logo-rtp.png" alt="Logo Oficial RTP" class="header-logo">
            <h1>RED DE TRANSPORTE DE PASAJEROS</h1>        
        </a>
    </header>

    <main>
        <div class="login-card">
            <h2>Acceder a RTP-Preventivo</h2>
            
            <?php if (!empty($error_message)): ?>
                <div style="background: rgba(255, 0, 0, 0.2); color: #ff8080; padding: 10px; border-radius: 8px; margin-bottom: 15px; text-align: center;">
                    <?= htmlspecialchars($error_message) ?>
                </div>
            <?php endif; ?>

            <form id="login-form" method="POST">                
                <div class="input-group">
                    <label for="username">Login:</label>
                    <input type="text" id="username" name="username" required autocomplete="off">
                </div>
                
                <div class="input-group">
                    <label for="password">Contraseña:</label>
                    <input type="password" id="password" name="password" required>
                </div>

                <div class="actions-container">
                    <button type="submit" class="btn btn-primary">Entrar</button>
                    <button type="reset" id="btn-limpiar" class="btn btn-secondary">Limpiar</button>                
                    <a href="https://rtp.cdmx.gob.mx" target="_blank" class="support-link">Más sobre RTP</a>
                    <a href="/soporte-login" class="support-link">¿Necesitas Ayuda?</a>
                </div>
            </form>
        </div>
    </main>
    
    <?php 
    @include __DIR__ . '/../components/footer.php';
    @include __DIR__ . '/../components/fab.php';
    @include __DIR__ . '/../components/toast.php';
    ?>
    
    <!-- 🟢 NUEVA RUTA DE JS ORGANIZADO -->
    <script src="/static/js/components/cache-control.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                if (typeof showToast === 'function') {
                    showToast('Tip: Explora el menú flotante inferior derecho para cambiar temas y letras.', 'info', 6000);
                }
            }, 800);

            const btnLimpiar = document.getElementById('btn-limpiar');
            if (btnLimpiar) {
                btnLimpiar.addEventListener('click', () => {
                    if (typeof showToast === 'function') {
                        showToast('Campos limpiados', 'info', 3000);
                    }
                });
            }
        });
    </script>
</body>
</html>