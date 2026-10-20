/* static/js/odometro.js */

const tableBody = document.getElementById('odometro-body');
const isAdmin = userRole === 'admin';
let isEditingMode = false;

// 🟢 CONFIGURACIÓN DE PAGINACIÓN
let currentPage = 1;
const rowsPerPage = 100; 

// 🟢 GENERADOR DE 150 DATOS (INCLUYE DATOS FANTASMA: fecha_alta y servicios)
let data = [];
for (let i = 1; i <= 150; i++) {
    data.push({
        id: i,
        modulo: '04',
        economico: (6000 + i).toString(),
        fecha_alta: `200${4 + (i%5)}-0${(i%9)+1}-15`, // Dato fantasma 👻
        fechaActual: `2026-08-${(i%28 + 1).toString().padStart(2, '0')}`,
        kmActual: (300000 + i * 150.5).toFixed(1),
        fechaMant: `2026-01-${(i%28 + 1).toString().padStart(2, '0')}`,
        kmMant: (280000 + i * 100).toFixed(1),
        kmAcum: (20000 + i * 50.5).toFixed(1),
        dias: (100 + i % 50).toString(),
        orden: (10000 + i).toString(),
        servicios: (50 + i % 100).toString(), // Dato fantasma 👻
        estado: i % 8 === 0 ? 'Detenida' : 'Operando'
    });
}

let filteredData = [...data];

// 🟢 ALGORITMO ANTI-DESGARRE DE ENCABEZADOS
function adjustStickyHeaders() {
    const panel = document.getElementById('sticky-panel');
    const wrapper = document.querySelector('.table-wrapper');
    const ths = document.querySelectorAll('#odometro-table thead th');
    
    if (!panel || !wrapper || ths.length === 0) return;

    const rect = panel.getBoundingClientRect();
    const panelBottom = Math.max(rect.bottom, 85); 

    const wrapperRect = wrapper.getBoundingClientRect();
    const theadHeight = document.querySelector('#odometro-table thead').offsetHeight;

    let offset = 0;
    if (wrapperRect.top < panelBottom) {
        offset = panelBottom - wrapperRect.top;
        const maxOffset = wrapperRect.height - theadHeight;
        if (offset > maxOffset) offset = maxOffset;
    }

    ths.forEach(th => {
        th.style.transform = `translateY(${offset}px)`;
        if(offset > 0) {
            th.style.boxShadow = '0 5px 10px rgba(0,0,0,0.4)';
        } else {
            th.style.boxShadow = 'none';
        }
    });
}

window.addEventListener('scroll', adjustStickyHeaders);
window.addEventListener('resize', adjustStickyHeaders);

function renderTable() {
    tableBody.innerHTML = '';
    
    const colAcciones = document.getElementById('col-acciones');
    const thAcciones = document.getElementById('th-acciones');
    if (colAcciones) colAcciones.style.display = isEditingMode ? 'table-column' : 'none';
    if (thAcciones) thAcciones.style.display = isEditingMode ? 'table-cell' : 'none';

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    paginatedData.forEach((row) => {
        const tr = document.createElement('tr');
        
        let actionCell = '';
        if (isEditingMode) {
            actionCell = `<td style="text-align: center;"><button class="btn-delete-row" onclick="deleteRow(${row.id})" title="Eliminar Fila">🗑️</button></td>`;
        }

        // 🟢 Celdas que solo se renderizan en HTML si el rol es Admin
        let adminColAlta = isAdmin ? `<td><input type="date" class="excel-input" value="${row.fecha_alta}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'fecha_alta', this.value)"></td>` : '';
        let adminColServ = isAdmin ? `<td><input type="number" class="excel-input" value="${row.servicios}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'servicios', this.value)"></td>` : '';

        const cellsHtml = `
            <td><input type="text" class="excel-input" value="${row.modulo}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'modulo', this.value)"></td>
            <td><input type="text" class="excel-input" value="${row.economico}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'economico', this.value)"></td>
            ${adminColAlta}
            <td><input type="date" class="excel-input" value="${row.fechaActual}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'fechaActual', this.value)"></td>
            <td><input type="number" step="0.1" class="excel-input" value="${row.kmActual}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'kmActual', this.value)"></td>
            <td><input type="date" class="excel-input" value="${row.fechaMant}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'fechaMant', this.value)"></td>
            <td><input type="number" step="0.1" class="excel-input" value="${row.kmMant}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'kmMant', this.value)"></td>
            <td><input type="number" step="0.1" class="excel-input" value="${row.kmAcum}" readonly></td>
            <td><input type="text" class="excel-input" value="${row.dias}" readonly></td>
            <td><input type="text" class="excel-input" value="${row.orden}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'orden', this.value)"></td>
            ${adminColServ}
            <td>
                <select class="excel-input ${row.estado === 'Detenida' ? 'status-detenida' : 'status-operando'}" ${!isEditingMode ? 'disabled' : ''} onchange="updateData(${row.id}, 'estado', this.value); updateStatusColor(this);">
                    <option value="Operando" ${row.estado === 'Operando' ? 'selected' : ''}>Operando</option>
                    <option value="Detenida" ${row.estado === 'Detenida' ? 'selected' : ''}>Detenida</option>
                </select>
            </td>
            ${actionCell}
        `;
        
        tr.innerHTML = cellsHtml;
        tableBody.appendChild(tr);
    });
    
    setupKeyboardNavigation();
    renderPagination();
    setTimeout(adjustStickyHeaders, 50);
}

function renderPagination() {
    const container = document.getElementById('pagination-controls');
    container.innerHTML = '';
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    if (totalPages <= 1) return; 

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        btn.innerText = i;
        btn.onclick = () => {
            currentPage = i;
            renderTable();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        container.appendChild(btn);
    }
}

function updateData(id, key, value) {
    const item = data.find(d => d.id === id);
    if (item) item[key] = value;
}

function toggleEditMode() {
    if (!isAdmin) return; 
    isEditingMode = !isEditingMode;
    const btn = document.getElementById('btn-toggle-edit');
    const tools = document.getElementById('admin-tools');
    
    if (isEditingMode) {
        btn.className = 'btn-toggle-mode editable';
        btn.innerHTML = '✏️ Consulta';
        tools.style.display = 'flex'; 
    } else {
        btn.className = 'btn-toggle-mode readonly';
        btn.innerHTML = '👁️ Editar';
        tools.style.display = 'none'; 
    }
    renderTable();
}

function updateStatusColor(selectElement) {
    selectElement.className = selectElement.value === 'Detenida' ? 'excel-input status-detenida' : 'excel-input status-operando';
}

function addNewRow() {
    if (!isEditingMode) return;
    const newId = Date.now();
    const newRow = { id: newId, modulo: '', economico: '', fecha_alta: '', fechaActual: '', kmActual: '', fechaMant: '', kmMant: '', kmAcum: '', dias: '', orden: '', servicios: '', estado: 'Operando' };
    data.unshift(newRow);
    filterTable(); 
}

function deleteRow(id) {
    if (!isEditingMode) return;
    data = data.filter(d => d.id !== id);
    filterTable();
}

function filterTable() {
    const query = document.getElementById("search-input").value.toLowerCase();
    filteredData = data.filter(row => {
        const rowText = Object.values(row).join(' ').toLowerCase();
        return rowText.includes(query);
    });
    currentPage = 1; 
    renderTable();
}

let sortAsc = false;
function sortTable(key) {
    sortAsc = !sortAsc;
    filteredData.sort((a, b) => {
        const valA = a[key];
        const valB = b[key];
        const numA = parseFloat(valA);
        const numB = parseFloat(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
            return sortAsc ? numA - numB : numB - numA;
        }
        return sortAsc ? valA.toString().localeCompare(valB.toString()) : valB.toString().localeCompare(valA.toString());
    });
    currentPage = 1;
    renderTable();
}

function setupKeyboardNavigation() {
    if (!isEditingMode) return; 
    const inputs = document.querySelectorAll('.excel-input:not([readonly])');
    inputs.forEach(input => {
        input.addEventListener('keydown', function(e) {
            const currentTd = this.closest('td');
            const currentRow = currentTd.closest('tr');
            let targetInput = null;

            switch(e.key) {
                case 'ArrowRight':
                    const nextTd = currentTd.nextElementSibling;
                    if (nextTd) targetInput = nextTd.querySelector('input, select');
                    break;
                case 'ArrowLeft':
                    const prevTd = currentTd.previousElementSibling;
                    if (prevTd) targetInput = prevTd.querySelector('input, select');
                    break;
                case 'ArrowDown':
                case 'Enter':
                    e.preventDefault(); 
                    const nextRow = currentRow.nextElementSibling;
                    if (nextRow) {
                        const cellIndex = Array.from(currentRow.children).indexOf(currentTd);
                        targetInput = nextRow.children[cellIndex].querySelector('input, select');
                    }
                    break;
                case 'ArrowUp':
                    const prevRow = currentRow.previousElementSibling;
                    if (prevRow) {
                        const cellIndex = Array.from(currentRow.children).indexOf(currentTd);
                        targetInput = prevRow.children[cellIndex].querySelector('input, select');
                    }
                    break;
            }

            if (targetInput && !targetInput.hasAttribute('readonly') && !targetInput.disabled) {
                targetInput.focus();
                if (targetInput.tagName === 'INPUT' && targetInput.type === 'text') targetInput.select();
            }
        });
    });
}

function saveData() { alert("Función de guardado pendiente de conectar a la BD"); }

document.addEventListener('DOMContentLoaded', () => {
    renderTable();
});


// ==========================================
// EXPORTACIÓN A EXCEL Y PDF (CON DATOS FANTASMA INCLUIDOS)
// ==========================================
function exportToExcel() {
    // 🟢 Mapeamos TODOS los datos, incluyendo los que no ve el rol "Consulta"
    const exportData = filteredData.map(row => ({
        "Módulo": row.modulo,
        "Económico": row.economico,
        "Fecha de Alta": row.fecha_alta, // Dato Fantasma incluido
        "Fecha Odómetro": row.fechaActual,
        "Km Odómetro": row.kmActual,
        "Fecha Mantenimiento": row.fechaMant,
        "Km Mantenimiento": row.kmMant,
        "Km Acumulado": row.kmAcum,
        "Días Transcurridos": row.dias,
        "Orden de Mantenimiento": row.orden,
        "Servicios Efectuados": row.servicios, // Dato Fantasma incluido
        "Estado": row.estado
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Odómetro");
    XLSX.writeFile(wb, "Reporte_Odometro_RTP.xlsx");
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape'); 

    const logo = new Image();
    logo.src = '/static/img/logos/logo-rtp.png';
    
    logo.onload = function() { generarPDF(logo); };
    logo.onerror = function() { generarPDF(null); };

    function generarPDF(logoImg) {
        const pageWidth = doc.internal.pageSize.getWidth();
        
        if (logoImg) {
            // 🟢 Proporción rectangular ajustada (35x15)
            doc.addImage(logoImg, 'PNG', 14, 10, 35, 20); 
        }
        
        // 🟢 Textos Centrados
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 147, 69);
        doc.text("RED DE TRANSPORTE DE PASAJEROS (RTP)", pageWidth / 2, 16, { align: "center" });
        
        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);
        doc.text("SISTEMA DE MANTENIMIENTO", pageWidth / 2, 22, { align: "center" });
        doc.text("MÓDULO: 04", pageWidth / 2, 28, { align: "center" });
        
        // 🟢 Fecha a la derecha
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const fechaStr = new Date().toLocaleString('es-MX', options).toUpperCase();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(fechaStr + " HRS", pageWidth - 14, 34, { align: "right" });

        // 🟢 Mapeamos TODO, incluyendo los datos fantasma
        const bodyData = filteredData.map(row => [
            row.modulo, row.economico, row.fecha_alta, row.fechaActual, row.kmActual, row.fechaMant, 
            row.kmMant, row.kmAcum, row.dias, row.orden, row.servicios, row.estado
        ]);

        doc.autoTable({
            startY: 40,
            head: [
                [{content: 'Mód.', rowSpan: 2}, {content: 'Econ.', rowSpan: 2}, {content: 'Fecha Alta', rowSpan: 2}, {content: 'Odómetro Actual', colSpan: 2}, {content: 'Último Mantenimiento', colSpan: 2}, {content: 'Km Acum.', rowSpan: 2}, {content: 'Días', rowSpan: 2}, {content: 'Orden', rowSpan: 2}, {content: 'Servicios', rowSpan: 2}, {content: 'Estado', rowSpan: 2}],
                ['Fecha', 'Km', 'Fecha', 'Km']
            ],
            body: bodyData,
            theme: 'grid',
            headStyles: { fillColor: [0, 147, 69], textColor: [255, 255, 255], halign: 'center' },
            bodyStyles: { fontSize: 7, halign: 'center' }, // Letra un pelín más chica para que quepan las 12 columnas perfectas
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        // 🟢 MAGIA: Abre en nueva pestaña sin descargar automáticamente
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    }
}