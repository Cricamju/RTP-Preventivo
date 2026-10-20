/* static/js/cache-control.js */
window.addEventListener('pageshow', function(event) {
    // Si event.persisted es true, significa que la página se cargó desde la memoria caché (botón atrás)
    if (event.persisted) {
        // Forzamos una recarga real que contactará al servidor Flask
        window.location.reload();
    }
});