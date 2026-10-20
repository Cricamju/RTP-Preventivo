<?php
// views/modulos/gestion_usuarios.php

// 🟢 Consultar usuarios reales de la base de datos local PostgreSQL
$stmt = $pdo->query("SELECT * FROM usuarios ORDER BY id ASC");
$usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Manejo del formulario de creación, edición y desbloqueo de usuarios
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['username'])) {
    $id = $_POST['id'] ?? null;
    $nombre_completo = $_POST['nombre_completo'] ?? '';
    $correo = $_POST['correo_institucional'] ?? '';
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    $adscripcion = $_POST['adscripcion'] ?? '';
    $categoria = $_POST['categoria_puesto'] ?? '';
    $rol = $_POST['rol'] ?? 'Consulta';
    $activo = ($_POST['activo'] === 'true') ? true : false;

    if (!empty($id)) {
        // Actualizar usuario existente y limpiar bloqueos automáticamente
        if (!empty($password)) {
            $passHash = password_hash($password, PASSWORD_DEFAULT);
            $update = $pdo->prepare("UPDATE usuarios SET nombre_completo = ?, correo_institucional = ?, username = ?, password_hash = ?, adscripcion = ?, categoria_puesto = ?, rol = ?, activo = ?, intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?");
            $update->execute([$nombre_completo, $correo, $username, $passHash, $adscripcion, $categoria, $rol, $activo, $id]);
        } else {
            $update = $pdo->prepare("UPDATE usuarios SET nombre_completo = ?, correo_institucional = ?, username = ?, adscripcion = ?, categoria_puesto = ?, rol = ?, activo = ?, intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?");
            $update->execute([$nombre_completo, $correo, $username, $adscripcion, $categoria, $rol, $activo, $id]);
        }
    } else {
        // Crear nuevo usuario con contraseña por defecto si viene vacía
        $passHash = password_hash(!empty($password) ? $password : 'rtp2026', PASSWORD_DEFAULT);
        $insert = $pdo->prepare("INSERT INTO usuarios (nombre_completo, correo_institucional, username, password_hash, adscripcion, categoria_puesto, rol, activo, intentos_fallidos, bloqueado_hasta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NULL)");
        $insert->execute([$nombre_completo, $correo, $username, $passHash, $adscripcion, $categoria, $rol, $activo]);
    }
    
    header("Location: /gestion-usuarios");
    exit;
}

$ahora = (new DateTime())->format('Y-m-d H:i:s');
?>

<div class="management-card">
    <div class="management-header">
        <div>
            <h2>👥 Gestión de Usuarios</h2>
            <p>Administración de cuentas, roles y desbloqueo de accesos locales.</p>
        </div>
        <button class="btn-primary btn-add-user" onclick="openModal()">
            + Nuevo Usuario
        </button>
    </div>

    <div class="table-wrapper">
        <table class="users-table">
            <thead>
                <tr>
                    <th>Nombre y Correo</th>
                    <th>Usuario (Login)</th>
                    <th>Rol</th>
                    <th>Adscripción</th>
                    <th>Estatus</th>
                    <th style="text-align: center;">Acciones</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($usuarios as $u): ?>
                <tr>
                    <td>
                        <strong><?= htmlspecialchars($u['nombre_completo'] ?? 'Sin nombre') ?></strong><br>
                        <span class="user-email-text"><?= htmlspecialchars($u['correo_institucional'] ?? 'Sin correo') ?></span>
                    </td>
                    <td style="font-weight: 500;">@<?= htmlspecialchars($u['username']) ?></td>
                    <td>
                        <?php if ($u['rol'] === 'Admin'): ?>
                            <span class="role-badge admin">Admin</span>
                        <?php elseif ($u['rol'] === 'Editor'): ?>
                            <span class="role-badge editor">Editor</span>
                        <?php else: ?>
                            <span class="role-badge consulta">Consulta</span>
                        <?php endif; ?>
                    </td>
                    <td><?= htmlspecialchars($u['adscripcion'] ?? 'N/A') ?></td>
                    <td>
                        <?php if (!empty($u['bloqueado_hasta']) && $u['bloqueado_hasta'] > $ahora): ?>
                            <span style="color: #f59e0b; font-weight: 600;">🔒 Bloqueado (<?= $u['intentos_fallidos'] ?> fallos)</span>
                        <?php elseif ($u['activo']): ?>
                            <span class="status-active">● Activo</span>
                        <?php else: ?>
                            <span class="status-inactive">● Inactivo</span>
                        <?php endif; ?>
                    </td>
                    <td style="text-align: center;">
                        <button class="btn-action-edit" 
                                onclick="openModal({
                                    id: '<?= $u['id'] ?>', 
                                    nombre_completo: '<?= htmlspecialchars($u['nombre_completo'] ?? '', ENT_QUOTES) ?>', 
                                    username: '<?= htmlspecialchars($u['username'], ENT_QUOTES) ?>', 
                                    correo_institucional: '<?= htmlspecialchars($u['correo_institucional'] ?? '', ENT_QUOTES) ?>', 
                                    rol: '<?= $u['rol'] ?>', 
                                    adscripcion: '<?= htmlspecialchars($u['adscripcion'] ?? '', ENT_QUOTES) ?>', 
                                    categoria_puesto: '<?= htmlspecialchars($u['categoria_puesto'] ?? '', ENT_QUOTES) ?>', 
                                    activo: '<?= $u['activo'] ? 'true' : 'false' ?>', 
                                    bloqueado: '<?= (!empty($u['bloqueado_hasta']) && $u['bloqueado_hasta'] > $ahora) ? 'true' : 'false' ?>',
                                    bloqueado_hasta: '<?= $u['bloqueado_hasta'] ?? '' ?>'
                                })" 
                                title="Editar / Desbloquear Usuario">✏️</button>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- ================= MODAL CREAR / EDITAR ================= -->
<div id="user-modal-overlay" class="modal-overlay">
    <div class="modal-card">
        <h3 id="modal-title" class="modal-title">Nuevo Usuario</h3>
        
        <form id="user-form" method="POST" action="/gestion-usuarios">
            <input type="hidden" id="user_id" name="id">
            
            <div id="block-warning" style="display: none; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 0.95rem;">
                ⚠️ <strong>Este usuario está bloqueado temporalmente por seguridad</strong>.<br>
                ⏳ Tiempo restante de bloqueo: <strong id="timer-display" style="font-size: 1.1rem; color: #fbbf24;">00:00</strong><br>
                <span style="font-size: 0.85rem; opacity: 0.9;">Para perdonar el castigo y <strong>desbloquearlo de inmediato</strong>, presiona el botón verde de guardar abajo.</span>
            </div>
            
            <div class="form-grid">
                <div class="input-group">
                    <label>Nombre Completo *</label>
                    <input type="text" id="nombre_completo" name="nombre_completo" required autocomplete="off">
                </div>
                
                <div class="input-group">
                    <label>Correo Institucional *</label>
                    <input type="email" id="correo_institucional" name="correo_institucional" required autocomplete="off">
                </div>

                <div class="input-group">
                    <label>Usuario (Login) *</label>
                    <input type="text" id="username" name="username" required minlength="4" autocomplete="off">
                </div>
                
                <div class="input-group">
                    <label>Contraseña</label>
                    <input type="password" id="password" name="password" minlength="6" placeholder="Dejar en blanco para no cambiar">
                </div>

                <div class="input-group">
                    <label>Adscripción (Taller/Módulo)</label>
                    <input type="text" id="adscripcion" name="adscripcion">
                </div>

                <div class="input-group">
                    <label>Categoría / Puesto</label>
                    <input type="text" id="categoria_puesto" name="categoria_puesto">
                </div>

                <div class="input-group">
                    <label>Rol en el Sistema *</label>
                    <select id="rol" name="rol" required>
                        <option value="Admin">Administrador</option>
                        <option value="Editor">Editor (Captura)</option>
                        <option value="Consulta">Consulta (Solo Lectura)</option>
                    </select>
                </div>

                <div class="input-group">
                    <label>Estatus *</label>
                    <select id="activo" name="activo" required>
                        <option value="true">Activo (Permitir Acceso)</option>
                        <option value="false">Inactivo (Bloqueado)</option>
                    </select>
                </div>
            </div>

            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn-primary">Guardar Usuario</button>
            </div>
        </form>
    </div>
</div>

<!-- ================= MODAL DE CONFIRMACIÓN ================= -->
<div id="confirm-overlay" class="modal-overlay" style="z-index: 6000;">
    <div class="confirm-card" style="background: var(--glass-bg); backdrop-filter: blur(25px); border: 1px solid var(--rtp-green); border-radius: 16px; padding: 30px; width: 90%; max-width: 400px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
        <h3 id="confirm-title" style="color: var(--text-light); margin-top: 0;">¿Guardar Cambios?</h3>
        <p id="confirm-message" style="color: var(--text-muted); margin-bottom: 25px;">¿Estás seguro de que deseas guardar los cambios?</p>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button class="btn-secondary" onclick="closeConfirm()">No, Cancelar</button>
            <button class="btn-primary" onclick="submitForm()">Sí, Guardar</button>
        </div>
    </div>
</div>

<!-- 🟢 Ruta corregida del JS principal de usuarios -->
<script src="/static/js/modulos/gestion_usuarios.js?v=4.0"></script>