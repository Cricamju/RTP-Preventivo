/* static/js/modulos/generar_orden_reparacion.js */
document.addEventListener('DOMContentLoaded', function() {
    const formOrden = document.getElementById('form-guardar-orden');
    
    if (formOrden) {
        formOrden.addEventListener('submit', function(e) {
            e.preventDefault(); // Detenemos el envío inmediato para pedir confirmación
            
            // Extraer los datos del formulario de manera limpia
            const inputEconomico = formOrden.querySelector('input[name="economico"]');
            const inputFecha = formOrden.querySelector('input[name="fecha_alta"]');
            
            const economico = inputEconomico ? inputEconomico.value : 'N/A';
            const fechaAlta = inputFecha ? inputFecha.value : new Date().toLocaleDateString();

            // Lanzar toast bloqueante con diseño de advertencia (amarillo)
            showToast(
                `⚡ ¿Estás seguro de que quieres guardar esta orden de reparación?<br>` +
                `• <b>Económico:</b> ${economico}<br>` +
                `• <b>Fecha de Alta:</b> ${fechaAlta}`,
                'warning', // Franja amarilla lateral
                0,
                [
                    {
                        text: '❌ Cancelar',
                        class: 'btn-secondary',
                        callback: (close) => {
                            close();
                            showToast('ℹ️ Operación cancelada. La orden no fue guardada.', 'info', 3000);
                        }
                    },
                    {
                        text: '✅ Aceptar y Guardar',
                        class: 'btn-primary',
                        callback: (close) => {
                            close();
                            showToast('✅ Guardando orden de reparación en el sistema...', 'success', 2000);
                            // Permitir el envío real del formulario tras la confirmación
                            setTimeout(() => {
                                formOrden.submit();
                            }, 500);
                        }
                    }
                ],
                true // Modo bloqueante modal sin tiempo límite
            );
        });
    }
});