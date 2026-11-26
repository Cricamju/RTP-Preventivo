<?php
// helpers/semaforo_helper.php

// Obtener intervalo base y reglas según el modelo de autobús
function obtenerIntervaloBaseYModeloPHP($modelo) {
    if (!$modelo) return ['intervalo' => 5000, 'tipo' => 'volvo_sencillo'];
    $m = strtolower($modelo);
    if (strpos($m, 'yutong') !== false) return ['intervalo' => 15000, 'tipo' => 'yutong'];
    if (strpos($m, 'dina') !== false) return ['intervalo' => 15000, 'tipo' => 'dina'];
    if (strpos($m, 'masa') !== false) return ['intervalo' => 12000, 'tipo' => 'masa'];
    if (strpos($m, 'cosmopolitan') !== false) return ['intervalo' => 10000, 'tipo' => 'cosmopolitan'];
    return ['intervalo' => 5000, 'tipo' => 'volvo_sencillo'];
}

// Obtener la combinación exacta de servicios según el kilometraje acumulado
function obtenerCombinacionServiciosPHP($kmAcum, $modelo) {
    $k = round(floatval($kmAcum));
    $info = obtenerIntervaloBaseYModeloPHP($modelo);
    $tipo = $info['tipo'];
    
    $letras = [];
    if ($tipo === 'yutong' || $tipo === 'dina') {
        $ciclo = $k % 480000;
        if ($ciclo === 0 && $k > 0) return ['letras' => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], 'proximoKm' => $k];
        
        if ($k % 15000 === 0) $letras[] = 'A';
        if ($k % 30000 === 0) $letras[] = 'B';
        if ($k % 45000 === 0) $letras[] = 'C';
        if ($k % 60000 === 0) $letras[] = 'D';
        if ($k % 90000 === 0) $letras[] = 'E';
        if ($k % 120000 === 0) $letras[] = 'F';
        if ($k % 240000 === 0) $letras[] = 'G';
        if ($k % 480000 === 0) $letras[] = 'H';
        
        if (empty($letras)) {
            $resto = $k % 15000;
            $letras[] = ($resto < 7500) ? 'A' : 'B';
        }
    } elseif ($tipo === 'masa') {
        if ($k % 12000 === 0) $letras[] = 'A';
        if ($k % 24000 === 0) $letras[] = 'B';
        if ($k % 36000 === 0) $letras[] = 'C';
        if ($k % 48000 === 0) $letras[] = 'D';
        if ($k % 60000 === 0) $letras[] = 'E';
        if ($k % 72000 === 0) $letras[] = 'F';
        if ($k % 96000 === 0) $letras[] = 'G';
        if ($k % 120000 === 0) $letras[] = 'H';
        if (empty($letras)) $letras[] = 'A';
    } elseif ($tipo === 'cosmopolitan') {
        if ($k % 10000 === 0) $letras[] = 'A';
        if ($k % 20000 === 0) $letras[] = 'B';
        if ($k % 30000 === 0) $letras[] = 'C';
        if ($k % 60000 === 0) $letras[] = 'D';
        if ($k % 90000 === 0) $letras[] = 'E';
        if ($k % 120000 === 0) $letras[] = 'F';
        if ($k % 240000 === 0) $letras[] = 'G';
        if ($k % 480000 === 0) $letras[] = 'H';
        if (empty($letras)) $letras[] = 'A';
    } else {
        if ($k % 5000 === 0) $letras[] = 'A';
        if ($k % 15000 === 0) $letras[] = 'B';
        if ($k % 20000 === 0) $letras[] = 'C';
        if ($k % 30000 === 0) $letras[] = 'D';
        if ($k % 45000 === 0) $letras[] = 'E';
        if ($k % 60000 === 0) $letras[] = 'F';
        if ($k % 120000 === 0) $letras[] = 'G';
        if ($k % 240000 === 0) $letras[] = 'H';
        if ($k % 480000 === 0) $letras[] = 'I';
        if (empty($letras)) $letras[] = 'A';
    }
    
    return [
        'letras' => $letras,
        'servicioTexto' => implode(' + ', $letras)
    ];
}

// Calcular el color del semáforo y la prioridad normativa oficial
function calcularSemaforoMantenimientoPHP($kmAcum, $modelo) {
    $k = floatval($kmAcum);
    $info = obtenerIntervaloBaseYModeloPHP($modelo);
    $intervalo = $info['intervalo'];
    
    $remainder = fmod($k, $intervalo);
    $nextMilestone = (floor($k / $intervalo) + 1) * $intervalo;
    $distToNext = $nextMilestone - $k;

    $servInfo = obtenerCombinacionServiciosPHP($nextMilestone, $modelo);
    $tipoServicioStr = $servInfo['servicioTexto'];

    $colorSemaforo = "verde"; 
    $etiquetaSemaforo = "Óptimo ($tipoServicioStr)";

    if ($distToNext <= 1000 && $distToNext >= 0) {
        $colorSemaforo = "amarillo";  
        $etiquetaSemaforo = "Próximo ($tipoServicioStr)";
    } elseif ($remainder > 0 && $remainder <= 3000) {
        $colorSemaforo = "rojo";      
        $etiquetaSemaforo = "Vencido ($tipoServicioStr)";
    } else {
        $colorSemaforo = "verde";     
        $etiquetaSemaforo = "Seguro ($tipoServicioStr)";
    }

    return [
        'color' => $colorSemaforo,
        'texto' => $etiquetaSemaforo,
        'servicioTexto' => $tipoServicioStr,
        'metaKm' => $nextMilestone 
    ];
}