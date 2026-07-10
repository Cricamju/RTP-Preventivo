document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del Menú
    const fab = document.getElementById('a11y-fab');
    const menu = document.getElementById('a11y-menu');
    const themeToggleBtn = document.getElementById('btn-theme-toggle');
    const body = document.body;

    if (!fab || !menu) return;

    // =========================================
    // 1. REPARACIÓN DEL TEMA (Cargar de memoria)
    // =========================================
    const currentTheme = localStorage.getItem('rtp-theme');
    if (currentTheme === 'light') {
        body.classList.add('light-theme');
    }

    // =========================================
    // 2. ABRIR / CERRAR EL MENÚ
    // =========================================
    fab.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita que se cierre instantáneamente
        menu.classList.toggle('show');
    });

    // Cierra el menú al hacer clic en cualquier lugar fuera de él
    document.addEventListener('click', (e) => {
        if (menu.classList.contains('show') && !menu.contains(e.target) && !fab.contains(e.target)) {
            menu.classList.remove('show');
        }
    });

    // =========================================
    // 3. LÓGICA DE LOS BOTONES DE ACCESIBILIDAD
    // =========================================

    // Alternar Tema (Arreglado)
    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('light-theme');
        
        if (body.classList.contains('light-theme')) {
            localStorage.setItem('rtp-theme', 'light');
        } else {
            localStorage.setItem('rtp-theme', 'dark');
        }
    });

    // Bases para futuras funciones (Aún no programadas, pero listas para detectar clics)
    document.getElementById('btn-text-increase').addEventListener('click', () => {
        console.log("Subir tamaño de letra - Pendiente de programar");
    });

    document.getElementById('btn-text-decrease').addEventListener('click', () => {
        console.log("Bajar tamaño de letra - Pendiente de programar");
    });

    document.getElementById('btn-font-toggle').addEventListener('click', () => {
        console.log("Alternar fuente para Dislexia - Pendiente de programar");
    });

    document.getElementById('btn-voice-toggle').addEventListener('click', () => {
        console.log("Activar lector de voz - Pendiente de programar");
    });
});