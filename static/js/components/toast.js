// static/js/components/toast.js
function showToast(message, type = 'success', duration = 4500, actions = null, persistent = false) {
    const container = document.getElementById('toast-container');
    if (!container && !persistent) return;

    if (!persistent && document.body.classList.contains('odometro-view')) {
        const tableCard = document.querySelector('.odometro-card');
        if (tableCard) {
            const rect = tableCard.getBoundingClientRect();
            const toastWidth = Math.max(0, Math.min(450, rect.width - 24));
            const moduleHeader = document.getElementById('sticky-panel');
            const headerBottom = moduleHeader ? moduleHeader.getBoundingClientRect().bottom : 0;
            const configuredOffset = parseFloat(
                getComputedStyle(document.body).getPropertyValue('--odometro-toast-offset-y')
            );
            const offset = Number.isFinite(configuredOffset) ? configuredOffset : 12;
            const top = Math.max(rect.top + offset, headerBottom + offset);
            const right = Math.max(12, window.innerWidth - rect.right + 12);
            container.style.top = `${top}px`;
            container.style.left = 'auto';
            container.style.right = `${right}px`;
            container.style.width = `${toastWidth}px`;
            container.style.transform = 'none';
        }
    }

    let backdrop = null;
    if (persistent) {
        // 🟢 Bloquear interacción global con el topbar, sidebar y sticky header
        document.body.classList.add('modal-blocking-active');

        backdrop = document.createElement('div');
        backdrop.className = 'toast-backdrop-modal';
        // 🟢 Backdrop ajustado: Respeta el topbar (150px)
        backdrop.style.cssText = 'position:fixed; top:150px; left:70px; width:calc(100vw - 70px); height:calc(100vh - 150px); background:rgba(0,0,0,0.55); z-index:4999; backdrop-filter:blur(3px);';
        document.body.appendChild(backdrop);
    }

    const toastBox = document.createElement('div');
    toastBox.className = `toast-box ${type} ${persistent ? 'persistent-toast' : ''}`;

    if (persistent) {
        // 🟢 Posicionamiento fijo independiente para la alerta persistente (dentro del área con blur)
        toastBox.style.position = 'fixed';
        toastBox.style.top = '180px';
        toastBox.style.right = '30px';
        toastBox.style.zIndex = '5000';
    }

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';
    if (type === 'warning') icon = '⚡';

    let cleanMessage = message;
    const emojiRegex = /^([\p{Extended_Pictographic}\u2600-\u27BF])\s*/u;
    const match = message.match(emojiRegex);
    if (match) {
        icon = match[1];
        cleanMessage = message.replace(emojiRegex, '');
    }

    let actionsHtml = '';
    if (actions && Array.isArray(actions)) {
        actionsHtml = `<div class="toast-actions" style="margin-top: 12px; display: flex; gap: 8px; justify-content: flex-end;">`;
        actions.forEach((act, idx) => {
            actionsHtml += `<button type="button" class="toast-btn-action ${act.class || ''}" data-index="${idx}" style="padding: 6px 14px; border-radius: 6px; border: none; cursor: pointer; font-weight: bold; font-size: 0.85rem; transition: transform 0.1s;">${act.text}</button>`;
        });
        actionsHtml += `</div>`;
    }

    toastBox.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <div class="toast-content">
            <p>${cleanMessage}</p>
            ${actionsHtml}
        </div>
        ${!persistent ? '<button type="button" class="toast-close">&times;</button>' : ''}
    `;

    // 🟢 Si es persistente se añade directo al body con su posición fija; si no, al contenedor normal
    if (persistent) {
        document.body.appendChild(toastBox);
    } else {
        container.prepend(toastBox);
    }

    void toastBox.offsetWidth;
    toastBox.classList.add('show');

    const removeToast = () => {
        toastBox.classList.remove('show');
        if (backdrop) backdrop.remove();
        // 🟢 Restaurar la interacción al cerrar el modal
        document.body.classList.remove('modal-blocking-active');
        setTimeout(() => toastBox.remove(), 400);
    };

    if (actions && Array.isArray(actions)) {
        toastBox.querySelectorAll('.toast-btn-action').forEach(btn => {
            btn.onclick = (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                if (actions[idx].callback) {
                    actions[idx].callback(removeToast);
                } else {
                    removeToast();
                }
            };
        });
    }

    if (!persistent) {
        let hideTimeout = setTimeout(removeToast, duration);
        const closeBtn = toastBox.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                clearTimeout(hideTimeout);
                removeToast();
            };
        }
    }

    return removeToast;
}

document.addEventListener('DOMContentLoaded', () => {
    const flashes = document.querySelectorAll('.flask-flash');
    flashes.forEach((flash, index) => {
        let type = flash.getAttribute('data-category');
        let message = flash.getAttribute('data-message');
        
        if (type === 'message') type = 'info';
        if (type === 'danger') type = 'error';

        setTimeout(() => {
            showToast(message, type, 5000);
        }, 200 + (index * 400));
    });

    const userProfileBtn = document.getElementById('user-profile-btn');
    const toastContainer = document.getElementById('toast-container');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userProfileBtn && toastContainer) {
        userProfileBtn.addEventListener('click', () => {
            setTimeout(() => {
                if (userDropdown && userDropdown.classList.contains('show')) {
                    toastContainer.style.top = '180px';
                } else {
                    toastContainer.style.top = '115px';
                }
            }, 50);
        });

        document.addEventListener('click', (e) => {
            if (userDropdown && !userDropdown.contains(e.target) && !userProfileBtn.contains(e.target)) {
                toastContainer.style.top = '115px';
            }
        });
    }
});