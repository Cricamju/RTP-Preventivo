// Al estar inyectado al final del body, el código se ejecuta de inmediato sin bloqueos
(function initAccessibility() {
    const fab = document.getElementById('a11y-fab');
    const menu = document.getElementById('a11y-menu');
    const themeToggleBtn = document.getElementById('btn-theme-toggle');
    const btnTextIncrease = document.getElementById('btn-text-increase');
    const btnTextDecrease = document.getElementById('btn-text-decrease');
    const btnFontToggle = document.getElementById('btn-font-toggle');
    const btnVoiceToggle = document.getElementById('btn-voice-toggle');
    const body = document.body;

    if (!fab || !menu) return; // Si no encuentra el menú, se detiene por seguridad

    // =========================================
    // 1. CARGAR MEMORIA DEL NAVEGADOR
    // =========================================
    // Tema Claro/Oscuro
    if (localStorage.getItem('rtp-theme') === 'light') {
        body.classList.add('light-theme');
    }

    // Tamaño de texto
    let currentTextSize = parseInt(localStorage.getItem('rtp-text-size')) || 100;
    document.documentElement.style.fontSize = `${currentTextSize}%`;

    // Fuente Accesible
    if (localStorage.getItem('rtp-font') === 'dyslexia') {
        body.classList.add('dyslexia-mode');
    }

    // =========================================
    // 2. ABRIR Y CERRAR EL MENÚ 
    // =========================================
    fab.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (menu.classList.contains('show') && !menu.contains(e.target) && !fab.contains(e.target)) {
            menu.classList.remove('show');
        }
    });

    // =========================================
    // 3. FUNCIONES DE LOS BOTONES
    // =========================================
    
    // Cambiar Tema
    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('light-theme');
        localStorage.setItem('rtp-theme', body.classList.contains('light-theme') ? 'light' : 'dark');
    });

    // Aumentar Letra (Límite 130%)
    btnTextIncrease.addEventListener('click', () => {
        if (currentTextSize < 130) {
            currentTextSize += 10;
            document.documentElement.style.fontSize = `${currentTextSize}%`;
            localStorage.setItem('rtp-text-size', currentTextSize);
        }
    });

    // Disminuir Letra (Límite 80%)
    btnTextDecrease.addEventListener('click', () => {
        if (currentTextSize > 80) {
            currentTextSize -= 10;
            document.documentElement.style.fontSize = `${currentTextSize}%`;
            localStorage.setItem('rtp-text-size', currentTextSize);
        }
    });

    // Cambiar a Fuente Legible
    btnFontToggle.addEventListener('click', () => {
        body.classList.toggle('dyslexia-mode');
        localStorage.setItem('rtp-font', body.classList.contains('dyslexia-mode') ? 'dyslexia' : 'default');
    });

    // Lector de voz (Por programar después)
    btnVoiceToggle.addEventListener('click', () => {
        alert("La función de lectura de pantalla se integrará próximamente.");
    });

})();