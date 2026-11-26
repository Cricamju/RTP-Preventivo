<?php

function rtpNormalizeModuleId($module): ?string
{
    if (!is_string($module) && !is_int($module)) {
        return null;
    }

    $module = trim((string) $module);
    if (!preg_match('/^0?[1-7]$/', $module)) {
        return null;
    }

    return str_pad($module, 2, '0', STR_PAD_LEFT);
}

function rtpCanSelectAnyModule(): bool
{
    $role = strtolower(trim($_SESSION['rol'] ?? ''));
    $assignedModule = strtolower(trim($_SESSION['modulo_usuario'] ?? ''));

    return in_array($role, ['admin', 'administrador'], true)
        && $assignedModule === 'central';
}

function rtpUserCanAccessModule($module): bool
{
    $normalizedModule = rtpNormalizeModuleId($module);
    if ($normalizedModule === null) {
        return false;
    }

    if (rtpCanSelectAnyModule()) {
        return true;
    }

    $assignedModule = rtpNormalizeModuleId($_SESSION['modulo_usuario'] ?? '');
    return $assignedModule !== null && $normalizedModule === $assignedModule;
}

function rtpModuleContext(): array
{
    return [
        'assignedModule' => rtpNormalizeModuleId($_SESSION['modulo_usuario'] ?? ''),
        'canSelectAnyModule' => rtpCanSelectAnyModule(),
    ];
}
