<!-- Contenedor del Menú de Accesibilidad -->
<div class="a11y-container">
    
    <!-- El Menú Flotante (Oculto por defecto) -->
    <div id="a11y-menu" class="a11y-menu">
        <h4>Accesibilidad</h4>
        
        <div class="a11y-option">
            <span>🌗 Contraste (Tema)</span>
            <div class="btn-group">
                <button type="button" id="btn-theme-dark" class="a11y-action-btn" title="Modo Oscuro">🌙</button>
                <button type="button" id="btn-theme-auto" class="a11y-action-btn" title="Automático según la hora">Auto</button>
                <button type="button" id="btn-theme-light" class="a11y-action-btn" title="Modo Claro">☀️</button>
            </div>
        </div>
        
        <div class="a11y-option">
            <span>🔠 Tamaño de texto</span>
            <div class="btn-group">
                <button type="button" id="btn-text-decrease" class="a11y-action-btn">A-</button>
                <button type="button" id="btn-text-auto" class="a11y-action-btn" title="Tamaño por defecto">Auto</button>
                <button type="button" id="btn-text-increase" class="a11y-action-btn">A+</button>
            </div>
        </div>

        <div class="a11y-option">
            <span>✒️ Fuente Tipográfica</span>
            <div class="btn-group">
                <!-- NUEVO: Menú desplegable personalizado (Soporta Blur y Bordes redondos) -->
                <div class="custom-dropdown" id="font-dropdown-container">
                    <button type="button" class="a11y-action-btn custom-dropdown-btn" id="font-dropdown-btn">Por defecto ▾</button>
                    <div class="custom-dropdown-list" id="font-dropdown-list">
                        <div class="custom-dropdown-item active" data-value="default">Por defecto</div>
                        <div class="custom-dropdown-item" data-value="google-sans">Google Sans</div>
                        <div class="custom-dropdown-item" data-value="samsung">SamsungOne</div>
                        <div class="custom-dropdown-item" data-value="san-francisco">San Francisco</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="a11y-option">
            <span>📢 Lector de Voz</span>
            <div class="btn-group">
                <button type="button" id="btn-voice-on" class="a11y-action-btn">Activar</button>
                <button type="button" id="btn-voice-off" class="a11y-action-btn">Apagar</button>
            </div>
        </div>
    </div>

    <!-- El FAB Principal -->
    <button type="button" id="a11y-fab" class="fab-btn" aria-label="Abrir Menú de Accesibilidad">
        <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="4" r="2"></circle>
            <path d="m18 8-6-2-6 2"></path>
            <path d="M12 8v8"></path>
            <path d="m9 22 3-6 3 6"></path>
        </svg>
    </button>
</div>

<script src="/static/js/theme.js?v=4"></script>