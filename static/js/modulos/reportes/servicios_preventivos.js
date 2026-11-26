/* static/js/modulos/reportes/servicios_preventivos.js */
let registrosServicios = [];
let paginaServicios = 1;
const filasPorPaginaServicios = 50;

function normalizarRep(txt) {
    return (txt || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function fechaVisibleReporte(fecha) {
    if (!fecha) return '—';
    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
}

function renderizarServiciosPreventivos() {
    const tbody = document.getElementById('tbody-servicios-preventivos');
    if (!tbody) return;

    tbody.innerHTML = '';
    const inicio = (paginaServicios - 1) * filasPorPaginaServicios;
    const filas = registrosServicios.slice(inicio, inicio + filasPorPaginaServicios);

    filas.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${inicio + index + 1}</td>
            <td><strong>${row.economico}</strong></td>
            <td>${row.noOrden}</td>
            <td>${row.tipoServicio}</td>
            <td>${fechaVisibleReporte(row.fechaCreacion)}</td>
            <td>${Number(row.kmCreacion).toLocaleString('es-MX', { maximumFractionDigits: 1 })}</td>
            <td>${fechaVisibleReporte(row.fechaIngreso)}</td>
            <td>${Number(row.kmIngreso).toLocaleString('es-MX', { maximumFractionDigits: 1 })}</td>
            <td>${fechaVisibleReporte(row.fechaSalida)}</td>
        `;
        tbody.appendChild(tr);
    });

    renderPaginationFAB(
        'rep-pagination-controls',
        registrosServicios.length,
        filasPorPaginaServicios,
        paginaServicios,
        (page) => {
            paginaServicios = page;
            renderizarServiciosPreventivos();
        }
    );
    updateTableEndFiller(
        document.getElementById('rep-table-wrapper'),
        document.getElementById('tabla-servicios-preventivos')
    );
}

function filtrarServiciosPreventivos() {
    const modulo = document.getElementById('rep-modulo-select')?.value || '';
    const criterio = document.getElementById('rep-criterio').value;
    const mes = document.getElementById('rep-mes').value;
    const anio = document.getElementById('rep-anio').value;
    const valorFiltro = normalizarRep(document.getElementById('rep-filtro-valor').value.trim());
    const economico = normalizarRep(document.getElementById('rep-search-input').value.trim());
    const emptyState = document.getElementById('rep-empty-state');
    const noRecordsState = document.getElementById('rep-no-records');
    const wrapper = document.getElementById('rep-table-wrapper');

    if (!modulo) {
        registrosServicios = [];
        paginaServicios = 1;
        if (emptyState) emptyState.hidden = false;
        if (noRecordsState) noRecordsState.hidden = true;
        if (wrapper) wrapper.style.display = 'none';
        setTableModuleActive(false);
        renderizarServiciosPreventivos();
        return;
    }

    if (emptyState) emptyState.hidden = true;

    const fuente = typeof reporteServiciosPreventivos !== 'undefined'
        ? reporteServiciosPreventivos
        : [];
    registrosServicios = fuente.filter(row => {
        if (row.modulo !== modulo) return false;
        if (economico && !normalizarRep(row.economico).includes(economico)) return false;

        if (criterio === 'noOrden') {
            return !valorFiltro || normalizarRep(row.noOrden).includes(valorFiltro);
        }

        const fecha = row[criterio] || '';
        return fecha.startsWith(`${anio}-${mes}-`)
            && (!valorFiltro || normalizarRep(fechaVisibleReporte(fecha)).includes(valorFiltro));
    });

    registrosServicios.sort((a, b) => a.fechaIngreso.localeCompare(b.fechaIngreso));
    paginaServicios = 1;
    const hayRegistros = registrosServicios.length > 0;
    if (noRecordsState) noRecordsState.hidden = hayRegistros;
    if (wrapper) wrapper.style.display = hayRegistros ? 'block' : 'none';
    setTableModuleActive(hayRegistros);
    renderizarServiciosPreventivos();
}

function limpiarFiltrosServicios() {
    const hoy = new Date();
    document.getElementById('rep-criterio').value = 'fechaIngreso';
    document.getElementById('rep-mes').value = String(hoy.getMonth() + 1).padStart(2, '0');
    document.getElementById('rep-anio').value = String(hoy.getFullYear());
    document.getElementById('rep-filtro-valor').value = '';
    document.getElementById('rep-search-input').value = '';
    filtrarServiciosPreventivos();
}

function exportarServiciosExcel() {
    if (!registrosServicios.length) {
        if (typeof showToast === 'function') showToast('⚠️ No hay datos para exportar.', 'warning', 3000);
        return;
    }

    const filas = registrosServicios.map(row => ({
        'Económico': row.economico,
        'No. Orden Reparación': row.noOrden,
        'Tipo Servicio': row.tipoServicio,
        'Fecha de creación': row.fechaCreacion,
        'Kilometraje [Km]': row.kmCreacion,
        'Fecha ingreso a taller': row.fechaIngreso,
        'Kilometraje ingreso [Km]': row.kmIngreso,
        'Fecha sale de taller': row.fechaSalida
    }));
    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Servicios Preventivos');
    XLSX.writeFile(wb, `Reporte_Servicios_Preventivos_Mod_${document.getElementById('rep-modulo-select').value}.xlsx`);
}

function exportarServiciosPDF() {
    if (!registrosServicios.length || !window.jspdf) {
        if (!registrosServicios.length && typeof showToast === 'function') {
            showToast('⚠️ No hay datos para imprimir.', 'warning', 3000);
        }
        return;
    }

    const modulo = document.getElementById('rep-modulo-select').value;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');
    doc.text(`Reporte de Servicios Preventivos - Módulo ${modulo}`, 14, 14);
    doc.autoTable({
        startY: 20,
        head: [['Económico', 'No. Orden Reparación', 'Tipo Servicio', 'Fecha creación', 'Km', 'Fecha ingreso', 'Km ingreso', 'Fecha salida']],
        body: registrosServicios.map(row => [
            row.economico, row.noOrden, row.tipoServicio, row.fechaCreacion,
            row.kmCreacion, row.fechaIngreso, row.kmIngreso, row.fechaSalida
        ]),
        styles: { fontSize: 7 },
        horizontalPageBreak: true,
        horizontalPageBreakRepeat: [0]
    });
    window.open(URL.createObjectURL(doc.output('blob')), '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
    const modulo = document.getElementById('rep-modulo-select');
    const hoy = new Date();
    document.getElementById('rep-mes').value = String(hoy.getMonth() + 1).padStart(2, '0');
    document.getElementById('rep-anio').value = String(hoy.getFullYear());
    if (modulo && repUserModulo && repUserModulo !== 'central') {
        modulo.value = repUserModulo.padStart(2, '0');
    }
    filtrarServiciosPreventivos();
});
