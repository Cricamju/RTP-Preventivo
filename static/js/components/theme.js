// static/js/theme.js
(function initAccessibility() {
    const fab = document.getElementById('a11y-fab');
    const menu = document.getElementById('a11y-menu');
    
    // Botones del Tema
    const btnThemeDark = document.getElementById('btn-theme-dark');
    const btnThemeAuto = document.getElementById('btn-theme-auto');
    const btnThemeLight = document.getElementById('btn-theme-light');
    
    // Botones de Letra y Extras
    const btnTextDecrease = document.getElementById('btn-text-decrease');
    const btnTextAuto = document.getElementById('btn-text-auto'); 
    const btnTextIncrease = document.getElementById('btn-text-increase');
// Fuentes (Nuevo Menú)
    const fontDropdownBtn = document.getElementById('font-dropdown-btn');
    const fontDropdownList = document.getElementById('font-dropdown-list');
    const fontDropdownItems = document.querySelectorAll('.custom-dropdown-item');
    const btnVoiceOn = document.getElementById('btn-voice-on');
    const btnVoiceOff = document.getElementById('btn-voice-off');
    const body = document.body;

    if (!fab || !menu) return;

    // =========================================
    // 1. CARGAR MEMORIA DEL NAVEGADOR
    // =========================================
    
    let currentTextSize = parseInt(localStorage.getItem('rtp-text-size')) || 100;
    document.documentElement.style.fontSize = `${currentTextSize}%`;

    const savedFont = localStorage.getItem('rtp-font') || 'default';
    if (savedFont !== 'default') body.classList.add(`font-${savedFont}`);

    let themeMode = localStorage.getItem('rtp-theme-mode') || 'auto';
    let manualTheme = localStorage.getItem('rtp-theme') || 'dark';

    function applyTheme(forceTransition = false) {
        body.classList.remove('theme-transition-manual', 'theme-transition-auto');

        if (forceTransition) {
            const transitionClass = themeMode === 'auto' ? 'theme-transition-auto' : 'theme-transition-manual';
            body.classList.add(transitionClass);
            setTimeout(() => {
                body.classList.remove(transitionClass);
            }, themeMode === 'auto' ? 1000 : 400);
        }

        // Apagar el resaltado de todos los botones primero
        if (btnThemeAuto) { btnThemeAuto.style.background = ''; btnThemeAuto.style.color = ''; }
        if (btnThemeDark) { btnThemeDark.style.background = ''; btnThemeDark.style.color = ''; }
        if (btnThemeLight) { btnThemeLight.style.background = ''; btnThemeLight.style.color = ''; }

        if (themeMode === 'auto') {
            // Encender botón Auto
            if (btnThemeAuto) {
                btnThemeAuto.style.background = 'var(--rtp-green)';
                btnThemeAuto.style.color = 'white';
            }
            
            // Evaluar la hora
            const hour = new Date().getHours();
            if (hour >= 7 && hour < 19) {
                body.classList.add('light-theme');
            } else {
                body.classList.remove('light-theme');
            }
        } else {
            // Encender el botón manual correspondiente
            if (manualTheme === 'light') {
                body.classList.add('light-theme');
                if (btnThemeLight) {
                    btnThemeLight.style.background = 'var(--rtp-green)';
                    btnThemeLight.style.color = 'white';
                }
            } else {
                body.classList.remove('light-theme');
                if (btnThemeDark) {
                    btnThemeDark.style.background = 'var(--rtp-green)';
                    btnThemeDark.style.color = 'white';
                }
            }
        }
    }

    applyTheme(false);

// =========================================
    // ABRIR Y CERRAR MENÚS 
    // =========================================
    fab.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
    });

    // Abrir lista de fuentes
    if (fontDropdownBtn) {
        fontDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fontDropdownList.classList.toggle('show');
        });
    }

    // Cerrar si das clic afuera
    document.addEventListener('click', (e) => {
        if (menu.classList.contains('show') && !menu.contains(e.target) && !fab.contains(e.target)) {
            menu.classList.remove('show');
        }
        if (fontDropdownList && fontDropdownList.classList.contains('show') && !fontDropdownBtn.contains(e.target)) {
            fontDropdownList.classList.remove('show');
        }
    });

    // =========================================
    // 3. FUNCIONES DE LOS BOTONES
    // =========================================
    
    // Botón Auto (Maneja encendido e inversión)
    if (btnThemeAuto) {
        btnThemeAuto.addEventListener('click', () => {
            if (themeMode !== 'auto') {
                themeMode = 'auto';
                localStorage.setItem('rtp-theme-mode', 'auto');
                applyTheme(true);
            } else {
                // Si el usuario vuelve a presionar "Auto", invertimos el tema actual y lo pasamos a manual
                themeMode = 'manual';
                localStorage.setItem('rtp-theme-mode', 'manual');
                const isCurrentlyLight = body.classList.contains('light-theme');
                manualTheme = isCurrentlyLight ? 'dark' : 'light';
                localStorage.setItem('rtp-theme', manualTheme);
                applyTheme(true);
            }
        });
    }

    // Botón Luna
    if (btnThemeDark) {
        btnThemeDark.addEventListener('click', () => {
            themeMode = 'manual';
            localStorage.setItem('rtp-theme-mode', 'manual');
            manualTheme = 'dark';
            localStorage.setItem('rtp-theme', 'dark');
            applyTheme(true);
        });
    }

    // Botón Sol
    if (btnThemeLight) {
        btnThemeLight.addEventListener('click', () => {
            themeMode = 'manual';
            localStorage.setItem('rtp-theme-mode', 'manual');
            manualTheme = 'light';
            localStorage.setItem('rtp-theme', 'light');
            applyTheme(true);
        });
    }

/// =========================================
    // LÓGICA DE FUENTES (CON SOPORTE DE TECLADO)
    // =========================================
    if (fontDropdownItems.length > 0) {
        let currentIndex = -1;

        // Estado inicial
        const activeItem = document.querySelector(`.custom-dropdown-item[data-value="${savedFont}"]`);
        if (activeItem) {
            fontDropdownItems.forEach(i => i.classList.remove('active'));
            activeItem.classList.add('active');
            fontDropdownBtn.innerHTML = `${activeItem.innerText} ▾`;
        }

        function selectFontItem(index) {
            fontDropdownItems.forEach(i => i.classList.remove('highlighted'));
            if (index >= 0 && index < fontDropdownItems.length) {
                fontDropdownItems[index].classList.add('highlighted');
                fontDropdownItems[index].scrollIntoView({ block: 'nearest' });
            }
        }

        // Al hacer clic en una fuente
        fontDropdownItems.forEach((item, index) => {
            item.addEventListener('mouseenter', () => {
                currentIndex = index;
                selectFontItem(currentIndex);
            });

            item.addEventListener('click', (e) => {
                applySelectedFont(e.target);
            });
        });

        function applySelectedFont(itemElement) {
            const font = itemElement.getAttribute('data-value');
            const text = itemElement.innerText;
            
            fontDropdownBtn.innerHTML = `${text} ▾`;
            
            fontDropdownItems.forEach(i => i.classList.remove('active', 'highlighted'));
            itemElement.classList.add('active');

            body.classList.remove('font-google-sans', 'font-samsung', 'font-san-francisco');
            if (font !== 'default') {
                body.classList.add(`font-${font}`);
            }
            
            localStorage.setItem('rtp-font', font);
            fontDropdownList.classList.remove('show');
        }

        // Control por Teclado (Flechas, Enter y Escape)
        fontDropdownBtn.addEventListener('keydown', (e) => {
            const isOpen = fontDropdownList.classList.contains('show');

            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                if (!isOpen) {
                    fontDropdownList.classList.add('show');
                    currentIndex = 0;
                    selectFontItem(currentIndex);
                } else if (e.key === 'Enter' && currentIndex >= 0) {
                    applySelectedFont(fontDropdownItems[currentIndex]);
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            if (!fontDropdownList.classList.contains('show')) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (currentIndex < fontDropdownItems.length - 1) {
                    currentIndex++;
                    selectFontItem(currentIndex);
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (currentIndex > 0) {
                    currentIndex--;
                    selectFontItem(currentIndex);
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (currentIndex >= 0) {
                    applySelectedFont(fontDropdownItems[currentIndex]);
                }
            } else if (e.key === 'Escape') {
                fontDropdownList.classList.remove('show');
            }
        });
    }
    // Tamaños de Letra
    if (btnTextIncrease) {
        btnTextIncrease.addEventListener('click', () => {
            if (currentTextSize < 130) {
                currentTextSize += 10;
                document.documentElement.style.fontSize = `${currentTextSize}%`;
                localStorage.setItem('rtp-text-size', currentTextSize);
            }
        });
    }

    if (btnTextDecrease) {
        btnTextDecrease.addEventListener('click', () => {
            if (currentTextSize > 80) {
                currentTextSize -= 10;
                document.documentElement.style.fontSize = `${currentTextSize}%`;
                localStorage.setItem('rtp-text-size', currentTextSize);
            }
        });
    }

    if (btnTextAuto) {
        btnTextAuto.addEventListener('click', () => {
            currentTextSize = 100;
            document.documentElement.style.fontSize = `${currentTextSize}%`;
            localStorage.setItem('rtp-text-size', currentTextSize);
        });
    }

// Lector de voz (Por programar después)
    if (btnVoiceOn) {
        btnVoiceOn.addEventListener('click', () => {
            alert("La función de lectura de pantalla se integrará próximamente.");
        });
    }

    if (btnVoiceOff) {
        btnVoiceOff.addEventListener('click', () => {
            // Aquí irá la lógica para silenciar la voz
        });
    }

})();