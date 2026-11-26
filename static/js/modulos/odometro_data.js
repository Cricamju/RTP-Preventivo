/* static/js/modulos/odometro_data.js */
const modelosFlota = [
    "Volvo Caio Access 2020",
    "Yutong ZK6990HGQ 2023",
    "Dina Linner 2017",
    "Volvo Procity 2016",
    "Volvo Torino 2020",
    "Mercedes Benz Cosmopolitan 2016",
    "Volvo Articulado Metrobús"
];

let data = [];
const modulosList = ['01', '02', '03', '04', '05', '06', '07'];

let globalId = 1;
modulosList.forEach((mod) => {
    for (let i = 1; i <= 150; i++) {
        const modeloAsignado = modelosFlota[i % modelosFlota.length];
        
        // Cálculo base de intervalo según el helper importado o disponible
        let intervalo = 5000;
        const m = modeloAsignado.toLowerCase();
        if (m.includes('yutong') || m.includes('dina')) intervalo = 15000;
        else if (m.includes('masa')) intervalo = 12000;
        else if (m.includes('cosmopolitan')) intervalo = 10000;

        const multiplier = ((i * 7) % 35) + 5;
        const baseMilestone = intervalo * multiplier;

        let kmAcumSimulado = 0;
        const statusSelector = i % 5;

        if (statusSelector === 0) {
            kmAcumSimulado = baseMilestone + ((i * 37) % 2500) + 200; 
        } else if (statusSelector === 1 || statusSelector === 2) {
            kmAcumSimulado = baseMilestone - (((i * 23) % 700) + 100); 
        } else {
            kmAcumSimulado = baseMilestone - (((i * 59) % 4000) + 1000); 
        }

        if (kmAcumSimulado < 2000) kmAcumSimulado = 3500;

        data.push({
            id: globalId++,
            modulo: mod,
            economico: (6000 + (parseInt(mod) * 200) + i).toString(),
            modelo: modeloAsignado,
            fecha_alta: `200${4 + (i%5)}-0${(i%9)+1}-15`,
            fechaActual: `2026-08-${(i%28 + 1).toString().padStart(2, '0')}`,
            kmActual: (kmAcumSimulado + 120.5).toFixed(1),
            fechaMant: `2026-01-${(i%28 + 1).toString().padStart(2, '0')}`,
            kmMant: (kmAcumSimulado - 4500).toFixed(1),
            kmAcum: kmAcumSimulado.toFixed(1),
            dias: (30 + (i % 90)).toString(),
            orden: (10000 + i).toString(),
            servicios: (10 + (i % 80)).toString(),
            estado: i % 14 === 0 ? 'Detenida' : 'Operando',
            enReparacion: false // 🟢 Bandera inicial para exclusión a órdenes de reparación
        });
    }
});

const reporteHistorialOdometro = [];
const reporteServiciosPreventivos = [];
const fechaReferenciaReportes = new Date();
fechaReferenciaReportes.setHours(12, 0, 0, 0);

function fechaReporteISO(fecha) {
    return [
        fecha.getFullYear(),
        String(fecha.getMonth() + 1).padStart(2, '0'),
        String(fecha.getDate()).padStart(2, '0')
    ].join('-');
}

function moverFechaReporte(fecha, dias) {
    const resultado = new Date(fecha);
    resultado.setDate(resultado.getDate() + dias);
    return resultado;
}

data.forEach((unidad) => {
    const kmActual = parseFloat(unidad.kmActual) || 0;
    const kmAcumulado = parseFloat(unidad.kmAcum) || 0;
    const serviciosUnidad = [];

    for (let anioOffset = 1; anioOffset >= 0; anioOffset--) {
        const anio = fechaReferenciaReportes.getFullYear() - anioOffset;

        for (let trimestre = 0; trimestre < 4; trimestre++) {
            const mes = (trimestre * 3 + (unidad.id % 3)) % 12;
            const dia = 2 + ((unidad.id * 7 + trimestre * 5 + anioOffset * 3) % 24);
            const fechaCreacion = new Date(anio, mes, dia, 12);
            if (fechaCreacion > fechaReferenciaReportes) continue;

            const fechaIngreso = moverFechaReporte(fechaCreacion, 1 + (unidad.id % 2));
            const fechaSalida = moverFechaReporte(fechaIngreso, 1 + (trimestre % 2));
            const mesesAtras = Math.max(
                0,
                (fechaReferenciaReportes.getFullYear() - anio) * 12
                    + fechaReferenciaReportes.getMonth() - mes
            );
            const kmOrden = Math.max(1000, kmActual - mesesAtras * (600 + (unidad.id % 7) * 50));
            const folio = String(700000 + unidad.id * 8 + trimestre + anioOffset * 4);
            const intervaloServicio = unidad.modelo.toLowerCase().includes('yutong')
                || unidad.modelo.toLowerCase().includes('dina')
                ? 15000
                : unidad.modelo.toLowerCase().includes('masa')
                    ? 12000
                    : unidad.modelo.toLowerCase().includes('cosmopolitan')
                        ? 10000
                        : 5000;
            const letrasServicio = ['A', 'B', 'C', 'D'];
            const cantidadServicios = Math.max(1, Math.min(4, Math.floor(kmOrden / intervaloServicio) % 4 + 1));

            serviciosUnidad.push({
                id: `${unidad.id}-${anio}-${trimestre}`,
                unidadId: unidad.id,
                modulo: unidad.modulo,
                economico: unidad.economico,
                fechaCreacion: fechaReporteISO(fechaCreacion),
                noOrden: folio,
                tipoServicio: letrasServicio.slice(0, cantidadServicios).join(' + '),
                kmCreacion: kmOrden.toFixed(1),
                fechaIngreso: fechaReporteISO(fechaIngreso),
                kmIngreso: (kmOrden + 120 + (unidad.id % 90)).toFixed(1),
                fechaSalida: fechaReporteISO(fechaSalida)
            });
        }
    }

    serviciosUnidad.sort((a, b) => a.fechaIngreso.localeCompare(b.fechaIngreso));
    reporteServiciosPreventivos.push(...serviciosUnidad);

    for (let diasAtras = 30; diasAtras >= 0; diasAtras--) {
        const fechaRegistro = moverFechaReporte(fechaReferenciaReportes, -diasAtras);
        const kmRegistro = Math.max(
            0,
            kmActual - diasAtras * (75 + (unidad.id % 41) * 3)
        );
        const kmAcumuladoRegistro = Math.max(
            0,
            kmAcumulado - diasAtras * (48 + (unidad.id % 19) * 4)
        );
        const serviciosPrevios = serviciosUnidad
            .filter(servicio => servicio.fechaIngreso <= fechaReporteISO(fechaRegistro));
        const ultimoServicio = serviciosPrevios[serviciosPrevios.length - 1];
        const fechaUltimoMant = ultimoServicio?.fechaIngreso || unidad.fechaMant;
        const kmUltimoMant = ultimoServicio?.kmIngreso || unidad.kmMant;

        reporteHistorialOdometro.push({
            unidadId: unidad.id,
            modulo: unidad.modulo,
            economico: unidad.economico,
            fecha: fechaReporteISO(fechaRegistro),
            odometro: kmRegistro.toFixed(1),
            kmAcumulado: kmAcumuladoRegistro.toFixed(1),
            ordenFecha: ultimoServicio?.fechaCreacion || '',
            ordenFolio: ultimoServicio?.noOrden || '',
            ultimoMantFecha: fechaUltimoMant,
            ultimoMantKm: kmUltimoMant,
            serviciosEfectuados: String(Math.max(
                0,
                parseInt(unidad.servicios, 10) - Math.floor(diasAtras / 30)
            ))
        });
    }
});