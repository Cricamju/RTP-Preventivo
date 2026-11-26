/* static/js/components/sidebar.js */
const userProfileBtn = document.getElementById('user-profile-btn');
const userDropdown = document.getElementById('user-dropdown');

if (userProfileBtn && userDropdown) {
    userProfileBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        userDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (event) => {
        if (
            userDropdown.classList.contains('show') &&
            !userProfileBtn.contains(event.target) &&
            !userDropdown.contains(event.target)
        ) {
            userDropdown.classList.remove('show');
        }
    });
}

/* =========================================
   ACORDEÓN DE REPORTES EN SIDEBAR
   ========================================= */
const reportesGroup = document.getElementById('reportes-group');
const btnToggleReportes = document.getElementById('btn-toggle-reportes');

if (reportesGroup && btnToggleReportes) {
    btnToggleReportes.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const isOpen = reportesGroup.classList.toggle('open');
        btnToggleReportes.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', (event) => {
        if (
            window.innerWidth <= 768 &&
            reportesGroup.classList.contains('open') &&
            !reportesGroup.contains(event.target)
        ) {
            reportesGroup.classList.remove('open');
            btnToggleReportes.setAttribute('aria-expanded', 'false');
        }
    });
}

/* =========================================
   LÓGICA DE OCULTAMIENTO INTELIGENTE (MÓVIL)
   ========================================= */
const sidebar = document.getElementById('sidebar');

function handleMobileScroll() {
    if (!sidebar) return;

    if (window.innerWidth > 768) {
        sidebar.classList.remove('sidebar-hidden', 'sidebar-at-bottom');
        return;
    }

    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    if (scrollHeight <= clientHeight + 10) {
        sidebar.classList.remove('sidebar-hidden', 'sidebar-at-bottom');
        return;
    }

    const isAtBottom = Math.ceil(scrollTop + clientHeight) >= (scrollHeight - 20);
    const isAtTop = scrollTop <= 20;

    if (isAtBottom) {
        sidebar.classList.remove('sidebar-hidden');
        sidebar.classList.add('sidebar-at-bottom');
    } else if (isAtTop) {
        sidebar.classList.remove('sidebar-hidden');
        sidebar.classList.remove('sidebar-at-bottom');
    } else {
        sidebar.classList.add('sidebar-hidden');
        sidebar.classList.remove('sidebar-at-bottom');
        if (reportesGroup) {
            reportesGroup.classList.remove('open');
        }
    }
}

window.addEventListener('scroll', handleMobileScroll);
window.addEventListener('resize', handleMobileScroll);
document.addEventListener('DOMContentLoaded', handleMobileScroll);