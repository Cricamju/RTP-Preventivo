(() => {
    const context = window.RTP_MODULE_CONTEXT || {};
    const assignedModule = context.assignedModule || '';
    const canSelectAnyModule = context.canSelectAnyModule === true;
    const modulePattern = /^0?[1-7]$/;
    const normalizeModule = value => {
        const module = String(value || '').trim();
        return modulePattern.test(module) ? module.padStart(2, '0') : '';
    };

    document.querySelectorAll('[data-module-selector]').forEach(selector => {
        if (canSelectAnyModule) {
            const savedModule = normalizeModule(localStorage.getItem('rtp_selected_modulo'));
            if (savedModule && Array.from(selector.options).some(option => option.value === savedModule)) {
                selector.value = savedModule;
            }

            selector.addEventListener('change', () => {
                const selectedModule = normalizeModule(selector.value);
                if (selectedModule) {
                    localStorage.setItem('rtp_selected_modulo', selectedModule);
                }
            });
            return;
        }

        selector.disabled = true;
        selector.value = assignedModule && Array.from(selector.options)
            .some(option => option.value === assignedModule)
            ? assignedModule
            : '';
    });
})();
