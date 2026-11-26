/* static/js/modulos/reportes/historicos_dia_dia.js */
let registrosDiaDia = [];
let paginaDiaDia = 1;
const filasPorPaginaDiaDia = 50;

function normalizarRep(txt) {
    return (txt || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function fechaVisibleDiaDia(fecha) {
    if (!fecha) return '—';
    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
}

function fechaActualDiaDia() {
    return fechaReporteISO(new Date());
}

function renderizarDiaDia() {
    const tbody = document.getElementById('tbody-historicos-dia-dia');
    if (!tbody) return;

    tbody.innerHTML = '';
    const inicio = (paginaDiaDia - 1) * filasPorPaginaDiaDia;
    const filas = registrosDiaDia.slice(inicio, inicio + filasPorPaginaDiaDia);

    filas.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${inicio + index + 1}</td>
            <td><strong>${row.economico}</strong></td>
            <td>${fechaVisibleDiaDia(row.fecha)}</td>
            <td>${Number(row.odometro).toLocaleString('es-MX', { maximumFractionDigits: 1 })}</td>
        `;
        tbody.appendChild(tr);
    });

    renderPaginationFAB(
        'rep-pagination-controls',
        registrosDiaDia.length,
        filasPorPaginaDiaDia,
        paginaDiaDia,
        (page) => {
            paginaDiaDia = page;
            renderizarDiaDia();
        }
    );
    updateTableEndFiller(
        document.getElementById('rep-table-wrapper'),
        document.getElementById('tabla-historicos-dia-dia')
    );
}

function filtrarHistoricosDiaDia() {
    const modulo = document.getElementById('rep-modulo-select')?.value || '';
    const fecha = document.getElementById('rep-date-filter').value;
    const economico = normalizarRep(document.getElementById('rep-search-input').value.trim());
    const emptyState = document.getElementById('rep-empty-state');
    const noRecordsState = document.getElementById('rep-no-records');
    const wrapper = document.getElementById('rep-table-wrapper');

    if (!modulo) {
        registrosDiaDia = [];
        paginaDiaDia = 1;
        if (emptyState) emptyState.hidden = false;
        if (noRecordsState) noRecordsState.hidden = true;
        if (wrapper) wrapper.style.display = 'none';
        setTableModuleActive(false);
        renderizarDiaDia();
        return;
    }

    if (emptyState) emptyState.hidden = true;

    const fuente = typeof reporteHistorialOdometro !== 'undefined'
        ? reporteHistorialOdometro
        : [];
    registrosDiaDia = fuente
        .filter(row => row.modulo === modulo
            && row.fecha === fecha
            && (!economico || normalizarRep(row.economico).includes(economico)))
        .sort((a, b) => Number(a.economico) - Number(b.economico));

    paginaDiaDia = 1;
    const hayRegistros = registrosDiaDia.length > 0;
    if (noRecordsState) noRecordsState.hidden = hayRegistros;
    if (wrapper) wrapper.style.display = hayRegistros ? 'block' : 'none';
    setTableModuleActive(hayRegistros);
    renderizarDiaDia();
}

function limpiarFiltrosDiaDia() {
    document.getElementById('rep-date-filter').value = fechaActualDiaDia();
    document.getElementById('rep-search-input').value = '';
    filtrarHistoricosDiaDia();
}

function exportarDiaDiaExcel() {
    if (!registrosDiaDia.length) {
        if (typeof showToast === 'function') showToast('⚠️ No hay datos para exportar.', 'warning', 3000);
        return;
    }

    const filas = registrosDiaDia.map((row, index) => ({
        '#': index + 1,
        'Económico': row.economico,
        'Fecha': row.fecha,
        'Odómetro': row.odometro
    }));
    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Histórico diario');
    XLSX.writeFile(wb, `Historico_Odometro_Diario_Mod_${document.getElementById('rep-modulo-select').value}.xlsx`);
}

function exportarDiaDiaPDF() {
    if (!registrosDiaDia.length || !window.jspdf) {
        if (!registrosDiaDia.length && typeof showToast === 'function') {
            showToast('⚠️ No hay datos para imprimir.', 'warning', 3000);
        }
        return;
    }

    const modulo = document.getElementById('rep-modulo-select').value;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');
    doc.text(`Parque Vehicular - Histórico de Kilometraje Diario - Módulo ${modulo}`, 14, 14);
    doc.autoTable({
        startY: 20,
        head: [['#', 'Económico', 'Fecha', 'Odómetro [Km]']],
        body: registrosDiaDia.map((row, index) => [
            index + 1, row.economico, row.fecha, row.odometro
        ])
    });
    window.open(URL.createObjectURL(doc.output('blob')), '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
    const modulo = document.getElementById('rep-modulo-select');
    document.getElementById('rep-date-filter').value = fechaActualDiaDia();
    if (modulo && repUserModulo && repUserModulo !== 'central') {
        modulo.value = repUserModulo.padStart(2, '0');
    }
    filtrarHistoricosDiaDia();
});
