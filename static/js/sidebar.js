/* static/js/sidebar.js */
const userProfileBtn = document.getElementById('user-profile-btn');
const userDropdown = document.getElementById('user-dropdown');

if (userProfileBtn && userDropdown) {
    // Abrir menú de perfil al hacer clic
    userProfileBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        userDropdown.classList.toggle('show');
    });

    // Cerrar menú al hacer clic en cualquier otra parte de la pantalla
    document.addEventListener('click', (event) => {
        // Se asegura de no cerrarlo si haces clic DENTRO del propio dropdown
        if (userDropdown.classList.contains('show') && !userProfileBtn.contains(event.target) && !userDropdown.contains(event.target)) {
            userDropdown.classList.remove('show');
        }
    });
}

/* =========================================
   LÓGICA DE OCULTAMIENTO INTELIGENTE (MÓVIL)
   ========================================= */
const sidebar = document.getElementById('sidebar');

function handleMobileScroll() {
    // 1. Si estamos en PC, nos aseguramos de que la barra siempre esté visible
    if (window.innerWidth > 768) {
        sidebar.classList.remove('sidebar-hidden', 'sidebar-at-bottom');
        return;
    }

    // 2. Calculamos las dimensiones de la página y la posición del usuario
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    // 3. ¿La página es corta y NO necesita scroll? 
    if (scrollHeight <= clientHeight + 10) {
        sidebar.classList.remove('sidebar-hidden', 'sidebar-at-bottom');
        return;
    }

    // 4. ¿El usuario está hasta arriba o hasta abajo?
    const isAtBottom = Math.ceil(scrollTop + clientHeight) >= (scrollHeight - 20);
    const isAtTop = scrollTop <= 20;

    // 5. Lógica de visibilidad
    if (isAtBottom) {
        // Si llega al final, mostramos la barra y la subimos para dejar ver el footer
        sidebar.classList.remove('sidebar-hidden');
        sidebar.classList.add('sidebar-at-bottom');
    } else if (isAtTop) {
        // Si está hasta arriba, se muestra normal (abajo)
        sidebar.classList.remove('sidebar-hidden');
        sidebar.classList.remove('sidebar-at-bottom');
    } else {
        // Si está haciendo scroll por en medio de la página, se oculta por completo
        sidebar.classList.add('sidebar-hidden');
        sidebar.classList.remove('sidebar-at-bottom');
    }
}

// Escuchar eventos de scroll y cambios de tamaño de pantalla
window.addEventListener('scroll', handleMobileScroll);
window.addEventListener('resize', handleMobileScroll);

// Ejecutar una vez al cargar la página para evaluar el estado inicial
document.addEventListener('DOMContentLoaded', handleMobileScroll);