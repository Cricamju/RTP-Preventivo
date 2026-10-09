/* static/js/gestion_usuarios.js */

let countdownInterval;

function openModal(userData = null) {
    const modalOverlay = document.getElementById('user-modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const userForm = document.getElementById('user-form');
    
    clearInterval(countdownInterval); 
    
    if (!modalOverlay || !userForm) return;

    userForm.reset();
    document.getElementById('user_id').value = '';

    if (userData) {
        modalTitle.innerHTML = '✏️ Editar Usuario';
        
        const blockWarning = document.getElementById('block-warning');
        if (userData.bloqueado === 'true') {
            blockWarning.style.display = 'block';
            startTimer(userData.bloqueado_hasta);
        } else {
            blockWarning.style.display = 'none';
        }

        document.getElementById('user_id').value = userData.id || '';
        document.getElementById('nombre_completo').value = userData.nombre_completo || '';
        document.getElementById('username').value = userData.username || '';
        document.getElementById('correo_institucional').value = userData.correo_institucional || '';
        document.getElementById('rol').value = userData.rol || 'Consulta';
        document.getElementById('adscripcion').value = userData.adscripcion || '';
        document.getElementById('categoria_puesto').value = userData.categoria_puesto || '';
        document.getElementById('activo').value = userData.activo || 'true';
    } else {
        modalTitle.innerHTML = '➕ Nuevo Usuario';
        const blockWarning = document.getElementById('block-warning');
        if (blockWarning) blockWarning.style.display = 'none';
    }

    modalOverlay.classList.add('show');
}

// Función del Temporizador
function startTimer(isoDateString) {
    const display = document.getElementById('timer-display');
    const targetDate = new Date(isoDateString).getTime();

    countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            clearInterval(countdownInterval);
            display.innerHTML = "00:00 (Ya puedes acceder)";
            return;
        }

        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        display.innerHTML = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function closeModal() {
    const modalOverlay = document.getElementById('user-modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.remove('show');
    }
    clearInterval(countdownInterval);
}

// Control de eventos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const modalOverlay = document.getElementById('user-modal-overlay');
    const form = document.getElementById('user-form');
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }
    
    if (form) {
        // Interceptar el envío para mostrar la confirmación personalizada
        form.addEventListener('submit', function(e) {
            
            // 1. Verificar validaciones nativas de HTML
            if (!form.checkValidity()) {
                return; 
            }

            // 2. Detener el envío automático
            e.preventDefault(); 
            
            // 3. Preparar los datos del modal de confirmación
            const username = document.getElementById('username').value;
            const blockWarning = document.getElementById('block-warning');
            const isBlocked = blockWarning && blockWarning.style.display === 'block';
            const confirmTitle = document.getElementById('confirm-title');
            const confirmMessage = document.getElementById('confirm-message');
            
            if (isBlocked) {
                confirmTitle.innerHTML = "🔓 ¿Desbloquear Usuario?";
                confirmTitle.style.color = "#f59e0b";
                confirmMessage.innerHTML = `El usuario <strong>@${username}</strong> está bloqueado por seguridad.<br><br>¿Seguro que deseas guardar los cambios y <strong>desbloquearlo de inmediato</strong>?`;
            } else {
                confirmTitle.innerHTML = "💾 ¿Guardar Cambios?";
                confirmTitle.style.color = "var(--rtp-green)";
                confirmMessage.innerHTML = `¿Seguro que deseas aplicar los cambios en el perfil de <strong>@${username}</strong>?`;
            }
            
            // 4. Mostrar la ventana de confirmación
            document.getElementById('confirm-overlay').classList.add('show');
        });
    }
});

function closeConfirm() {
    document.getElementById('confirm-overlay').classList.remove('show');
}

function submitForm() {
    const form = document.getElementById('user-form');
    
    // 1. Cerramos la ventana de confirmación visualmente
    closeConfirm();
    
    // 2. Enviamos el formulario directamente de forma segura
    form.submit();
}