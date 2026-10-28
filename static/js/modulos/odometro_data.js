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