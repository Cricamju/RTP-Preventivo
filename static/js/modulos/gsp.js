/* static/js/gsp.js */

const tableBody = document.getElementById('gsp-body');
const isAdmin = userRole === 'admin';
let isEditingMode = false;

// 🟢 CONFIGURACIÓN DE PAGINACIÓN (100 DATOS EXACTOS)
let currentPage = 1;
const rowsPerPage = 100; 

// 🟢 GENERADOR DE 150 DATOS GSP
let data = [];
const tiposServicio = ['A (15000 +- 500 Km)', 'B (30000 +- 500 Km)', 'C (45000 +- 500 Km)', 'D (60000 +- 500 Km)'];

for (let i = 1; i <= 150; i++) {
    data.push({
        id: i,
        no_orden: (1000 + i).toString(),
        fecha_gsp: `2026-08-${(i%28 + 1).toString().padStart(2, '0')}`,
        economico: (7000 + i).toString(),
        fecha_actual: `2026-08-${(i%28 + 1).toString().padStart(2, '0')}`,
        km_actual: (150000 + i * 150.5).toFixed(1),
        fecha_mant: `2026-01-${(i%28 + 1).toString().padStart(2, '0')}`,
        km_mant: (130000 + i * 100).toFixed(1),
        km_acum: (20000 + i * 50.5).toFixed(1),
        dias: (100 + i % 50).toString(),
        fecha_alta: `2026-08-${(i%28 + 3).toString().padStart(2, '0')}`,
        tipo: tiposServicio[i % 4],
        estado: i % 8 === 0 ? 'Detenida' : 'Operando'
    });
}

let filteredData = [...data];

// 🟢 ALGORITMO ANTI-DESGARRE (TRANSLATE-Y)
function adjustStickyHeaders() {
    const panel = document.getElementById('sticky-panel');
    const wrapper = document.querySelector('.table-wrapper');
    const ths = document.querySelectorAll('#gsp-table thead th');
    
    if (!panel || !wrapper || ths.length === 0) return;

    // Altura calculada de tu Topbar y Panel
    const rect = panel.getBoundingClientRect();
    const panelBottom = Math.max(rect.bottom, 85); 

    const wrapperRect = wrapper.getBoundingClientRect();
    const theadHeight = document.querySelector('#gsp-table thead').offsetHeight;

    let offset = 0;

    // Si la tabla pasa por debajo del panel, empujamos la cabecera hacia abajo (TranslateY)
    if (wrapperRect.top < panelBottom) {
        offset = panelBottom - wrapperRect.top;
        
        // Evitar que la cabecera se salga por el fondo de la tabla
        const maxOffset = wrapperRect.height - theadHeight;
        if (offset > maxOffset) offset = maxOffset;
    }

    // Aplicamos el empuje matemático a cada celda de cabecera
    ths.forEach(th => {
        th.style.transform = `translateY(${offset}px)`;
        // Añadimos una sombra solo cuando está flotando
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
    
    // Mostramos u ocultamos la columna de acciones en el <colgroup>
    const colAcciones = document.getElementById('col-acciones');
    const thAcciones = document.getElementById('th-acciones');
    if (colAcciones) colAcciones.style.display = isEditingMode ? 'table-column' : 'none';
    if (thAcciones) thAcciones.style.display = isEditingMode ? 'table-cell' : 'none';

    // 🟢 PAGINACIÓN
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    paginatedData.forEach((row) => {
        const tr = document.createElement('tr');
        let actionCell = '';
        
        if (isEditingMode) {
            actionCell = `<td style="text-align: center;"><button class="btn-delete-row" onclick="deleteRow(${row.id})" title="Eliminar Fila">🗑️</button></td>`;
        }

        const cellsHtml = `
            <td><input type="text" class="excel-input" value="${row.no_orden}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'no_orden', this.value)"></td>
            <td><input type="date" class="excel-input" value="${row.fecha_gsp}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'fecha_gsp', this.value)"></td>
            <td><input type="text" class="excel-input" value="${row.economico}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'economico', this.value)"></td>
            <td><input type="date" class="excel-input" value="${row.fecha_actual}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'fecha_actual', this.value)"></td>
            <td><input type="number" step="0.1" class="excel-input" value="${row.km_actual}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'km_actual', this.value)"></td>
            <td><input type="date" class="excel-input" value="${row.fecha_mant}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'fecha_mant', this.value)"></td>
            <td><input type="number" step="0.1" class="excel-input" value="${row.km_mant}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'km_mant', this.value)"></td>
            <td><input type="number" step="0.1" class="excel-input" value="${row.km_acum}" readonly></td>
            <td><input type="text" class="excel-input" value="${row.dias}" readonly></td>
            <td><input type="date" class="excel-input" value="${row.fecha_alta}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'fecha_alta', this.value)"></td>
            <td>
                <select class="excel-input" ${!isEditingMode ? 'disabled' : ''} onchange="updateData(${row.id}, 'tipo', this.value);">
                    <option value="A (15000 +- 500 Km)" ${row.tipo === 'A (15000 +- 500 Km)' ? 'selected' : ''}>A (15000 +- 500 Km)</option>
                    <option value="B (30000 +- 500 Km)" ${row.tipo === 'B (30000 +- 500 Km)' ? 'selected' : ''}>B (30000 +- 500 Km)</option>
                    <option value="C (45000 +- 500 Km)" ${row.tipo === 'C (45000 +- 500 Km)' ? 'selected' : ''}>C (45000 +- 500 Km)</option>
                    <option value="D (60000 +- 500 Km)" ${row.tipo === 'D (60000 +- 500 Km)' ? 'selected' : ''}>D (60000 +- 500 Km)</option>
                </select>
            </td>
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
    setTimeout(adjustStickyHeaders, 50); // Recalcular inmediatamente
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
    const newRow = { id: newId, no_orden: '', fecha_gsp: '', economico: '', fecha_actual: '', km_actual: '', fecha_mant: '', km_mant: '', km_acum: '', dias: '', fecha_alta: '', tipo: 'A (15000 +- 500 Km)', estado: 'Operando' };
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

function saveData() { alert("Guardado GSP pendiente de BD"); }

document.addEventListener('DOMContentLoaded', () => {
    renderTable();
});

// ==========================================
// EXPORTACIÓN A EXCEL Y PDF (GSP)
// ==========================================
function exportToExcel() {
    const exportData = filteredData.map(row => ({
        "No. Orden": row.no_orden,
        "Fecha GSP": row.fecha_gsp,
        "Económico": row.economico,
        "Fecha Odómetro": row.fecha_actual,
        "Km Odómetro": row.km_actual,
        "Fecha Mant.": row.fecha_mant,
        "Km Mant.": row.km_mant,
        "Km Acumulado": row.km_acum,
        "Días Trans.": row.dias,
        "Fecha Alta": row.fecha_alta,
        "Tipo": row.tipo,
        "Estado": row.estado
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "GSP");
    XLSX.writeFile(wb, "Reporte_GSP_RTP.xlsx");
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
        doc.text("SISTEMA DE MANTENIMIENTO - CAPTURA GSP", pageWidth / 2, 22, { align: "center" });
        doc.text("MÓDULO: 04", pageWidth / 2, 28, { align: "center" });
        
        // 🟢 Fecha alineada a la derecha
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const fechaStr = new Date().toLocaleString('es-MX', options).toUpperCase();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(fechaStr + " HRS", pageWidth - 14, 34, { align: "right" });

        const bodyData = filteredData.map(row => [
            row.no_orden, row.fecha_gsp, row.economico, row.km_actual, 
            row.km_mant, row.km_acum, row.dias, row.tipo, row.estado
        ]);

        doc.autoTable({
            startY: 40,
            head: [
                ['Orden', 'Fecha GSP', 'Económico', 'Odómetro Km', 'Mant. Km', 'Acumulado', 'Días', 'Tipo de Servicio', 'Estado']
            ],
            body: bodyData,
            theme: 'grid',
            headStyles: { fillColor: [0, 147, 69], textColor: [255, 255, 255], halign: 'center' },
            bodyStyles: { fontSize: 8, halign: 'center' },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        // 🟢 MAGIA: Generar archivo en memoria y abrir en nueva pestaña
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    }
}