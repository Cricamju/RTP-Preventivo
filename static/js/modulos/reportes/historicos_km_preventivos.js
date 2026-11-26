/* static/js/modulos/reportes/historicos_km_preventivos.js */
let registrosHistKmPrev = [];
let paginaHistKmPrev = 1;
const filasPorPaginaHistKmPrev = 50;

function normalizarRep(txt) {
    return (txt || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function fechaVisibleHistKm(fecha) {
    if (!fecha) return '—';
    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
}

function fechaActualHistKm() {
    return fechaReporteISO(new Date());
}

function renderizarHistKmPrev() {
    const tbody = document.getElementById('tbody-historicos-km-prev');
    if (!tbody) return;

    tbody.innerHTML = '';
    const inicio = (paginaHistKmPrev - 1) * filasPorPaginaHistKmPrev;
    const filas = registrosHistKmPrev.slice(inicio, inicio + filasPorPaginaHistKmPrev);

    filas.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${inicio + index + 1}</td>
            <td><strong>${row.economico}</strong></td>
            <td>${fechaVisibleHistKm(row.fecha)}</td>
            <td>${Number(row.odometro).toLocaleString('es-MX', { maximumFractionDigits: 1 })}</td>
            <td>${Number(row.kmAcumulado).toLocaleString('es-MX', { maximumFractionDigits: 1 })}</td>
            <td>${fechaVisibleHistKm(row.ordenFecha)}</td>
            <td>${row.ordenFolio || '—'}</td>
            <td>${fechaVisibleHistKm(row.ultimoMantFecha)}</td>
            <td>${Number(row.ultimoMantKm || 0).toLocaleString('es-MX', { maximumFractionDigits: 1 })}</td>
            <td>${row.serviciosEfectuados}</td>
        `;
        tbody.appendChild(tr);
    });

    renderPaginationFAB(
        'rep-pagination-controls',
        registrosHistKmPrev.length,
        filasPorPaginaHistKmPrev,
        paginaHistKmPrev,
        (page) => {
            paginaHistKmPrev = page;
            renderizarHistKmPrev();
        }
    );
    updateTableEndFiller(
        document.getElementById('rep-table-wrapper'),
        document.getElementById('tabla-historicos-km-prev')
    );
}

function filtrarHistoricosKmPrev() {
    const modulo = document.getElementById('rep-modulo-select')?.value || '';
    const fecha = document.getElementById('rep-date-filter').value;
    const economico = normalizarRep(document.getElementById('rep-search-input').value.trim());
    const emptyState = document.getElementById('rep-empty-state');
    const noRecordsState = document.getElementById('rep-no-records');
    const wrapper = document.getElementById('rep-table-wrapper');

    if (!modulo) {
        registrosHistKmPrev = [];
        paginaHistKmPrev = 1;
        if (emptyState) emptyState.hidden = false;
        if (noRecordsState) noRecordsState.hidden = true;
        if (wrapper) wrapper.style.display = 'none';
        setTableModuleActive(false);
        renderizarHistKmPrev();
        return;
    }

    if (emptyState) emptyState.hidden = true;

    const fuente = typeof reporteHistorialOdometro !== 'undefined'
        ? reporteHistorialOdometro
        : [];
    registrosHistKmPrev = fuente
        .filter(row => row.modulo === modulo
            && row.fecha === fecha
            && (!economico || normalizarRep(row.economico).includes(economico)))
        .sort((a, b) => Number(a.economico) - Number(b.economico));

    paginaHistKmPrev = 1;
    const hayRegistros = registrosHistKmPrev.length > 0;
    if (noRecordsState) noRecordsState.hidden = hayRegistros;
    if (wrapper) wrapper.style.display = hayRegistros ? 'block' : 'none';
    setTableModuleActive(hayRegistros);
    renderizarHistKmPrev();
}

function limpiarFiltrosHistKmPrev() {
    document.getElementById('rep-date-filter').value = fechaActualHistKm();
    document.getElementById('rep-search-input').value = '';
    filtrarHistoricosKmPrev();
}

function exportarHistKmPrevExcel() {
    if (!registrosHistKmPrev.length) {
        if (typeof showToast === 'function') showToast('⚠️ No hay datos para exportar.', 'warning', 3000);
        return;
    }

    const filas = registrosHistKmPrev.map((row, index) => ({
        '#': index + 1,
        'Económico': row.economico,
        'Fecha odómetro': row.fecha,
        'Kilometraje [Km]': row.odometro,
        'Kilometraje acumulado [Km]': row.kmAcumulado,
        'Fecha orden mantenimiento': row.ordenFecha,
        'Folio': row.ordenFolio,
        'Fecha último mantenimiento': row.ultimoMantFecha,
        'Kilometraje último mantenimiento [Km]': row.ultimoMantKm,
        'Servicios efectuados': row.serviciosEfectuados
    }));
    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Histórico KM y Preventivos');
    XLSX.writeFile(wb, `Historico_KM_Preventivos_Mod_${document.getElementById('rep-modulo-select').value}.xlsx`);
}

function exportarHistKmPrevPDF() {
    if (!registrosHistKmPrev.length || !window.jspdf) {
        if (!registrosHistKmPrev.length && typeof showToast === 'function') {
            showToast('⚠️ No hay datos para imprimir.', 'warning', 3000);
        }
        return;
    }

    const modulo = document.getElementById('rep-modulo-select').value;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');
    doc.text(`Parque Vehicular - Histórico de Kilometraje y Servicios Preventivos - Módulo ${modulo}`, 14, 14);
    doc.autoTable({
        startY: 20,
        head: [['#', 'Económico', 'Fecha odómetro', 'Odómetro [Km]', 'Km acumulado', 'Fecha orden', 'Folio', 'Fecha mant.', 'Km mant.', 'Servicios']],
        body: registrosHistKmPrev.map((row, index) => [
            index + 1, row.economico, row.fecha, row.odometro, row.kmAcumulado,
            row.ordenFecha, row.ordenFolio || '—', row.ultimoMantFecha, row.ultimoMantKm, row.serviciosEfectuados
        ]),
        styles: { fontSize: 7 },
        horizontalPageBreak: true,
        horizontalPageBreakRepeat: [0, 1]
    });
    window.open(URL.createObjectURL(doc.output('blob')), '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
    const modulo = document.getElementById('rep-modulo-select');
    document.getElementById('rep-date-filter').value = fechaActualHistKm();
    if (modulo && repUserModulo && repUserModulo !== 'central') {
        modulo.value = repUserModulo.padStart(2, '0');
    }
    filtrarHistoricosKmPrev();
});
