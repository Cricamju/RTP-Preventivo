<?php

function rtpListRepairOrders(): array
{
    // Temporary fixture; replace this session-backed store with the RTP database repository.
    if (!isset($_SESSION['lista_ordenes_reparacion'])) {
        $_SESSION['lista_ordenes_reparacion'] = [[
            'economico' => '6002',
            'modulo' => '03',
            'modelo' => 'Volvo Caio Access 2020',
            'tipo_servicio' => 'A (5000 +- 500)',
            'color' => 'verde',
            'fecha_alta' => '2026-10-26',
            'no_orden' => '585',
            'fecha_odo' => '27-10-2026',
            'km_odo' => '429,358.4',
            'fecha_mant' => '24-09-2020',
            'km_mant' => '345,254.0',
            'km_acum' => '20,104.4',
            'dias' => '106',
        ]];
    }

    return array_values($_SESSION['lista_ordenes_reparacion'] ?? []);
}

function rtpSaveRepairOrder(array $order): void
{
    $orders = rtpListRepairOrders();
    $orderModule = rtpNormalizeModuleId($order['modulo'] ?? '');

    foreach ($orders as $index => $existingOrder) {
        if (($existingOrder['economico'] ?? null) === ($order['economico'] ?? null)
            && rtpNormalizeModuleId($existingOrder['modulo'] ?? '') === $orderModule) {
            $order['no_orden'] = $existingOrder['no_orden'] ?? $order['no_orden'] ?? null;
            $orders[$index] = $order;
            $_SESSION['lista_ordenes_reparacion'] = array_values($orders);
            return;
        }
    }

    array_unshift($orders, $order);
    $_SESSION['lista_ordenes_reparacion'] = $orders;
}

function rtpDeleteRepairOrder(string $economico, string $modulo): void
{
    $moduleId = rtpNormalizeModuleId($modulo);
    $orders = rtpListRepairOrders();
    $_SESSION['lista_ordenes_reparacion'] = array_values(array_filter(
        $orders,
        static function ($order) use ($economico, $moduleId) {
            return ($order['economico'] ?? null) !== $economico
                || rtpNormalizeModuleId($order['modulo'] ?? '') !== $moduleId;
        }
    ));
}
