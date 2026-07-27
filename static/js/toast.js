// static/js/toast.js
function showToast(message, type = 'success', duration = 4500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Crear la caja del toast dinámicamente
    const toastBox = document.createElement('div');
    toastBox.className = `toast-box ${type}`;

    // Asignar icono según el tipo
    let icon = '💡';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    // Construir el interior
    toastBox.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <div class="toast-content"><p>${message}</p></div>
        <button type="button" class="toast-close">&times;</button>
    `;

    // Insertar el nuevo toast ARRIBA de los existentes
    container.prepend(toastBox);

    // Pequeño truco para forzar al navegador a dibujar el elemento antes de la animación
    void toastBox.offsetWidth;
    toastBox.classList.add('show');

    // Función para destruir el toast limpiamente
    const hideToast = () => {
        toastBox.classList.remove('show');
        // Esperar a que termine la animación de salida para removerlo del código
        setTimeout(() => toastBox.remove(), 400); 
    };

    // Temporizador automático
    let hideTimeout = setTimeout(hideToast, duration);

    // Botón de cerrar manual
    toastBox.querySelector('.toast-close').onclick = () => {
        clearTimeout(hideTimeout);
        hideToast();
    };
}

// Lógica para interceptar mensajes de Flask y manejar el menú de perfil
document.addEventListener('DOMContentLoaded', () => {
    // 1. Mostrar mensajes en cola
    const flashes = document.querySelectorAll('.flask-flash');
    flashes.forEach((flash, index) => {
        let type = flash.getAttribute('data-category');
        let message = flash.getAttribute('data-message');
        
        if (type === 'message') type = 'info';
        if (type === 'danger') type = 'error';

        // Escalonar aparición para que entren una tras otra con un retraso
        setTimeout(() => {
            showToast(message, type);
        }, 200 + (index * 300));
    });

    // 2. Lógica para ESQUIVAR el menú de perfil
    const userProfileBtn = document.getElementById('user-profile-btn');
    const toastContainer = document.getElementById('toast-container');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userProfileBtn && toastContainer) {
        userProfileBtn.addEventListener('click', () => {
            // Esperar un milisegundo a que el menú se despliegue
            setTimeout(() => {
                if (userDropdown && userDropdown.classList.contains('show')) {
                    toastContainer.style.top = '180px'; // Bajar las notis más abajo del menú desplegado
                } else {
                    toastContainer.style.top = '115px'; // Regresarlas al nuevo margen centrado
                }
            }, 50);
        });

        // Regresar notificaciones arriba si hacen clic fuera del menú
        document.addEventListener('click', (e) => {
            if (userDropdown && !userDropdown.contains(e.target) && !userProfileBtn.contains(e.target)) {
                toastContainer.style.top = '115px'; // Nuevo margen centrado
            }
        });
    }
});