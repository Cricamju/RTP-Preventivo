/* /static/js/components/pagination-fab.js */

function renderPaginationFAB(containerId, totalItems, rowsPerPage, currentPage, onPageChange) {
    const container = document.getElementById(containerId);
    const wrapper = container?.closest('.pagination-wrapper');
    if (!container || !wrapper) return;

    container.innerHTML = '';
    wrapper.classList.remove('module-pagination-hidden');
    const totalPages = Math.ceil(totalItems / rowsPerPage);

    if (totalPages <= 1) {
        wrapper.classList.remove('fab-visible');
        wrapper.classList.add('module-pagination-hidden');
        return;
    }

    // 🟢 Muestra el contenedor flotante de paginación con sus números
    wrapper.classList.add('fab-visible');

    // Botón Anterior
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn';
        prevBtn.innerHTML = '◀';
        prevBtn.onclick = () => onPageChange(currentPage - 1);
        container.appendChild(prevBtn);
    }

    // Generar números de página
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.innerText = i;
        pageBtn.onclick = () => onPageChange(i);
        container.appendChild(pageBtn);
    }

    // Botón Siguiente
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn';
        nextBtn.innerHTML = '▶';
        nextBtn.onclick = () => onPageChange(currentPage + 1);
        container.appendChild(nextBtn);
    }
}

function updateTableEndFiller(wrapper, table, columnCount) {
    const tbody = table?.tBodies[0];
    if (!wrapper || !table || !tbody) return;

    tbody.querySelector('.table-end-filler')?.remove();
    const rows = Array.from(tbody.rows);
    if (!rows.length || getComputedStyle(wrapper).display === 'none') return;

    requestAnimationFrame(() => {
        if (!wrapper.isConnected || getComputedStyle(wrapper).display === 'none') return;

        const bodyRows = Array.from(tbody.rows).filter(row => !row.classList.contains('table-end-filler'));
        const contentHeight = bodyRows.reduce((height, row) => height + row.getBoundingClientRect().height, 0);
        const headerHeight = table.tHead?.getBoundingClientRect().height || 0;
        const availableHeight = wrapper.clientHeight - headerHeight - contentHeight;
        if (availableHeight < 48) return;

        const filler = document.createElement('tr');
        filler.className = 'table-end-filler';
        filler.setAttribute('aria-label', 'Fin de los registros');
        const visibleColumns = columnCount
            || table.querySelectorAll('colgroup col').length
            || bodyRows[0]?.querySelectorAll('td').length
            || table.tHead?.rows[0]?.cells.length
            || 1;
        filler.innerHTML = `<td colspan="${visibleColumns}"><span class="table-end-filler-label"><span class="table-end-filler-icon" aria-hidden="true">🏁</span><span>Fin de los registros</span></span></td>`;
        filler.firstElementChild.style.height = `${availableHeight}px`;
        tbody.appendChild(filler);

        if (document.body.classList.contains('table-module-active')
            && !document.body.classList.contains('show-footer')) {
            document.body.classList.add('show-footer');
            requestAnimationFrame(() => {
                if (filler.isConnected && document.body.classList.contains('table-module-active')) {
                    updateTableEndFiller(wrapper, table, columnCount);
                }
            });
        }
    });
}

function getTableModuleWrapper() {
    return document.querySelector('.master-table-wrapper')
        || document.getElementById('table-wrapper-container');
}

function setTableModuleActive(isActive) {
    document.body.classList.toggle('table-module-active', isActive);
    if (!isActive) {
        document.body.classList.remove('show-footer');
    }

    document.querySelectorAll('.pagination-wrapper').forEach(wrapper => {
        wrapper.classList.toggle('module-pagination-hidden', !isActive);
        if (!isActive) wrapper.classList.remove('fab-visible');
    });

    if (isActive) {
        requestAnimationFrame(() => {
            const tableWrapper = getTableModuleWrapper();
            if (!document.body.classList.contains('table-module-active') || !tableWrapper) return;
            const table = tableWrapper.querySelector('table');
            if (table) {
                const tbody = table.tBodies[0];
                const rows = tbody?.querySelectorAll('tr:not(.table-end-filler)').length || 0;
                if (!rows) return;
                if (tbody.querySelector('.table-end-filler')) {
                    if (!document.body.classList.contains('show-footer')) {
                        document.body.classList.add('show-footer');
                        updateTableEndFiller(tableWrapper, table);
                    }
                    return;
                }
            }
            requestAnimationFrame(() => {
                if (!document.body.classList.contains('table-module-active')) return;
                const canScroll = tableWrapper.scrollHeight > tableWrapper.clientHeight + 2;
                document.body.classList.toggle('show-footer', !canScroll);
            });
        });
    }
}

// 🟢 Control Dinámico del Scroll (umbral de 125px)
let lastScrollTop = 0;
const scrollThreshold = 125; // 125px de diferencia

document.addEventListener('DOMContentLoaded', () => {
    const tableWrapper = getTableModuleWrapper();
    const fabBar = document.querySelector('.rtp-fab-container');
    const paginationWrapper = document.querySelector('.pagination-wrapper');
    const emptyState = document.querySelector('.module-empty-card');
    const wrapperIsVisible = tableWrapper && getComputedStyle(tableWrapper).display !== 'none';
    setTableModuleActive(Boolean(wrapperIsVisible && (!emptyState || emptyState.hidden)));

    if (tableWrapper) {
        if (document.querySelector('.odometro-card')) {
            document.body.classList.add('odometro-view');
        }
        let previousScrollTop = tableWrapper.scrollTop;

        tableWrapper.addEventListener('scroll', () => {
            const currentScroll = tableWrapper.scrollTop;
            const isAtBottom = currentScroll + tableWrapper.clientHeight >= tableWrapper.scrollHeight - 2;
            const isScrollingDown = currentScroll > previousScrollTop + 1;
            const isScrollingUp = currentScroll < previousScrollTop - 1;
            const hasEndFiller = Boolean(tableWrapper.querySelector('.table-end-filler'));
            previousScrollTop = currentScroll;

            if (hasEndFiller && !document.body.classList.contains('show-footer')) {
                document.body.classList.add('show-footer');
                const table = tableWrapper.querySelector('table');
                if (table) updateTableEndFiller(tableWrapper, table);
            } else if (isAtBottom && isScrollingDown && !document.body.classList.contains('show-footer')) {
                document.body.classList.add('show-footer');
                requestAnimationFrame(() => {
                    if (!tableWrapper.isConnected || !document.body.classList.contains('show-footer')) return;
                    tableWrapper.scrollTop = tableWrapper.scrollHeight - tableWrapper.clientHeight;
                    previousScrollTop = tableWrapper.scrollTop;
                    lastScrollTop = tableWrapper.scrollTop;
                });
            } else if (!hasEndFiller && isScrollingUp && document.body.classList.contains('show-footer')) {
                document.body.classList.remove('show-footer');
            }

            if (Math.abs(currentScroll - lastScrollTop) > scrollThreshold) {
                if (currentScroll > lastScrollTop && currentScroll > 50) {
                    // Scroll hacia abajo -> Ocultar paginación y FABs
                    if (fabBar) fabBar.classList.add('fab-hidden');
                    if (paginationWrapper) paginationWrapper.classList.remove('fab-visible');
                } else {
                    // Scroll hacia arriba -> Mostrar paginación y FABs
                    if (fabBar) fabBar.classList.remove('fab-hidden');
                    if (paginationWrapper && paginationWrapper.querySelector('.page-btn')) {
                        paginationWrapper.classList.add('fab-visible');
                    }
                }
                lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
            }

            if (isAtBottom && paginationWrapper && paginationWrapper.querySelector('.page-btn')) {
                paginationWrapper.classList.add('fab-visible');
            }
        }, { passive: true });
    }
});