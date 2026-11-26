/* static/js/modulos/odometro.js */

const tableBody = document.getElementById('odometro-body');
const isAdmin = userRole === 'admin' || userRole === 'administrador';
let isEditingMode = false;

let currentPage = 1;
const rowsPerPage = 100; 

let filaEnEdicionOriginal = null;
let filaEnEdicionId = null;
let cambiosPendientesFila = {};
let hasUnsavedChanges = false;

function obtenerPdfGspPorModelo(modelo) {
    const nombreModelo = (modelo || '').toLowerCase();

    if (nombreModelo.includes('biarticulado')) return 'biarticulado.pdf';
    if (nombreModelo.includes('articulado')) return 'articulado.pdf';
    if (nombreModelo.includes('yutong')) return 'yutong_2.pdf';
    if (nombreModelo.includes('dina')) return 'Dina.pdf';
    if (nombreModelo.includes('masa')) return 'MASA.pdf';
    if (nombreModelo.includes('cosmopolitan')) return 'Cosmopolitan.pdf';
    if (nombreModelo.includes('procity')) return 'procity2016.pdf';
    if (nombreModelo.includes('mercedes') || nombreModelo.includes('mb_torino')) return 'MB_TORINO.pdf';
    if (nombreModelo.includes('torino')) return 'torino_volvo.pdf';
    return 'Acces2020.pdf';
}

function renderPagination(totalUnselectedCount) {
    renderPaginationFAB(
        'pagination-controls', 
        totalUnselectedCount, 
        rowsPerPage, 
        currentPage, 
        (nuevaPagina) => {
            currentPage = nuevaPagina;
            renderTable();
        }
    );
}

function getUnpinnedRows() {
    return filteredData.filter(row => !selectedRowIds.has(row.id));
}

function obtenerUnidadesEnReparacion() {
    try {
        return JSON.parse(localStorage.getItem('rtp_unidades_en_reparacion')) || [];
    } catch(e) {
        return [];
    }
}

function marcarUnidadEnReparacion(economico) {
    let enReparacion = obtenerUnidadesEnReparacion();
    if (!enReparacion.includes(economico)) {
        enReparacion.push(economico);
        localStorage.setItem('rtp_unidades_en_reparacion', JSON.stringify(enReparacion));
    }
}

function obtenerIntervaloBaseYModelo(modelo) {
    if (!modelo) return { intervalo: 5000, tipo: 'volvo_sencillo' };
    const m = modelo.toLowerCase();
    if (m.includes('yutong')) return { intervalo: 15000, tipo: 'yutong' };
    if (m.includes('dina')) return { intervalo: 15000, tipo: 'dina' };
    if (m.includes('masa')) return { intervalo: 12000, tipo: 'masa' };
    if (m.includes('cosmopolitan')) return { intervalo: 10000, tipo: 'cosmopolitan' };
    return { intervalo: 5000, tipo: 'volvo_sencillo' };
}

function obtenerCombinacionServicios(kmAcum, modelo) {
    const k = Math.round(kmAcum);
    const { intervalo, tipo } = obtenerIntervaloBaseYModelo(modelo);
    
    if (tipo === 'yutong' || tipo === 'dina') {
        const ciclo = k % 480000;
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

data.forEach(item => {
    const estadoMant = calcularSemaforoMantenimiento(parseFloat(item.kmAcum) || 0, item.modelo);
    item.estadoMant = estadoMant;
    item.siguienteServicio = estadoMant.servicioTexto;
});

let filteredData = []; 

function normalizarTexto(texto) {
    if (!texto) return "";
    return texto.toString().toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function ordenarPorDefecto(arr) {
    return arr.sort((a, b) => {
        // 🟢 Las filas seleccionadas (ancladas) van primero
        const selA = selectedRowIds.has(a.id) ? 1 : 0;
        const selB = selectedRowIds.has(b.id) ? 1 : 0;
        if (selA !== selB) return selB - selA;

        const opA = a.estado === 'Operando' ? 1 : 0;
        const opB = b.estado === 'Operando' ? 1 : 0;
        if (opA !== opB) return opB - opA;

        const priA = a.estadoMant.prioridad;
        const priB = b.estadoMant.prioridad;
        if (priA !== priB) return priA - priB;

        const lenA = a.estadoMant.numLetras;
        const lenB = b.estadoMant.numLetras;
        return lenB - lenA;
    });
}

function renderTable() {
    const selectedModule = document.getElementById('module-filter-select').value;
    const emptyStateDiv = document.getElementById('odometro-empty-state');
    const noRecordsState = document.getElementById('odometro-no-records');
    const tableWrapper = document.getElementById('table-wrapper-container');
    const paginationWrapper = document.getElementById('pagination-wrapper-container');

    if (!selectedModule) {
        if (emptyStateDiv) emptyStateDiv.hidden = false;
        if (noRecordsState) noRecordsState.hidden = true;
        if (tableWrapper) tableWrapper.style.display = 'none';
        if (paginationWrapper) paginationWrapper.style.display = 'none';
        if (typeof setTableModuleActive === 'function') setTableModuleActive(false);
        actualizarEstadoFAB();
        return;
    }

    if (emptyStateDiv) emptyStateDiv.hidden = true;
    if (!filteredData.length) {
        if (noRecordsState) noRecordsState.hidden = false;
        if (tableWrapper) tableWrapper.style.display = 'none';
        if (paginationWrapper) paginationWrapper.style.display = 'none';
        if (typeof setTableModuleActive === 'function') setTableModuleActive(false);
        actualizarEstadoFAB();
        return;
    }

    if (noRecordsState) noRecordsState.hidden = true;
    if (tableWrapper) tableWrapper.style.display = 'block';
    if (paginationWrapper) paginationWrapper.style.display = 'flex';
    if (typeof setTableModuleActive === 'function') setTableModuleActive(true);

    tableBody.innerHTML = '';
    
    const colAcciones = document.getElementById('col-acciones');
    const thAcciones = document.getElementById('th-acciones');
    const thFilterAcciones = document.getElementById('th-filter-acciones');
    if (colAcciones) colAcciones.style.display = isEditingMode ? 'table-column' : 'none';
    if (thAcciones) thAcciones.style.display = isEditingMode ? 'table-cell' : 'none';
    if (thFilterAcciones) thFilterAcciones.style.display = isEditingMode ? 'table-cell' : 'none';

    const pinnedRows = filteredData.filter(row => selectedRowIds.has(row.id));
    const unpinnedRows = getUnpinnedRows();
    const totalPages = Math.max(1, Math.ceil(unpinnedRows.length / rowsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const rowsToRender = [
        ...pinnedRows,
        ...unpinnedRows.slice(startIndex, endIndex)
    ];

    let unpinnedRowIndex = 0;
    rowsToRender.forEach((row) => {
        const isSelected = selectedRowIds.has(row.id);
        const isExpanded = expandedRowIds.has(row.id);
        const colorClass = row.estadoMant.color; 
        
        const tr = document.createElement('tr');
        tr.className = `row-semaforo-${colorClass}${isSelected ? ' row-pinned-top' : ''}`;
        tr.setAttribute('data-id', row.id);

        const numeroConteo = isSelected ? '📌' : (startIndex + unpinnedRowIndex++ + 1);

        // 🟢 Determinar si es Metrobús o RTP basado en el modelo
        const modeloStr = (row.modelo || '').toLowerCase();
        const esMetrobus = modeloStr.includes('metrobús') || modeloStr.includes('metrobus');
        const logoSrc = esMetrobus ? '/static/img/servicio/metrobus.png' : '/static/img/servicio/rtp.png';
        const logoAlt = esMetrobus ? 'Metrobús' : 'RTP';

        let logoCell = `<td style="text-align: center; vertical-align: middle;"><img src="${logoSrc}" alt="${logoAlt}" style="width: 28px; height: 28px; object-fit: contain;" title="${logoAlt}"></td>`;
        let detailsCell = `<td style="text-align: center; vertical-align: middle;"><button type="button" class="btn-show-more" onclick="event.stopPropagation(); toggleRowExpansion(${row.id})" title="${isExpanded ? 'Ocultar detalles' : 'Mostrar más información'}" aria-label="${isExpanded ? 'Ocultar detalles' : 'Mostrar más información'}" aria-expanded="${isExpanded}">${isExpanded ? '⌃' : '⌄'}</button></td>`;
        const pdfGsp = obtenerPdfGspPorModelo(row.modelo);

        let actionCell = isEditingMode ? `<td style="text-align: center;"><button class="btn-delete-row" onclick="event.stopPropagation(); confirmarEliminarFila(${row.id}, '${row.economico}')" title="Eliminar Fila">🗑️</button></td>` : '';
        let actionOrdenCell = `<td style="text-align: center;"><a href="/orden-reparacion?economico=${row.economico}&modulo=${row.modulo}&servicio=${encodeURIComponent(row.siguienteServicio)}&modelo=${encodeURIComponent(row.modelo)}&color=${row.estadoMant.color}&fecha_odo=${encodeURIComponent(row.fechaActual)}&km_odo=${encodeURIComponent(row.kmActual)}&fecha_mant=${encodeURIComponent(row.fechaMant)}&km_mant=${encodeURIComponent(row.kmMant)}&km_acum=${encodeURIComponent(row.kmAcum)}&dias=${encodeURIComponent(row.dias)}" onclick="event.stopPropagation(); marcanUnidadYRefrescar('${row.economico}')" class="btn-action-doc" title="Generar Orden de Reparación">📄 Orden</a></td>`;

        tr.style.cursor = 'pointer';
        
        tr.onclick = (e) => {
            const td = e.target.closest('td');
            if (!td) return;
            const cellIndex = td.cellIndex;

            if (cellIndex === 0) {
                toggleRowSelection(row.id, e);
                return;
            }

            if (cellIndex >= 10) return; // Evitar disparar en botones finales
            if (e.target.closest('a') || e.target.closest('button')) return;
            if (e.target.tagName === 'INPUT') return;
            if (e.target.tagName === 'SELECT' && !e.target.disabled) return;
            
            toggleRowExpansion(row.id);
        };

        tr.innerHTML = `
            <td style="text-align: center; vertical-align: middle; cursor: pointer;" onclick="toggleRowSelection(${row.id}, event)">
                <input type="checkbox" class="comparison-checkbox" ${isSelected ? 'checked' : ''} style="cursor: pointer; pointer-events: none;" title="Anclar unidad arriba">
            </td>
            <td style="text-align: center; font-weight: bold; font-size: 0.8rem; color: var(--text-muted);">${numeroConteo}</td>
            ${logoCell}
            <td class="odometro-centered-cell"><input type="text" class="excel-input" value="${row.economico}" ${!isEditingMode ? 'readonly' : ''} data-key="economico" data-id="${row.id}"></td>
            <td><input type="text" class="excel-input" value="${row.modelo}" ${!isEditingMode ? 'readonly' : ''} data-key="modelo" data-id="${row.id}" style="font-size: 0.75rem; text-align: left; padding-left: 6px;"></td>
            
            <td class="odometro-centered-cell"><input type="date" class="excel-input" value="${row.fechaMant}" ${!isEditingMode ? 'readonly' : ''} data-key="fechaMant" data-id="${row.id}"></td>
            <td class="odometro-centered-cell"><input type="number" step="0.1" class="excel-input" value="${row.kmMant || '0.0'}" ${!isEditingMode ? 'readonly' : ''} data-key="kmMant" data-id="${row.id}"></td>
            
            <td class="odometro-centered-cell"><input type="number" step="0.1" class="excel-input" value="${row.kmActual}" ${!isEditingMode ? 'readonly' : ''} data-key="kmActual" data-id="${row.id}"></td>
            <td class="odometro-centered-cell"><input type="number" step="0.1" class="excel-input" value="${row.kmAcum}" ${!isEditingMode ? 'readonly' : ''} data-key="kmAcum" data-id="${row.id}" title="Próx. Meta: ${row.estadoMant.metaKm} Km"></td>
            
            <td style="text-align: center; vertical-align: middle;">
                <span class="semaforo-badge-cell ${colorClass}">● ${row.estadoMant.texto}</span>
            </td>

            ${actionOrdenCell}
            ${detailsCell}
            ${actionCell}
        `;
        tableBody.appendChild(tr);

        // 🟢 Sub-fila extendida con colspan 12
        if (isExpanded) {
            const extraTr = document.createElement('tr');
            extraTr.className = `row-subtable-extra row-semaforo-${colorClass}${isSelected ? ' row-pinned-extra' : ''}`;
            
            extraTr.innerHTML = `
                <td colspan="12" class="subcell-extra" style="padding: 8px 15px;">
                    <div style="display: flex; justify-content: space-around; align-items: center; width: 100%; font-size: 0.85rem; text-align: center;">
                        <div>
                            <span class="subcell-label">Alta</span>
                            <span class="subcell-val">${row.fecha_alta || 'N/A'}</span>
                        </div>
                        <div>
                            <span class="subcell-label">Fecha Odómetro</span>
                            <span class="subcell-val">${row.fechaActual || 'N/A'}</span>
                        </div>
                        <div>
                            <span class="subcell-label">Días Transcurridos</span>
                            <span class="subcell-val">${row.dias || '0'} d</span>
                        </div>
                        <div>
                            <span class="subcell-label">Servicios Efectuados</span>
                            <span class="subcell-val">${row.servicios || 'Ninguno'}</span>
                        </div>
                        <div>
                            <span class="subcell-label" style="margin-bottom: 2px;">Estado de Unidad</span>
                            <select class="excel-input ${row.estado === 'Detenida' ? 'status-detenida' : 'status-operando'}" ${!isEditingMode ? 'disabled' : ''} data-key="estado" data-id="${row.id}" onchange="updateStatusColor(this)" style="font-weight: bold; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">
                                <option value="Operando" ${row.estado === 'Operando' ? 'selected' : ''}>🟢 Operando</option>
                                <option value="Detenida" ${row.estado === 'Detenida' ? 'selected' : ''}>🔴 Detenida</option>
                            </select>
                        </div>
                        <div>
                            <a href="/assets/pdfs_gsp/${encodeURIComponent(pdfGsp)}" target="_blank" rel="noopener noreferrer" class="btn-action-doc" title="Abrir Guía de Servicio Preventivo en PDF" style="padding: 4px 10px; font-size: 0.8rem;">📊 GSP</a>
                        </div>
                    </div>
                </td>
            `;
            tableBody.appendChild(extraTr);
        }
    });
    
    updatePinnedRowOffsets();
    setupRowEditTracking();
    renderPagination(unpinnedRows.length);
    const firstDataRow = tableBody.querySelector('tr:not(.row-subtable-extra):not(.table-end-filler)');
    updateTableEndFiller(
        document.getElementById('table-wrapper-container'),
        document.getElementById('odometro-table'),
        firstDataRow?.cells.length
    );
    actualizarEstadoFAB();
}

function updatePinnedRowOffsets() {
    const header = document.querySelector('#odometro-table thead');
    let stickyTop = header ? header.getBoundingClientRect().height : 0;

    tableBody.querySelectorAll('.row-pinned-top, .row-pinned-extra').forEach(row => {
        row.style.setProperty('--pinned-top', `${stickyTop}px`);
        stickyTop += row.getBoundingClientRect().height;
    });
}

function confirmarEliminarFila(id, economico) {
    if (!isEditingMode) return;
    showToast(
        `⚠️ 🗑️ ¿Estás seguro de eliminar el económico <b>${economico}</b>?<br><span style="color:#ef4444; font-weight:bold;">¡Esta acción es irreversible!</span>`,
        'error', 0,
        [
            { text: '❌ Tache', class: 'btn-secondary', callback: (close) => close() },
            {
                text: '✅ Palomita', class: 'btn-primary',
                callback: (close) => {
                    data = data.filter(d => d.id !== id);
                    selectedRowIds.delete(id);
                    expandedRowIds.delete(id);
                    filterTable();
                    close();
                    showToast(`🗑️ ✅ Económico ${economico} eliminado correctamente.`, 'success', 4000);
                }
            }
        ], true
    );
}

function setupRowEditTracking() {
    if (!isEditingMode) return;
    const inputs = tableBody.querySelectorAll('.excel-input, select.excel-input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            const tr = this.closest('tr');
            const rowId = parseInt(tr.getAttribute('data-id'));
            if (filaEnEdicionId && filaEnEdicionId !== rowId) verificarYConfirmarCambiosFila();
            if (!filaEnEdicionId || filaEnEdicionId !== rowId) {
                filaEnEdicionId = rowId;
                const item = data.find(d => d.id === rowId);
                if (item) {
                    filaEnEdicionOriginal = { ...item };
                    cambiosPendientesFila = {};
                }
            }
        });
        input.addEventListener('input', function() {
            const key = this.getAttribute('data-key');
            const val = this.value;
            if (filaEnEdicionOriginal && filaEnEdicionOriginal[key] !== val) {
                cambiosPendientesFila[key] = val;
                hasUnsavedChanges = true;
            } else {
                delete cambiosPendientesFila[key];
                if (Object.keys(cambiosPendientesFila).length === 0) hasUnsavedChanges = false;
            }
        });
    });
}

function verificarYConfirmarCambiosFila() {
    if (!filaEnEdicionId || Object.keys(cambiosPendientesFila).length === 0) {
        filaEnEdicionId = null; filaEnEdicionOriginal = null; cambiosPendientesFila = {};
        return;
    }
    const rowId = filaEnEdicionId;
    const item = data.find(d => d.id === rowId);
    const eco = item ? item.economico : 'N/A';
    
    let listaModificatorios = Object.keys(cambiosPendientesFila).map(k => `• <b>${k}</b>: de "${filaEnEdicionOriginal[k]}" a "${cambiosPendientesFila[k]}"`).join('<br>');

    showToast(
        `⚡ ✏️ ¿Modificar campos de la unidad <b>${eco}</b>?<br><div style="margin: 8px 0; font-size: 0.85rem; max-height: 100px; overflow-y: auto;">${listaModificatorios}</div>`,
        'warning', 0,
        [
            {
                text: '🔄 Restaurar', class: 'btn-secondary',
                callback: (close) => {
                    Object.keys(cambiosPendientesFila).forEach(k => { item[k] = filaEnEdicionOriginal[k]; });
                    cambiosPendientesFila = {}; hasUnsavedChanges = false; filaEnEdicionId = null; filaEnEdicionOriginal = null;
                    renderTable(); close(); showToast('ℹ️ 🔄 Datos restaurados.', 'info', 3000);
                }
            },
            {
                text: '❌ Cancelar', class: 'btn-secondary',
                callback: (close) => {
                    cambiosPendientesFila = {}; filaEnEdicionId = null; filaEnEdicionOriginal = null;
                    close(); showToast('ℹ️ ⚠️ Cambios retenidos.', 'info', 3000);
                }
            },
            {
                text: '✅ Aceptar', class: 'btn-primary',
                callback: (close) => {
                    Object.keys(cambiosPendientesFila).forEach(k => { item[k] = cambiosPendientesFila[k]; });
                    if (cambiosPendientesFila['kmAcum'] !== undefined || cambiosPendientesFila['modelo'] !== undefined) {
                        item.estadoMant = calcularSemaforoMantenimiento(parseFloat(item.kmAcum) || 0, item.modelo);
                        item.siguienteServicio = item.estadoMant.servicioTexto;
                    }
                    cambiosPendientesFila = {}; hasUnsavedChanges = false; filaEnEdicionId = null; filaEnEdicionOriginal = null;
                    renderTable(); close(); showToast('✅ 💾 Cambios guardados correctamente.', 'success', 3000);
                }
            }
        ], true
    );
}

window.addEventListener('beforeunload', function (e) {
    if (hasUnsavedChanges || Object.keys(cambiosPendientesFila).length > 0) {
        e.preventDefault(); e.returnValue = '';
    }
});

function marcanUnidadYRefrescar(economico) {
    marcanUnidadEnReparacion(economico);
}

function toggleEditMode() {
    if (!isAdmin) { alert("Acceso denegado."); return; }
    isEditingMode = !isEditingMode;
    const btn = document.getElementById('btn-toggle-edit');
    const tools = document.getElementById('admin-tools');
    
    if (isEditingMode) {
        btn.className = 'btn-toggle-mode editable';
        btn.innerHTML = '✏️ Modo Edición';
        tools.style.display = 'flex'; 
        showToast("🟢 ✏️ Se ha activado el <strong>Modo Edición</strong>. Ahora puedes modificar celdas y agregar filas.", "success", 4000);
    } else {
        btn.className = 'btn-toggle-mode readonly';
        btn.innerHTML = '👁️ Modo Consulta';
        tools.style.display = 'none'; 
        showToast("🔵 👁️ Se ha cambiado al <strong>Modo Consulta</strong> (Solo lectura).", "info", 4000);
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
        id: newId, modulo: selMod, economico: '', modelo: modeloDefault, fecha_alta: '2026-01-01', fechaActual: '2026-08-01', kmActual: '0', fechaMant: '2026-01-01', kmMant: '0', kmAcum: '0', dias: '0', orden: '10000', servicios: '0', estado: 'Operando', siguienteServicio: estadoMant.servicioTexto, estadoMant: estadoMant, enReparacion: false 
    };
    data.unshift(newRow);
    filterTable(); 
    showToast("🟢 ➕ Fila nueva añadida correctamente.", "success", 4000);
}

function filterTable(resetPage = true) {
    const selectedModule = document.getElementById('module-filter-select').value;
    const globalQuery = normalizarTexto(document.getElementById("search-input").value);
    const unidadesEnReparacion = obtenerUnidadesEnReparacion();
    
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
        if (unidadesEnReparacion.includes(row.economico)) return false;

        const matchesModule = row.modulo === selectedModule;
        const rowText = normalizarTexto(Object.values(row).join(' '));
        const matchesGlobal = rowText.includes(globalQuery);

        let matchesColumns = true;
        for (const col in columnFilters) {
            let cellValue = col === 'siguienteServicio' ? normalizarTexto(row.estadoMant.texto) : normalizarTexto(row[col]);
            if (!cellValue.includes(columnFilters[col])) {
                matchesColumns = false;
                break;
            }
        }

        return matchesModule && matchesGlobal && matchesColumns;
    });

    ordenarPorDefecto(filteredData);
    if (resetPage) currentPage = 1;
    renderTable();
}

let sortAsc = false;
function sortTable(key) {
    sortAsc = !sortAsc;
    filteredData.sort((a, b) => {
        const selA = selectedRowIds.has(a.id) ? 1 : 0;
        const selB = selectedRowIds.has(b.id) ? 1 : 0;
        if (selA !== selB) return selB - selA;

        if (key === 'siguienteServicio') {
            const priA = a.estadoMant.prioridad;
            const priB = b.estadoMant.prioridad;
            if (priA !== priB) return sortAsc ? priA - priB : priB - priA;
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

document.addEventListener('DOMContentLoaded', () => {
    const selectModule = document.getElementById('module-filter-select');
    
    if (userAssignedModule && userAssignedModule !== '' && userAssignedModule !== 'central') {
        selectModule.value = userAssignedModule.padStart(2, '0');
        selectModule.disabled = true;
    } else if (userAssignedModule === 'central') {
        const savedModule = localStorage.getItem('rtp_selected_modulo');
        if (savedModule) selectModule.value = savedModule;
    } else {
        selectModule.value = "";
        selectModule.disabled = true;
    }
    
    filterTable();
});

function exportToExcel() {
    const selectedModule = document.getElementById('module-filter-select').value;
    if (!selectedModule) { showToast("⚠️ ❌ Seleccione un Módulo.", "error", 3000); return; }
    showToast(`📊 📥 Exportando Excel del Módulo ${selectedModule}...`, "info", 4000);

    const exportData = filteredData.map((row, index) => ({
        "No.": index + 1, "Económico": row.economico, "Modelo": row.modelo, "Últ. Mant. Fecha": row.fechaMant, "Últ. Mant. Km": row.kmMant || '0', "Km Odómetro": row.kmActual, "Km Acumulado": row.kmAcum, "Estado Mant.": row.siguienteServicio, "Estado": row.estado
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Odómetro");
    XLSX.writeFile(wb, `Reporte_Odometro_Modulo_${selectedModule}.xlsx`);
}

function exportToPDF() {
    const selectedModule = document.getElementById('module-filter-select').value;
    if (!selectedModule) { showToast("⚠️ ❌ Seleccione un Módulo.", "error", 3000); return; }
    showToast(`📄 🖨️ Generando PDF del Módulo ${selectedModule}...`, "info", 4000);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape'); 
    const logo = new Image();
    logo.src = '/static/img/logos/logo-rtp.png';
    
    logo.onload = function() { generarPDF(logo); };
    logo.onerror = function() { generarPDF(null); };

    function generarPDF(logoImg) {
        const pageWidth = doc.internal.pageSize.getWidth();
        if (logoImg) doc.addImage(logoImg, 'PNG', 14, 10, 35, 20);
        
        doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(0, 147, 69);
        doc.text("RED DE TRANSPORTE DE PASAJEROS (RTP)", pageWidth / 2, 16, { align: "center" });
        doc.setFontSize(12); doc.setTextColor(50, 50, 50);
        doc.text("MÓDULO: " + selectedModule, pageWidth / 2, 24, { align: "center" });

        const bodyData = filteredData.map((row, index) => [
            (index + 1).toString(), row.economico, row.modelo, row.fechaMant, row.kmMant || '0', row.kmActual, row.kmAcum, row.siguienteServicio, row.estado
        ]);

        doc.autoTable({
            startY: 35,
            head: [['#', 'Económico', 'Modelo / Unidad', 'Últ. Mant. Fecha', 'Últ. Mant. Km', 'Km Odómetro', 'Km Acum.', 'Estado Mantenimiento', 'Estado']],
            body: bodyData,
            theme: 'grid',
            headStyles: { fillColor: [0, 147, 69], textColor: [255, 255, 255], halign: 'center' },
            bodyStyles: { fontSize: 8, halign: 'center' },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        const blob = doc.output('blob');
        window.open(URL.createObjectURL(blob), '_blank');
    }
}

function abrirReportes() {
    const selectedModule = document.getElementById('module-filter-select').value;
    if (!selectedModule) {
        showToast("⚠️ ❌ Seleccione un Módulo primero para ver sus reportes.", "error", 3000);
        return;
    }
    showToast(`📈 📊 Abriendo módulo de reportes para el Módulo ${selectedModule}...`, "info", 3000);
    // Aquí puedes redirigir o abrir el modal de reportes, ej.:
    // window.location.href = `/reportes-odometro?modulo=${selectedModule}`;
}