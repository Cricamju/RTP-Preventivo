<?php
// views/modulos/correctivo.php
?>
<!-- 🟢 TOPBAR: BUSCADOR DE CONSECUTIVO Y BOTÓN DE IMPRESIÓN -->
<div class="correctivo-sticky-header" id="sticky-panel">
    <div class="header-content-inline">
        <div class="inline-title">
            <h2>📋 Órdenes de Reparación</h2>
        </div>
        <div class="inline-search">
            <input type="number" id="input-consecutivo" placeholder="🔍 Ingresar Consecutivo (Ej: 13867)..." onkeypress="handleEnter(event)">
            <button class="btn-primary btn-search" onclick="buscarOrden()">Generar Vista</button>
        </div>
        <div class="inline-controls">
            <button class="btn-export pdf" onclick="imprimirOrden()" id="btn-print" disabled>📄 Imprimir Oficial</button>
        </div>
    </div>
</div>

<!-- 🟢 ÁREA DE VISTA PREVIA -->
<div class="management-card correctivo-card">
    <div class="document-preview-wrapper">
        
        <!-- Estado Vacío -->
        <div id="empty-state" class="empty-state">
            <div class="empty-icon">📝</div>
            <h3>Esperando Consecutivo...</h3>
            <p>Ingresa un número para rellenar la plantilla oficial de RTP.</p>
        </div>

        <!-- 📄 HOJA 1 -->
        <div class="document-a4" id="page-1" style="display: none;">
            <img src="/static/img/templates/correctivo/plantilla_1.jpg" class="template-bg" alt="Hoja 1">
            
            <div id="val-fecha" class="floating-data pos-fecha">---</div>
            <div id="val-folio" class="floating-data pos-folio">---</div>
            <div id="val-consecutivo" class="floating-data pos-consecutivo" style="color: #dc2626;">---</div>
            
            <div id="val-eco" class="floating-data pos-eco">---</div>
            <div id="val-ruta" class="floating-data pos-ruta">---</div>
            <div id="val-tipo" class="floating-data pos-tipo">---</div>
            <div id="val-km" class="floating-data pos-km">---</div>
            
            <div id="val-falla" class="floating-data pos-falla">---</div>
        </div>

        <!-- 📄 HOJA 2 -->
        <div class="document-a4" id="page-2" style="display: none;">
            <img src="/static/img/templates/correctivo/plantilla_2.jpg" class="template-bg" alt="Hoja 2">
            
            <div id="val-operador" class="floating-data pos-operador">---</div>
            <div id="val-jefe" class="floating-data pos-jefe">---</div>
            <div id="val-jud" class="floating-data pos-jud">---</div>
        </div>

        <!-- 📄 HOJA 3 -->
        <div class="document-a4" id="page-3" style="display: none;">
            <img src="/static/img/templates/correctivo/plantilla_3.jpg" class="template-bg" alt="Hoja 3">
        </div>

    </div>
</div>

<script src="/static/js/modulos/correctivo.js?v=3.0"></script>