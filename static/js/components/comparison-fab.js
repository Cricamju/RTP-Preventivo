/* Shared selection state and actions for table comparison controls. */

let selectedRowIds = new Set();
let expandedRowIds = new Set();
let selectionHistoryStack = [];

function toggleRowSelection(id, event) {
    if (event) event.stopPropagation();
    
    selectionHistoryStack.push(new Set(selectedRowIds));
    if (selectionHistoryStack.length > 20) selectionHistoryStack.shift();

    if (selectedRowIds.has(id)) {
        selectedRowIds.delete(id);
        expandedRowIds.delete(id);
    } else {
        selectedRowIds.add(id);
    }

    actualizarEstadoFAB();
    if (typeof filterTable === 'function') {
        filterTable(false);
    } else if (typeof renderTable === 'function') {
        renderTable();
    }
}

function toggleRowExpansion(id) {
    if (expandedRowIds.has(id)) {
        expandedRowIds.delete(id);
    } else {
        expandedRowIds.add(id);
    }
    if (typeof renderTable === 'function') renderTable();
}

function undoSelection() {
    if (selectionHistoryStack.length === 0) {
        if (typeof showToast === 'function') showToast("ℹ️ ⚠️ No hay acciones anteriores para deshacer.", "info", 3000);
        return;
    }
    selectedRowIds = selectionHistoryStack.pop();
    actualizarEstadoFAB();
    if (typeof filterTable === 'function') filterTable(false); else if (typeof renderTable === 'function') renderTable();
    if (typeof showToast === 'function') showToast("↩️ ✅ Selección deshecha con éxito.", "success", 3000);
}

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
        e.preventDefault();
        undoSelection();
    }
});

function collapseAllSelections() {
    if (expandedRowIds.size === 0) return;
    expandedRowIds.clear();
    if (typeof renderTable === 'function') renderTable();
    if (typeof showToast === 'function') showToast("📂 ℹ️ Todas las sub-filas fueron colapsadas.", "info", 3000);
}

function clearAllSelections() {
    selectionHistoryStack.push(new Set(selectedRowIds));
    selectedRowIds.clear();
    expandedRowIds.clear();
    actualizarEstadoFAB();
    if (typeof filterTable === 'function') filterTable(false); else if (typeof renderTable === 'function') renderTable();
    if (typeof showToast === 'function') showToast("🗑️ ✅ Selecciones y anclajes limpiados.", "success", 3000);
}

function actualizarEstadoFAB() {
    const fabBar = document.getElementById('comparison-fab-bar');
    if (!fabBar) return;

    const hasSelections = selectedRowIds.size > 0;
    const hasHistory = selectionHistoryStack.length > 0;

    if (hasSelections || hasHistory) {
        fabBar.style.display = 'flex';
        
        const undoBtn = fabBar.querySelector('.rtp-fab-btn.undo');
        const collapseBtn = fabBar.querySelector('.rtp-fab-btn.collapse');
        const clearBtn = fabBar.querySelector('.rtp-fab-btn.clear');

        if (undoBtn) undoBtn.style.display = hasHistory ? 'flex' : 'none';
        if (collapseBtn) collapseBtn.style.display = hasSelections ? 'flex' : 'none';
        if (clearBtn) clearBtn.style.display = hasSelections ? 'flex' : 'none';
    } else {
        fabBar.style.display = 'none';
    }
}