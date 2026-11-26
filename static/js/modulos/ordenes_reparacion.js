// ==========================================
// 🟢 GENERADOR DINÁMICO DE ORDEN DE REPARACIÓN MULTIPÁGINA SOBRE PLANTILLA
// ==========================================
function generarOrdenPDF(economico, modulo, modelo, kmActual, tipoServicio, noOrden, fechaOdo) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('portrait', 'mm', 'a4'); // Formato vertical A4 (210 x 297 mm)

    // Rutas de las 3 páginas de la plantilla en assets/orden-reparacion/
    const imgPagina1 = '/assets/orden-reparacion/Orden-Mantenimiento-Base.png';
    const imgPagina2 = '/assets/orden-reparacion/Orden-Mantenimiento-Base-2.png';
    const imgPagina3 = '/assets/orden-reparacion/Orden-Mantenimiento-Base-3.png';

    // Obtener fecha y hora actual formateada en formato de 24 horas (hour12: false)
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = ahora.getFullYear();
    const horaStr = ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });

    // ==========================================
    // PÁGINA 1: DATOS PRINCIPALES Y ENCABEZADO
    // ==========================================
    try {
        doc.addImage(imgPagina1, 'PNG', 0, 0, 210, 297);
    } catch (e) {
        console.warn("No se pudo cargar la imagen de la página 1:", e);
    }

    // Configuración general de fuente
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(20, 20, 20);

    // =========================================================================
    // ⚙️ ZONA DE AJUSTE DE COORDENADAS (Tus posiciones exactas base)
    // =========================================================================

    // 1. RECUADRO SUPERIOR DERECHO (Día, Mes, Año, Hora)
    doc.text(dia,       150.5,  20.5, { align: "center" }); 
    doc.text(mes,       155.5,  20.5, { align: "center" }); 
    doc.text(anio.toString(), 162.5, 20.5, { align: "center" }); 
    doc.text(horaStr,   171,  20.5, { align: "center" }); 

    // 2. FOLIO (Número de orden)
    doc.setFontSize(9);
    doc.setTextColor(220, 38, 38); // Color rojo
    doc.text(`ORDEN #${noOrden}`, 162, 32.4, { align: "center" }); 

    // 3. MÓDULO (Recuadro inferior derecho superior)
    doc.setTextColor(0, 147, 69); // Color verde RTP
    doc.setFontSize(9);
    doc.text(`${modulo}`, 160.5, 45, { align: "center" }); 

    // 4. TIPO DE MANTENIMIENTO
    doc.setFontSize(11);
    doc.setTextColor(0, 147, 69); 
    doc.text(`SERVICIO ${tipoServicio}`, 120, 61.4, { align: "left", maxWidth: 55 }); 

    // 5. DATOS DE LA UNIDAD (Económico, Modelo, Km Actual)
    doc.setFontSize(8);
    doc.setTextColor(20, 20, 20);
    
    // Económico
    doc.text(economico.toString(), 28, 47.0, { align: "center" }); 

    // Modelo / Tipo de Unidad (Fuente en 7 y maxWidth de 26 para partirlo exactamente en 2 renglones)
    doc.setFontSize(7);
    doc.text(modelo, 63, 45.7, { align: "center", maxWidth: 20 }); 

    // Km Actual
    doc.setFontSize(8);
    doc.text(kmActual.toString(), 90, 47.0, { align: "center" }); 

    // ==========================================
    // PÁGINA 2: REFACCIONES, BATERÍAS Y LLANTAS
    // ==========================================
    doc.addPage('portrait', 'a4');
    try {
        doc.addImage(imgPagina2, 'PNG', 0, 0, 210, 297);
    } catch (e) {
        console.warn("No se pudo cargar la imagen de la página 2:", e);
    }

    // ==========================================
    // PÁGINA 3: MANO DE OBRA Y REPARACIONES
    // ==========================================
    doc.addPage('portrait', 'a4');
    try {
        doc.addImage(imgPagina3, 'PNG', 0, 0, 210, 297);
    } catch (e) {
        console.warn("No se pudo cargar la imagen de la página 3:", e);
    }

    // Abrir el PDF resultante en una nueva pestaña del navegador
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}