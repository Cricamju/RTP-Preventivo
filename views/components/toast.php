<!-- views/components/toast.php -->
<div id="toast-container" class="toast-container">
    <!-- Las notificaciones se inyectarán aquí dinámicamente vía JS -->
</div>

<!-- Contenedor invisible para que JS lea los mensajes de sesión de PHP -->
<div id="flask-messages" style="display: none;">
  <?php if (isset($_SESSION['flash_message'])): ?>
      <span class="flask-flash" data-category="<?= $_SESSION['flash_type'] ?? 'info' ?>" data-message="<?= htmlspecialchars($_SESSION['flash_message']) ?>"></span>
      <?php 
      unset($_SESSION['flash_message']);
      unset($_SESSION['flash_type']);
      ?>
  <?php endif; ?>
</div>

<!-- Importar la lógica global de las alertas con la nueva ruta de carpetas -->
<script src="/static/js/components/toast.js"></script>