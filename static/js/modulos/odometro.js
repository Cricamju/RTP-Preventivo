/* static/js/modulos/odometro.js */

const tableBody = document.getElementById('odometro-body');
const isAdmin = userRole === 'admin' || userRole === 'administrador';
let isEditingMode = false;

let currentPage = 1;
const rowsPerPage = 100; 

const modelosFlota = [
    "Volvo Caio Access 2020",
    "Yutong ZK6990HGQ 2023",
    "Dina Linner 2017",
    "Volvo Procity 2016",
    "Volvo Torino 2020",
    "Mercedes Benz Cosmopolitan 2016",
    "Volvo Articulado Metrobús"
];

// Obtener el intervalo base y reglas según el modelo de autobús
function obtenerIntervaloBaseYModelo(modelo) {
    if (!modelo) return { intervalo: 5000, tipo: 'volvo_sencillo' };
    const m = modelo.toLowerCase();
    if (m.includes('yutong')) return { intervalo: 15000, tipo: 'yutong' };
    if (m.includes('dina')) return { intervalo: 15000, tipo: 'dina' };
    if (m.includes('masa')) return { intervalo: 12000, tipo: 'masa' };
    if (m.includes('cosmopolitan')) return { intervalo: 10000, tipo: 'cosmopolitan' };
    return { intervalo: 5000, tipo: 'volvo_sencillo' }; // Volvo Torino, Caio Access, Procity, Articulados
}

function obtenerCombinacionServicios(kmAcum, modelo) {
    const k = Math.round(kmAcum);
    const { intervalo, tipo } = obtenerIntervaloBaseYModelo(modelo);
    
    if (tipo === 'yutong' || tipo === 'dina') {
        const ciclo = k % 480000; // Ciclo máximo de referencia del manual
        if (ciclo === 0 && k > 0) return { letras: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], proximoKm: k };
        let letras = [];
        if (k % 15000 === 0) letras.push('A');
        if (k % 30000 === 0) letras.push('B');
        if (k % 45000 === 0) letras.push('C');
        if (k % 60000 === 0) letras.push('D');
        if (k % 90000 === 0) letras.push('E');
        if (k % 120000 === 0) letras.push('F');
        if (k % 240000 === 0) letras.push('G');
        if (k % 480000 === 0) letras.push('H');
        if (letras.length === 0) {
            // Si cae en un rango intermedio, determinamos el servicio base más cercano
            const resto = k % 15000;
            letras.push(resto < 7500 ? 'A' : 'B');
        }
        return { letras: letras, proximoKm: Math.ceil(k / 15000) * 15000 || 15000 };
    } else if (tipo === 'masa') {
        let letras = [];
        if (k % 12000 === 0) letras.push('A');
        if (k % 24000 === 0) letras.push('B');
        if (k % 36000 === 0) letras.push('C');
        if (k % 48000 === 0) letras.push('D');
        if (k % 60000 === 0) letras.push('E');
        if (k % 72000 === 0) letras.push('F');
        if (k % 96000 === 0) letras.push('G');
        if (k % 120000 === 0) letras.push('H');
        if (letras.length === 0) letras.push('A');
        return { letras: letras, proximoKm: Math.ceil(k / 12000) * 12000 || 12000 };
    } else if (tipo === 'cosmopolitan') {
        let letras = [];
        if (k % 10000 === 0) letras.push('A');
        if (k % 20000 === 0) letras.push('B');
        if (k % 30000 === 0) letras.push('C');
        if (k % 60000 === 0) letras.push('D');
        if (k % 90000 === 0) letras.push('E');
        if (k % 120000 === 0) letras.push('F');
        if (k % 240000 === 0) letras.push('G');
        if (k % 480000 === 0) letras.push('H');
        if (letras.length === 0) letras.push('A');
        return { letras: letras, proximoKm: Math.ceil(k / 10000) * 10000 || 10000 };
    } else {
        // Volvo Sencillos / Articulados (Base 5000 km)[cite: 20, 48]
        let letras = [];
        if (k % 5000 === 0) letras.push('A');
        if (k % 15000 === 0) letras.push('B');
        if (k % 20000 === 0) letras.push('C');
        if (k % 30000 === 0) letras.push('D');
        if (k % 45000 === 0) letras.push('E');
        if (k % 60000 === 0) letras.push('F');
        if (k % 120000 === 0) letras.push('G');
        if (k % 240000 === 0) letras.push('H');
        if (k % 480000 === 0) letras.push('I');
        if (letras.length === 0) letras.push('A');
        return { letras: letras, proximoKm: Math.ceil(k / 5000) * 5000 || 5000 };
    }
}

function calcularSemaforoMantenimiento(kmAcum, modelo) {
    const k = parseFloat(kmAcum) || 0;
    const { intervalo } = obtenerIntervaloBaseYModelo(modelo);
    const remainder = k % intervalo;
    const nextMilestone = Math.floor(k / intervalo + 1) * intervalo;
    const distToNext = nextMilestone - k;

    const servInfo = obtenerCombinacionServicios(nextMilestone, modelo);
    const tipoServicioStr = servInfo.letras.join(' + ');

    let colorSemaforo = "verde"; 
    let etiquetaSemaforo = `Óptimo (${tipoServicioStr})`;
    let prioridadOrden = 3; 

    if (distToNext <= 1000 && distToNext >= 0) {
        colorSemaforo = "amarillo";  
        etiquetaSemaforo = `Próximo (${tipoServicioStr})`;
        prioridadOrden = 2;
    } else if (remainder > 0 && remainder <= 3000) {
        colorSemaforo = "rojo";      
        etiquetaSemaforo = `Vencido (${tipoServicioStr})`;
        prioridadOrden = 1;
    } else {
        colorSemaforo = "verde";     
        etiquetaSemaforo = `Seguro (${tipoServicioStr})`;
        prioridadOrden = 3;
    }

    return { 
        color: colorSemaforo, 
        texto: etiquetaSemaforo, 
        servicioTexto: tipoServicioStr,
        numLetras: servInfo.letras.length,
        prioridad: prioridadOrden,
        metaKm: nextMilestone 
    };
}

let data = [];
const modulosList = ['01', '02', '03', '04', '05', '06', '07'];

let globalId = 1;
modulosList.forEach((mod) => {
    for (let i = 1; i <= 150; i++) {
        const modeloAsignado = modelosFlota[i % modelosFlota.length];
        const { intervalo } = obtenerIntervaloBaseYModelo(modeloAsignado);
        
        const multiplier = ((i * 7) % 35) + 5; // Genera rangos variados de kilometraje
        const baseMilestone = intervalo * multiplier;

        let kmAcumSimulado = 0;
        const statusSelector = i % 5;

        if (statusSelector === 0) {
            kmAcumSimulado = baseMilestone + ((i * 37) % 2500) + 200; 
        } else if (statusSelector === 1 || statusSelector === 2) {
            kmAcumSimulado = baseMilestone - (((i * 23) % 700) + 100); 
        } else {
            kmAcumSimulado = baseMilestone - (((i * 59) % 4000) + 1000); 
        }

        if (kmAcumSimulado < 2000) kmAcumSimulado = 3500;

        const estadoMant = calcularSemaforoMantenimiento(kmAcumSimulado, modeloAsignado);

        data.push({
            id: globalId++,
            modulo: mod,
            economico: (6000 + (parseInt(mod) * 200) + i).toString(),
            modelo: modeloAsignado,
            fecha_alta: `200${4 + (i%5)}-0${(i%9)+1}-15`,
            fechaActual: `2026-08-${(i%28 + 1).toString().padStart(2, '0')}`,
            kmActual: (kmAcumSimulado + 120.5).toFixed(1),
            fechaMant: `2026-01-${(i%28 + 1).toString().padStart(2, '0')}`,
            kmMant: (kmAcumSimulado - 4500).toFixed(1),
            kmAcum: kmAcumSimulado.toFixed(1),
            dias: (30 + (i % 90)).toString(),
            orden: (10000 + i).toString(),
            servicios: (10 + (i % 80)).toString(),
            estado: i % 14 === 0 ? 'Detenida' : 'Operando',
            siguienteServicio: estadoMant.servicioTexto,
            estadoMant: estadoMant
        });
    }
});

let filteredData = []; 

function normalizarTexto(texto) {
    if (!texto) return "";
    return texto.toString().toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function renderTable() {
    const selectedModule = document.getElementById('module-filter-select').value;
    const emptyStateDiv = document.getElementById('odometro-empty-state');
    const tableWrapper = document.getElementById('table-wrapper-container');
    const paginationWrapper = document.getElementById('pagination-wrapper-container');

    if (!selectedModule) {
        if (emptyStateDiv) emptyStateDiv.style.display = 'block';
        if (tableWrapper) tableWrapper.style.display = 'none';
        if (paginationWrapper) paginationWrapper.style.display = 'none';
        return;
    } else {
        if (emptyStateDiv) emptyStateDiv.style.display = 'none';
        if (tableWrapper) tableWrapper.style.display = 'block';
        if (paginationWrapper) paginationWrapper.style.display = 'flex';
    }

    tableBody.innerHTML = '';
    
    const colAcciones = document.getElementById('col-acciones');
    const thAcciones = document.getElementById('th-acciones');
    const thFilterAcciones = document.getElementById('th-filter-acciones');
    if (colAcciones) colAcciones.style.display = isEditingMode ? 'table-column' : 'none';
    if (thAcciones) thAcciones.style.display = isEditingMode ? 'table-cell' : 'none';
    if (thFilterAcciones) thFilterAcciones.style.display = isEditingMode ? 'table-cell' : 'none';

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    if (paginatedData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="14" style="width: 100%; padding: 0; border: none; background: transparent;">
                    <div style="width: 100%; min-width: 1150px; height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; box-sizing: border-box;">
                        <div style="font-size: 2.5rem; margin-bottom: 10px;">🔍</div>
                        <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-light);">No se encontraron registros con los filtros actuales.</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 5px;">Intente modificar los términos de búsqueda o limpiar los filtros.</div>
                    </div>
                </td>
            </tr>`;
        renderPagination();
        return;
    }

    paginatedData.forEach((row, index) => {
        const tr = document.createElement('tr');
        const colorClass = row.estadoMant.color; 
        tr.className = `row-semaforo-${colorClass}`;

        const numeroConteo = startIndex + index + 1;

        let actionCell = isEditingMode ? `<td style="text-align: center;"><button class="btn-delete-row" onclick="deleteRow(${row.id})" title="Eliminar Fila">🗑️</button></td>` : '';
        let adminColServ = isAdmin ? `<td><input type="number" class="excel-input" value="${row.servicios}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'servicios', this.value)"></td>` : '';
        
let actionOrdenCell = `<td style="text-align: center;"><a href="/orden-reparacion?economico=${row.economico}&modulo=${row.modulo}&servicio=${encodeURIComponent(row.siguienteServicio)}&modelo=${encodeURIComponent(row.modelo)}&color=${row.estadoMant.color}" class="btn-action-orden" title="Generar Orden para ${row.siguienteServicio}">📄</a></td>`;
        tr.innerHTML = `
            <td style="text-align: center; font-weight: bold; font-size: 0.8rem; color: var(--text-muted);">${numeroConteo}</td>
            <td><input type="text" class="excel-input" value="${row.economico}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'economico', this.value)"></td>
            <td><input type="text" class="excel-input" value="${row.modelo}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'modelo', this.value)" style="font-size: 0.75rem; text-align: left; padding-left: 6px;"></td>
            <td><input type="date" class="excel-input" value="${row.fechaActual}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'fechaActual', this.value)"></td>
            <td><input type="number" step="0.1" class="excel-input" value="${row.kmActual}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'kmActual', this.value)"></td>
            <td><input type="date" class="excel-input" value="${row.fechaMant}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'fechaMant', this.value)"></td>
            <td><input type="number" step="0.1" class="excel-input" value="${row.kmMant}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'kmMant', this.value)"></td>
            <td><input type="number" step="0.1" class="excel-input" value="${row.kmAcum}" ${!isEditingMode ? 'readonly' : ''} onchange="updateData(${row.id}, 'kmAcum', this.value)" title="Próx. Meta: ${row.estadoMant.metaKm} Km"></td>
            
            <td style="text-align: center; vertical-align: middle;">
                <span class="semaforo-badge-cell ${colorClass}">● ${row.estadoMant.texto}</span>
            </td>

            <td><input type="text" class="excel-input" value="${row.dias}" readonly></td>
            ${adminColServ}
            <td>
                <select class="excel-input ${row.estado === 'Detenida' ? 'status-detenida' : 'status-operando'}" ${!isEditingMode ? 'disabled' : ''} onchange="updateData(${row.id}, 'estado', this.value); updateStatusColor(this);">
                    <option value="Operando" ${row.estado === 'Operando' ? 'selected' : ''}>Operando</option>
                    <option value="Detenida" ${row.estado === 'Detenida' ? 'selected' : ''}>Detenida</option>
                </select>
            </td>
            ${actionOrdenCell}
            ${actionCell}
        `;
        tableBody.appendChild(tr);
    });
    
    setupKeyboardNavigation();
    renderPagination();
}

function renderPagination() {
    const container = document.getElementById('pagination-controls');
    container.innerHTML = '';
    const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));

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
    if (item) {
        item[key] = value;
        if (key === 'kmAcum' || key === 'modelo') {
            item.estadoMant = calcularSemaforoMantenimiento(parseFloat(item.kmAcum) || 0, item.modelo);
            item.siguienteServicio = item.estadoMant.servicioTexto;
        }
    }
}

function toggleEditMode() {
    if (!isAdmin) {
        alert("Acceso denegado: Se requieren privilegios de Administrador.");
        return; 
    }
    isEditingMode = !isEditingMode;
    const btn = document.getElementById('btn-toggle-edit');
    const tools = document.getElementById('admin-tools');
    
    if (isEditingMode) {
        btn.className = 'btn-toggle-mode editable';
        btn.innerHTML = '✏️ Modo Edición';
        tools.style.display = 'flex'; 
    } else {
        btn.className = 'btn-toggle-mode readonly';
        btn.innerHTML = '👁️ Modo Consulta';
        tools.style.display = 'none'; 
    }
    renderTable();
}

function updateStatusColor(selectElement) {
    selectElement.className = selectElement.value === 'Detenida' ? 'excel-input status-detenida' : 'excel-input status-operando';
}

function addNewRow() {
    if (!isEditingMode) return;
    const selMod = document.getElementById('module-filter-select').value || '01';
    const newId = Date.now();
    const modeloDefault = "Volvo Caio Access 2020";
    const estadoMant = calcularSemaforoMantenimiento(0, modeloDefault);
    const newRow = { 
        id: newId, modulo: selMod, economico: '', modelo: modeloDefault, fecha_alta: '2026-01-01', fechaActual: '', kmActual: '', fechaMant: '', kmMant: '', kmAcum: '0', dias: '', orden: '10000', servicios: '', estado: 'Operando', siguienteServicio: estadoMant.servicioTexto, estadoMant: estadoMant 
    };
    data.unshift(newRow);
    filterTable(); 
}

function deleteRow(id) {
    if (!isEditingMode) return;
    data = data.filter(d => d.id !== id);
    filterTable();
}

function filterTable() {
    const selectedModule = document.getElementById('module-filter-select').value;
    const globalQuery = normalizarTexto(document.getElementById("search-input").value);
    
    const columnFilters = {};
    document.querySelectorAll('.column-filter').forEach(input => {
        const col = input.getAttribute('data-col');
        const val = normalizarTexto(input.value.trim());
        if (val) columnFilters[col] = val;
    });

    if (selectedModule) {
        localStorage.setItem('rtp_selected_modulo', selectedModule);
    } else {
        localStorage.removeItem('rtp_selected_modulo');
    }

    if (!selectedModule) {
        filteredData = [];
        renderTable();
        return;
    }

    filteredData = data.filter(row => {
        const matchesModule = row.modulo === selectedModule;
        const rowText = normalizarTexto(Object.values(row).join(' '));
        const matchesGlobal = rowText.includes(globalQuery);

        let matchesColumns = true;
        for (const col in columnFilters) {
            let cellValue = "";
            if (col === 'siguienteServicio') {
                cellValue = normalizarTexto(row.estadoMant.texto);
            } else {
                cellValue = normalizarTexto(row[col]);
            }
            if (!cellValue.includes(columnFilters[col])) {
                matchesColumns = false;
                break;
            }
        }

        return matchesModule && matchesGlobal && matchesColumns;
    });

    currentPage = 1; 
    renderTable();
}

let sortAsc = false;
function sortTable(key) {
    sortAsc = !sortAsc;
    filteredData.sort((a, b) => {
        if (key === 'siguienteServicio') {
            const priA = a.estadoMant.prioridad;
            const priB = b.estadoMant.prioridad;
            if (priA !== priB) {
                return sortAsc ? priA - priB : priB - priA;
            }
            const lenA = a.estadoMant.numLetras;
            const lenB = b.estadoMant.numLetras;
            return sortAsc ? lenB - lenA : lenA - lenB;
        }

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
    const selectModule = document.getElementById('module-filter-select');
    
    if (userAssignedModule && userAssignedModule !== '') {
        selectModule.value = userAssignedModule;
        selectModule.disabled = true;
    } else {
        const savedModule = localStorage.getItem('rtp_selected_modulo');
        if (savedModule) {
            selectModule.value = savedModule;
        } else {
            selectModule.value = "";
        }
    }
    
    filterTable();
});

function exportToExcel() {
    const selectedModule = document.getElementById('module-filter-select').value;
    if (!selectedModule) {
        alert("Por favor, seleccione un Módulo antes de exportar.");
        return;
    }

    const exportData = filteredData.map((row, index) => ({
        "No.": index + 1,
        "Módulo": row.modulo,
        "Económico": row.economico,
        "Modelo / Unidad": row.modelo,
        "Fecha de Alta": row.fecha_alta,
        "Fecha Odómetro": row.fechaActual,
        "Km Odómetro": row.kmActual,
        "Fecha Mantenimiento": row.fechaMant,
        "Km Mantenimiento": row.kmMant,
        "Km Acumulado": row.kmAcum,
        "Servicio Requerido": row.siguienteServicio,
        "Días Transcurridos": row.dias,
        "Orden": row.orden,
        "Servicios Efectuados": row.servicios,
        "Estado": row.estado
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Odómetro");
    XLSX.writeFile(wb, `Reporte_Odometro_Modulo_${selectedModule}.xlsx`);
}

function exportToPDF() {
    const selectedModule = document.getElementById('module-filter-select').value;
    if (!selectedModule) {
        alert("Por favor, seleccione un Módulo antes de imprimir.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape'); 

    const logo = new Image();
    logo.src = '/static/img/logos/logo-rtp.png';
    
    logo.onload = function() { generarPDF(logo); };
    logo.onerror = function() { generarPDF(null); };

    function generarPDF(logoImg) {
        const pageWidth = doc.internal.pageSize.getWidth();
        
        if (logoImg) {
            doc.addImage(logoImg, 'PNG', 14, 10, 35, 20); 
        }
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 147, 69);
        doc.text("RED DE TRANSPORTE DE PASAJEROS (RTP)", pageWidth / 2, 16, { align: "center" });
        
        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);
        doc.text("SISTEMA DE MANTENIMIENTO", pageWidth / 2, 22, { align: "center" });
        doc.text("MÓDULO: " + selectedModule, pageWidth / 2, 28, { align: "center" });
        
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const fechaStr = new Date().toLocaleString('es-MX', options).toUpperCase();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(fechaStr + " HRS", pageWidth - 14, 34, { align: "right" });

        const bodyData = filteredData.map((row, index) => [
            (index + 1).toString(), row.modulo, row.economico, row.modelo, row.fecha_alta, row.fechaActual, row.kmActual, row.fechaMant, 
            row.kmMant, row.kmAcum, row.siguienteServicio, row.dias, row.orden, row.servicios, row.estado
        ]);

        doc.autoTable({
            startY: 40,
            head: [
                [{content: '#', rowSpan: 2}, {content: 'Mód.', rowSpan: 2}, {content: 'Econ.', rowSpan: 2}, {content: 'Modelo / Unidad', rowSpan: 2}, {content: 'Fecha Alta', rowSpan: 2}, {content: 'Odómetro Actual', colSpan: 2}, {content: 'Último Mantenimiento', colSpan: 2}, {content: 'Km Acum.', rowSpan: 2}, {content: 'Servicio', rowSpan: 2}, {content: 'Días', rowSpan: 2}, {content: 'Orden', rowSpan: 2}, {content: 'Servicios', rowSpan: 2}, {content: 'Estado', rowSpan: 2}],
                ['Fecha', 'Km', 'Fecha', 'Km']
            ],
            body: bodyData,
            theme: 'grid',
            headStyles: { fillColor: [0, 147, 69], textColor: [255, 255, 255], halign: 'center' },
            bodyStyles: { fontSize: 7, halign: 'center' },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    }
}