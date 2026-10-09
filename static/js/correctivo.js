/* static/js/correctivo.js */

// Simulación de Base de Datos
const baseDeDatosReparaciones = [
    {
        consecutivo: "13867", folio: "4719", fechaHora: "07/07/2026 14:10",
        eco: "1705", ruta: "52-C", tipoUnidad: "V/P 2016", kmActual: "462,549",
        falla: "* FUGA DE DIESEL CHECAR DEBAJO. Y LIMPIADOR LADO IZQUIERDO.",
        operador: "791 - ROBERTO ISLAS T.",
        jefe: "7521 - MARIA MAGDALENA S.",
        jud: "8438 - VICENTE MENDEZ C."
    },
    {
        consecutivo: "13868", folio: "4720", fechaHora: "08/07/2026 09:30",
        eco: "1701", ruta: "47-A", tipoUnidad: "V/P 2016", kmActual: "420,100",
        falla: "* REPARACION MAYOR DE TRANSMISIÓN Y MOTOR.",
        operador: "4356 - GENARO ELISEO G.",
        jefe: "8356 - HORACIO LOPEZ H.",
        jud: "2935 - JESUS EVERARDO C."
    }
];

function handleEnter(event) {
    if (event.key === 'Enter') buscarOrden();
}

function buscarOrden() {
    const input = document.getElementById('input-consecutivo').value.trim();
    const page1 = document.getElementById('page-1');
    const page2 = document.getElementById('page-2');
    const page3 = document.getElementById('page-3');
    const emptyState = document.getElementById('empty-state');
    const btnPrint = document.getElementById('btn-print');

    if (input === "") return;

    const orden = baseDeDatosReparaciones.find(o => o.consecutivo === input);

    if (orden) {
        // Inyectamos los datos en las cajitas flotantes
        document.getElementById('val-folio').innerText = orden.folio;
        document.getElementById('val-consecutivo').innerText = orden.consecutivo;
        document.getElementById('val-fecha').innerText = orden.fechaHora;
        document.getElementById('val-eco').innerText = orden.eco;
        document.getElementById('val-ruta').innerText = orden.ruta;
        document.getElementById('val-tipo').innerText = orden.tipoUnidad;
        document.getElementById('val-km').innerText = orden.kmActual;
        document.getElementById('val-falla').innerText = orden.falla;
        
        document.getElementById('val-operador').innerText = orden.operador;
        document.getElementById('val-jefe').innerText = orden.jefe;
        document.getElementById('val-jud').innerText = orden.jud;

        // Mostrar las 3 hojas
        emptyState.style.display = 'none';
        page1.style.display = 'block';
        page2.style.display = 'block'; 
        page3.style.display = 'block'; 
        btnPrint.disabled = false;

    } else {
        emptyState.style.display = 'block';
        page1.style.display = 'none';
        page2.style.display = 'none';
        page3.style.display = 'none';
        btnPrint.disabled = true;
        
        emptyState.innerHTML = `
            <div class="empty-icon" style="color: #dc2626;">❌</div>
            <h3 style="color: #dc2626;">Consecutivo No Encontrado</h3>
            <p>El consecutivo <strong>${input}</strong> no existe.</p>
            <p style="font-size: 0.9rem;">Intenta con: 13867 o 13868</p>
        `;
    }
}

function imprimirOrden() {
    window.print();
}