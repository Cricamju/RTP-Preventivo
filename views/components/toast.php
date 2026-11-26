<!-- views/components/toast.php -->
<div id="toast-container" class="toast-container">
    <!-- Las notificaciones se inyectarán aquí dinámicamente vía JS -->
</div>

<!-- Contenedor invisible para que JS lea los mensajes múltiples de sesión de PHP -->
<div id="flask-messages" style="display: none;">
  <?php if (isset($_SESSION['flash_messages']) && is_array($_SESSION['flash_messages'])): ?>
      <?php foreach ($_SESSION['flash_messages'] as $flash): ?>
          <span class="flask-flash" data-category="<?= $flash['type'] ?? 'info' ?>" data-message="<?= htmlspecialchars($flash['message']) ?>"></span>
      <?php endforeach; ?>
      <?php unset($_SESSION['flash_messages']); ?>
  <?php elseif (isset($_SESSION['flash_message'])): ?>
      <span class="flask-flash" data-category="<?= $_SESSION['flash_type'] ?? 'info' ?>" data-message="<?= htmlspecialchars($_SESSION['flash_message']) ?>"></span>
      <?php 
      unset($_SESSION['flash_message']);
      unset($_SESSION['flash_type']);
      ?>
  <?php endif; ?>
</div>

<script src="/static/js/components/toast.js?v=3.0"></script>