BEGIN;

-- 1. Poblar catálogo cat_fallas
INSERT INTO cat_fallas (sistema, descripcion_falla) VALUES
  ('Enfriamiento y Temperatura', 'Fuga de refrigerante / anticongelante'),
  ('Enfriamiento y Temperatura', 'Nivel bajo de refrigerante (relleno)'),
  ('Enfriamiento y Temperatura', 'Sobrecalentamiento de motor'),
  ('Enfriamiento y Temperatura', 'Daño en manguera / radiador / tapón'),
  ('Enfriamiento y Temperatura', 'Falla de ventilador / motoventilador'),
  ('Motor y Escape', 'Motor no arranca / se apaga'),
  ('Motor y Escape', 'Falta de potencia / no acelera'),
  ('Motor y Escape', 'Nivel bajo / fuga de aceite de motor'),
  ('Motor y Escape', 'Regeneración DPF / nivel crítico de hollín'),
  ('Motor y Escape', 'Falla de inyectores / turbo / humo excesivo'),
  ('Motor y Escape', 'Fuga / nivel bajo de urea (DEF / AdBlue)'),
  ('Motor y Escape', 'Ruido o daño en bandas de accesorios'),
  ('Neumático y Frenos', 'Fuga de aire comprimido'),
  ('Neumático y Frenos', 'Calibración / nivelación de frenos'),
  ('Neumático y Frenos', 'Falla en compresor / secador de aire'),
  ('Neumático y Frenos', 'Válvula de pedal / estacionamiento dañada'),
  ('Neumático y Frenos', 'Balatas desgastadas / frenos amarrados'),
  ('Eléctrico y Electrónico', 'Baterías descargadas / pasar corriente'),
  ('Eléctrico y Electrónico', 'Falla de marcha / motor de arranque'),
  ('Eléctrico y Electrónico', 'Alternador / sistema de carga'),
  ('Eléctrico y Electrónico', 'Luces exteriores (faros, calaveras, direccionales)'),
  ('Eléctrico y Electrónico', 'Código de avería en tablero / testigo activo'),
  ('Eléctrico y Electrónico', 'Cámaras de seguridad / sensores / timbres'),
  ('Transmisión, Suspensión y Dirección', 'Falla en transmisión / no embraga / patea'),
  ('Transmisión, Suspensión y Dirección', 'Embrague (clutch) dañado / neutralizado'),
  ('Transmisión, Suspensión y Dirección', 'Bolsas de aire / fuelles de suspensión (colgado)'),
  ('Transmisión, Suspensión y Dirección', 'Fuga de líquido / dureza en dirección hidráulica'),
  ('Transmisión, Suspensión y Dirección', 'Daño en amortiguadores / barra estabilizadora'),
  ('Carrocería, Puertas e Interiores', 'Falla en mecanismo de puertas (no abren/cierran)'),
  ('Carrocería, Puertas e Interiores', 'Cristales / parabrisas estrellado o roto'),
  ('Carrocería, Puertas e Interiores', 'Golpes de carrocería / hojalatería y pintura'),
  ('Carrocería, Puertas e Interiores', 'Limpiaparabrisas / mangueras de chisguetero'),
  ('Carrocería, Puertas e Interiores', 'Espejos retrovisores dañados / asientos sueltos'),
  ('Neumáticos y Ruedas', 'Llanta ponchada / desinflada'),
  ('Neumáticos y Ruedas', 'Llanta desgastada / lisa'),
  ('Neumáticos y Ruedas', 'Birlos / tuercas flojas o rotas'),
  ('Neumáticos y Ruedas', 'Rin dañado / cambio de neumático'),
  ('Servicios Programados (G.S.P.)', 'Servicio Preventivo G.S.P. (A, B, C, D, E, F)'),
  ('Servicios Programados (G.S.P.)', 'Revisión general de niveles y fluidos'),
  ('Servicios Programados (G.S.P.)', 'Verificación vehicular / inspección físico-mecánica'),
  ('Equipamiento a Bordo', 'Validador / autofare / barra contadora'),
  ('Equipamiento a Bordo', 'Letrero electrónico / rutero de ruta'),
  ('Diagnóstico General', 'Revisión técnica general en taller')
ON CONFLICT (sistema, descripcion_falla) DO NOTHING;

-- 2. Clasificación y estandarización automática de pvo_ordenes_mantenimiento

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Enfriamiento y Temperatura' AND descripcion_falla = 'Fuga de refrigerante / anticongelante'),
    observaciones_diagnostico = 'Enfriamiento y Temperatura: Fuga de refrigerante / anticongelante'
WHERE (UPPER(falla_reportada) LIKE '%FUGA DE REFRIGERANTE%' OR UPPER(falla_reportada) LIKE '%FUGA DE ANTICONGELANTE%' OR UPPER(falla_reportada) LIKE '%TIRA REFRIGERANTE%' OR UPPER(falla_reportada) LIKE '%TIRA ANTICONGELANTE%' OR UPPER(falla_reportada) LIKE '%FUGA REFRIGERANTE%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Enfriamiento y Temperatura' AND descripcion_falla = 'Nivel bajo de refrigerante (relleno)'),
    observaciones_diagnostico = 'Enfriamiento y Temperatura: Nivel bajo de refrigerante (relleno)'
WHERE (UPPER(falla_reportada) LIKE '%NIVELAR REFRIGERANTE%' OR UPPER(falla_reportada) LIKE '%NIVEL DE REFRIGERANTE%' OR UPPER(falla_reportada) LIKE '%RELLENO DE REFRIGERANTE%' OR UPPER(falla_reportada) LIKE '%FALTA REFRIGERANTE%' OR UPPER(falla_reportada) LIKE '%REFRIGERANTE%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Enfriamiento y Temperatura' AND descripcion_falla = 'Sobrecalentamiento de motor'),
    observaciones_diagnostico = 'Enfriamiento y Temperatura: Sobrecalentamiento de motor'
WHERE (UPPER(falla_reportada) LIKE '%CALENTAMIENTO%' OR UPPER(falla_reportada) LIKE '%SE CALIENTA%' OR UPPER(falla_reportada) LIKE '%TEMPERATURA ALTA%' OR UPPER(falla_reportada) LIKE '%CALIENTA%' OR UPPER(falla_reportada) LIKE '%SOBRECALENTAMIENTO%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Enfriamiento y Temperatura' AND descripcion_falla = 'Daño en manguera / radiador / tapón'),
    observaciones_diagnostico = 'Enfriamiento y Temperatura: Daño en manguera / radiador / tapón'
WHERE (UPPER(falla_reportada) LIKE '%RADIADOR%' OR UPPER(falla_reportada) LIKE '%MANGUERA DE REFRIGERANTE%' OR UPPER(falla_reportada) LIKE '%TAPON DE RADIADOR%' OR UPPER(falla_reportada) LIKE '%TERMOSTATO%' OR UPPER(falla_reportada) LIKE '%POSTENFRIADOR%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Enfriamiento y Temperatura' AND descripcion_falla = 'Falla de ventilador / motoventilador'),
    observaciones_diagnostico = 'Enfriamiento y Temperatura: Falla de ventilador / motoventilador'
WHERE (UPPER(falla_reportada) LIKE '%FANCLUCH%' OR UPPER(falla_reportada) LIKE '%FAN CLUTCH%' OR UPPER(falla_reportada) LIKE '%VENTILADOR%' OR UPPER(falla_reportada) LIKE '%MOTOVENTILADOR%' OR UPPER(falla_reportada) LIKE '%FAN-CLUTCH%' OR UPPER(falla_reportada) LIKE '%FANCLUTCH%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Motor y Escape' AND descripcion_falla = 'Motor no arranca / se apaga'),
    observaciones_diagnostico = 'Motor y Escape: Motor no arranca / se apaga'
WHERE (UPPER(falla_reportada) LIKE '%NO ARRANCA%' OR UPPER(falla_reportada) LIKE '%SE APAGA%' OR UPPER(falla_reportada) LIKE '%NO ENCIENDE%' OR UPPER(falla_reportada) LIKE '%NO DA MARCHA%' OR UPPER(falla_reportada) LIKE '%MOTOR NO ARRANCA%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Motor y Escape' AND descripcion_falla = 'Falta de potencia / no acelera'),
    observaciones_diagnostico = 'Motor y Escape: Falta de potencia / no acelera'
WHERE (UPPER(falla_reportada) LIKE '%FALTA DE POTENCIA%' OR UPPER(falla_reportada) LIKE '%NO ACELERA%' OR UPPER(falla_reportada) LIKE '%POTENCIA%' OR UPPER(falla_reportada) LIKE '%DESBOCA%' OR UPPER(falla_reportada) LIKE '%BURRO%' OR UPPER(falla_reportada) LIKE '%SIN FUERZA%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Motor y Escape' AND descripcion_falla = 'Nivel bajo / fuga de aceite de motor'),
    observaciones_diagnostico = 'Motor y Escape: Nivel bajo / fuga de aceite de motor'
WHERE (UPPER(falla_reportada) LIKE '%FUGA DE ACEITE%' OR UPPER(falla_reportada) LIKE '%ACEITE DE MOTOR%' OR UPPER(falla_reportada) LIKE '%NIVEL DE ACEITE%' OR UPPER(falla_reportada) LIKE '%TIRA ACEITE%' OR UPPER(falla_reportada) LIKE '%ACEITE%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Motor y Escape' AND descripcion_falla = 'Regeneración DPF / nivel crítico de hollín'),
    observaciones_diagnostico = 'Motor y Escape: Regeneración DPF / nivel crítico de hollín'
WHERE (UPPER(falla_reportada) LIKE '%DPF%' OR UPPER(falla_reportada) LIKE '%HOLLIN%' OR UPPER(falla_reportada) LIKE '%REGENERACION%' OR UPPER(falla_reportada) LIKE '%FILTRO DE PARTICULAS%' OR UPPER(falla_reportada) LIKE '%CATALIZADOR%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Motor y Escape' AND descripcion_falla = 'Falla de inyectores / turbo / humo excesivo'),
    observaciones_diagnostico = 'Motor y Escape: Falla de inyectores / turbo / humo excesivo'
WHERE (UPPER(falla_reportada) LIKE '%INYECTOR%' OR UPPER(falla_reportada) LIKE '%INYECTORES%' OR UPPER(falla_reportada) LIKE '%TURBO%' OR UPPER(falla_reportada) LIKE '%HUMO NEGRO%' OR UPPER(falla_reportada) LIKE '%HUMO BLANCO%' OR UPPER(falla_reportada) LIKE '%HUMO AZUL%' OR UPPER(falla_reportada) LIKE '%HUMO%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Motor y Escape' AND descripcion_falla = 'Fuga / nivel bajo de urea (DEF / AdBlue)'),
    observaciones_diagnostico = 'Motor y Escape: Fuga / nivel bajo de urea (DEF / AdBlue)'
WHERE (UPPER(falla_reportada) LIKE '%UREA%' OR UPPER(falla_reportada) LIKE '%DEF%' OR UPPER(falla_reportada) LIKE '%ADBLUE%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Motor y Escape' AND descripcion_falla = 'Ruido o daño en bandas de accesorios'),
    observaciones_diagnostico = 'Motor y Escape: Ruido o daño en bandas de accesorios'
WHERE (UPPER(falla_reportada) LIKE '%BANDA%' OR UPPER(falla_reportada) LIKE '%BANDAS%' OR UPPER(falla_reportada) LIKE '%TENSOR%' OR UPPER(falla_reportada) LIKE '%POLEA%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Neumático y Frenos' AND descripcion_falla = 'Fuga de aire comprimido'),
    observaciones_diagnostico = 'Neumático y Frenos: Fuga de aire comprimido'
WHERE (UPPER(falla_reportada) LIKE '%FUGA DE AIRE%' OR UPPER(falla_reportada) LIKE '%FUGAS DE AIRE%' OR UPPER(falla_reportada) LIKE '%DESCARGA DE AIRE%' OR UPPER(falla_reportada) LIKE '%DESCARGAN TANQUES%' OR UPPER(falla_reportada) LIKE '%SIN AIRE%' OR UPPER(falla_reportada) LIKE '%TANQUES DE AIRE%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Neumático y Frenos' AND descripcion_falla = 'Calibración / nivelación de frenos'),
    observaciones_diagnostico = 'Neumático y Frenos: Calibración / nivelación de frenos'
WHERE (UPPER(falla_reportada) LIKE '%CALIBRAR FRENOS%' OR UPPER(falla_reportada) LIKE '%AJUSTE DE FRENOS%' OR UPPER(falla_reportada) LIKE '%FRENOS LARGOS%' OR UPPER(falla_reportada) LIKE '%GRADUAR FRENOS%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Neumático y Frenos' AND descripcion_falla = 'Falla en compresor / secador de aire'),
    observaciones_diagnostico = 'Neumático y Frenos: Falla en compresor / secador de aire'
WHERE (UPPER(falla_reportada) LIKE '%COMPRESOR%' OR UPPER(falla_reportada) LIKE '%SECADOR DE AIRE%' OR UPPER(falla_reportada) LIKE '%GOBERNADOR%' OR UPPER(falla_reportada) LIKE '%VALVULA GOBERNADORA%' OR UPPER(falla_reportada) LIKE '%PURGA%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Neumático y Frenos' AND descripcion_falla = 'Válvula de pedal / estacionamiento dañada'),
    observaciones_diagnostico = 'Neumático y Frenos: Válvula de pedal / estacionamiento dañada'
WHERE (UPPER(falla_reportada) LIKE '%VALVULA DE PEDAL%' OR UPPER(falla_reportada) LIKE '%VALVULA DE ESTACIONAMIENTO%' OR UPPER(falla_reportada) LIKE '%VALVULA DE FRENO%' OR UPPER(falla_reportada) LIKE '%FRENO DE MANO%' OR UPPER(falla_reportada) LIKE '%MAXI%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Neumático y Frenos' AND descripcion_falla = 'Balatas desgastadas / frenos amarrados'),
    observaciones_diagnostico = 'Neumático y Frenos: Balatas desgastadas / frenos amarrados'
WHERE (UPPER(falla_reportada) LIKE '%BALATAS%' OR UPPER(falla_reportada) LIKE '%BALATA%' OR UPPER(falla_reportada) LIKE '%FRENOS AMARRADOS%' OR UPPER(falla_reportada) LIKE '%FRENOS%' OR UPPER(falla_reportada) LIKE '%DISCO DE FRENO%' OR UPPER(falla_reportada) LIKE '%TAMBOR%' OR UPPER(falla_reportada) LIKE '%AMARRADO%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Eléctrico y Electrónico' AND descripcion_falla = 'Baterías descargadas / pasar corriente'),
    observaciones_diagnostico = 'Eléctrico y Electrónico: Baterías descargadas / pasar corriente'
WHERE (UPPER(falla_reportada) LIKE '%BATERIA%' OR UPPER(falla_reportada) LIKE '%BATERIAS%' OR UPPER(falla_reportada) LIKE '%PASAR CORRIENTE%' OR UPPER(falla_reportada) LIKE '%DESCARGADA%' OR UPPER(falla_reportada) LIKE '%ACUMULADOR%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Eléctrico y Electrónico' AND descripcion_falla = 'Falla de marcha / motor de arranque'),
    observaciones_diagnostico = 'Eléctrico y Electrónico: Falla de marcha / motor de arranque'
WHERE (UPPER(falla_reportada) LIKE '%MARCHA%' OR UPPER(falla_reportada) LIKE '%MOTOR DE ARRANQUE%' OR UPPER(falla_reportada) LIKE '%SOLENOIDE%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Eléctrico y Electrónico' AND descripcion_falla = 'Alternador / sistema de carga'),
    observaciones_diagnostico = 'Eléctrico y Electrónico: Alternador / sistema de carga'
WHERE (UPPER(falla_reportada) LIKE '%ALTERNADOR%' OR UPPER(falla_reportada) LIKE '%SISTEMA DE CARGA%' OR UPPER(falla_reportada) LIKE '%NO CARGA%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Eléctrico y Electrónico' AND descripcion_falla = 'Luces exteriores (faros, calaveras, direccionales)'),
    observaciones_diagnostico = 'Eléctrico y Electrónico: Luces exteriores (faros, calaveras, direccionales)'
WHERE (UPPER(falla_reportada) LIKE '%LUCES%' OR UPPER(falla_reportada) LIKE '%FARO%' OR UPPER(falla_reportada) LIKE '%FAROS%' OR UPPER(falla_reportada) LIKE '%CALAVERA%' OR UPPER(falla_reportada) LIKE '%CALAVERAS%' OR UPPER(falla_reportada) LIKE '%DIRECCIONAL%' OR UPPER(falla_reportada) LIKE '%DIRECCIONALES%' OR UPPER(falla_reportada) LIKE '%STOP%' OR UPPER(falla_reportada) LIKE '%CUARTOS%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Eléctrico y Electrónico' AND descripcion_falla = 'Código de avería en tablero / testigo activo'),
    observaciones_diagnostico = 'Eléctrico y Electrónico: Código de avería en tablero / testigo activo'
WHERE (UPPER(falla_reportada) LIKE '%TESTIGO%' OR UPPER(falla_reportada) LIKE '%TABLERO%' OR UPPER(falla_reportada) LIKE '%CHECK ENGINE%' OR UPPER(falla_reportada) LIKE '%CODIGO%' OR UPPER(falla_reportada) LIKE '%ALARMA%' OR UPPER(falla_reportada) LIKE '%SENSORES%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Eléctrico y Electrónico' AND descripcion_falla = 'Cámaras de seguridad / sensores / timbres'),
    observaciones_diagnostico = 'Eléctrico y Electrónico: Cámaras de seguridad / sensores / timbres'
WHERE (UPPER(falla_reportada) LIKE '%CAMARA%' OR UPPER(falla_reportada) LIKE '%CAMARAS%' OR UPPER(falla_reportada) LIKE '%TIMBRE%' OR UPPER(falla_reportada) LIKE '%TIMBRES%' OR UPPER(falla_reportada) LIKE '%AUDIO%' OR UPPER(falla_reportada) LIKE '%SENSOR%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Transmisión, Suspensión y Dirección' AND descripcion_falla = 'Falla en transmisión / no embraga / patea'),
    observaciones_diagnostico = 'Transmisión, Suspensión y Dirección: Falla en transmisión / no embraga / patea'
WHERE (UPPER(falla_reportada) LIKE '%TRANSMISION%' OR UPPER(falla_reportada) LIKE '%CAJA DE VELOCIDADES%' OR UPPER(falla_reportada) LIKE '%PATEA%' OR UPPER(falla_reportada) LIKE '%NO HACE CAMBIOS%' OR UPPER(falla_reportada) LIKE '%TRANSMISIÓN%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Transmisión, Suspensión y Dirección' AND descripcion_falla = 'Embrague (clutch) dañado / neutralizado'),
    observaciones_diagnostico = 'Transmisión, Suspensión y Dirección: Embrague (clutch) dañado / neutralizado'
WHERE (UPPER(falla_reportada) LIKE '%CLUTCH%' OR UPPER(falla_reportada) LIKE '%EMBRAGUE%' OR UPPER(falla_reportada) LIKE '%PEDAL DE CLUTCH%' OR UPPER(falla_reportada) LIKE '%BOMBA DE CLUTCH%' OR UPPER(falla_reportada) LIKE '%NEUTRALIZADO%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Transmisión, Suspensión y Dirección' AND descripcion_falla = 'Bolsas de aire / fuelles de suspensión (colgado)'),
    observaciones_diagnostico = 'Transmisión, Suspensión y Dirección: Bolsas de aire / fuelles de suspensión (colgado)'
WHERE (UPPER(falla_reportada) LIKE '%BOLSA DE AIRE%' OR UPPER(falla_reportada) LIKE '%BOLSAS DE AIRE%' OR UPPER(falla_reportada) LIKE '%SUSPENSION%' OR UPPER(falla_reportada) LIKE '%COLGADO%' OR UPPER(falla_reportada) LIKE '%NIVELACION DE SUSPENSION%' OR UPPER(falla_reportada) LIKE '%FUELLE%' OR UPPER(falla_reportada) LIKE '%VALVULA DE NIVEL%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Transmisión, Suspensión y Dirección' AND descripcion_falla = 'Fuga de líquido / dureza en dirección hidráulica'),
    observaciones_diagnostico = 'Transmisión, Suspensión y Dirección: Fuga de líquido / dureza en dirección hidráulica'
WHERE (UPPER(falla_reportada) LIKE '%DIRECCION%' OR UPPER(falla_reportada) LIKE '%DIRECCIÓN%' OR UPPER(falla_reportada) LIKE '%DIRECCION DURA%' OR UPPER(falla_reportada) LIKE '%LICUADORA%' OR UPPER(falla_reportada) LIKE '%BOMBA DE DIRECCION%' OR UPPER(falla_reportada) LIKE '%VOLANTE DURO%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Transmisión, Suspensión y Dirección' AND descripcion_falla = 'Daño en amortiguadores / barra estabilizadora'),
    observaciones_diagnostico = 'Transmisión, Suspensión y Dirección: Daño en amortiguadores / barra estabilizadora'
WHERE (UPPER(falla_reportada) LIKE '%AMORTIGUADOR%' OR UPPER(falla_reportada) LIKE '%AMORTIGUADORES%' OR UPPER(falla_reportada) LIKE '%BARRA ESTABILIZADORA%' OR UPPER(falla_reportada) LIKE '%PERNOS DE DIRECCION%' OR UPPER(falla_reportada) LIKE '%PERNO%' OR UPPER(falla_reportada) LIKE '%TERMINAL%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Carrocería, Puertas e Interiores' AND descripcion_falla = 'Falla en mecanismo de puertas (no abren/cierran)'),
    observaciones_diagnostico = 'Carrocería, Puertas e Interiores: Falla en mecanismo de puertas (no abren/cierran)'
WHERE (UPPER(falla_reportada) LIKE '%PUERTA%' OR UPPER(falla_reportada) LIKE '%PUERTAS%' OR UPPER(falla_reportada) LIKE '%PISTON DE PUERTA%' OR UPPER(falla_reportada) LIKE '%VALVULA DE PUERTA%' OR UPPER(falla_reportada) LIKE '%NO ABRE PUERTA%' OR UPPER(falla_reportada) LIKE '%NO CIERRA PUERTA%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Carrocería, Puertas e Interiores' AND descripcion_falla = 'Cristales / parabrisas estrellado o roto'),
    observaciones_diagnostico = 'Carrocería, Puertas e Interiores: Cristales / parabrisas estrellado o roto'
WHERE (UPPER(falla_reportada) LIKE '%PARABRISAS%' OR UPPER(falla_reportada) LIKE '%CRISTAL%' OR UPPER(falla_reportada) LIKE '%CRISTALES%' OR UPPER(falla_reportada) LIKE '%MEDALLON%' OR UPPER(falla_reportada) LIKE '%VENTANA%' OR UPPER(falla_reportada) LIKE '%VENTANILLA%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Carrocería, Puertas e Interiores' AND descripcion_falla = 'Golpes de carrocería / hojalatería y pintura'),
    observaciones_diagnostico = 'Carrocería, Puertas e Interiores: Golpes de carrocería / hojalatería y pintura'
WHERE (UPPER(falla_reportada) LIKE '%HOJALATERIA%' OR UPPER(falla_reportada) LIKE '%PINTURA%' OR UPPER(falla_reportada) LIKE '%GOLPE%' OR UPPER(falla_reportada) LIKE '%FASCIA%' OR UPPER(falla_reportada) LIKE '%DEFENSA%' OR UPPER(falla_reportada) LIKE '%LAMINA%' OR UPPER(falla_reportada) LIKE '%ESTRIBOS%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Carrocería, Puertas e Interiores' AND descripcion_falla = 'Limpiaparabrisas / mangueras de chisguetero'),
    observaciones_diagnostico = 'Carrocería, Puertas e Interiores: Limpiaparabrisas / mangueras de chisguetero'
WHERE (UPPER(falla_reportada) LIKE '%LIMPIAPARABRISAS%' OR UPPER(falla_reportada) LIKE '%CHISGUETERO%' OR UPPER(falla_reportada) LIKE '%PLUMAS%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Carrocería, Puertas e Interiores' AND descripcion_falla = 'Espejos retrovisores dañados / asientos sueltos'),
    observaciones_diagnostico = 'Carrocería, Puertas e Interiores: Espejos retrovisores dañados / asientos sueltos'
WHERE (UPPER(falla_reportada) LIKE '%ESPEJO%' OR UPPER(falla_reportada) LIKE '%ESPEJOS%' OR UPPER(falla_reportada) LIKE '%RETROVISOR%' OR UPPER(falla_reportada) LIKE '%ASIENTO%' OR UPPER(falla_reportada) LIKE '%ASIENTOS%' OR UPPER(falla_reportada) LIKE '%PASAMANOS%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Neumáticos y Ruedas' AND descripcion_falla = 'Llanta ponchada / desinflada'),
    observaciones_diagnostico = 'Neumáticos y Ruedas: Llanta ponchada / desinflada'
WHERE (UPPER(falla_reportada) LIKE '%PONCHADA%' OR UPPER(falla_reportada) LIKE '%DESINFLADA%' OR UPPER(falla_reportada) LIKE '%PONCHADURA%' OR UPPER(falla_reportada) LIKE '%BAJA DE AIRE EN LLANTA%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Neumáticos y Ruedas' AND descripcion_falla = 'Llanta desgastada / lisa'),
    observaciones_diagnostico = 'Neumáticos y Ruedas: Llanta desgastada / lisa'
WHERE (UPPER(falla_reportada) LIKE '%LLANTA LISA%' OR UPPER(falla_reportada) LIKE '%LLANTA DESGASTADA%' OR UPPER(falla_reportada) LIKE '%DESGASTE DE LLANTA%' OR UPPER(falla_reportada) LIKE '%LLANTA BOLA%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Neumáticos y Ruedas' AND descripcion_falla = 'Birlos / tuercas flojas o rotas'),
    observaciones_diagnostico = 'Neumáticos y Ruedas: Birlos / tuercas flojas o rotas'
WHERE (UPPER(falla_reportada) LIKE '%BIRLOS%' OR UPPER(falla_reportada) LIKE '%BIRLO%' OR UPPER(falla_reportada) LIKE '%TUERCAS%' OR UPPER(falla_reportada) LIKE '%TUERCA%' OR UPPER(falla_reportada) LIKE '%CAPUCHONES%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Neumáticos y Ruedas' AND descripcion_falla = 'Rin dañado / cambio de neumático'),
    observaciones_diagnostico = 'Neumáticos y Ruedas: Rin dañado / cambio de neumático'
WHERE (UPPER(falla_reportada) LIKE '%RIN%' OR UPPER(falla_reportada) LIKE '%RINES%' OR UPPER(falla_reportada) LIKE '%CAMBIO DE LLANTA%' OR UPPER(falla_reportada) LIKE '%LLANTA%' OR UPPER(falla_reportada) LIKE '%LLANTAS%' OR UPPER(falla_reportada) LIKE '%NEUMATICO%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Servicios Programados (G.S.P.)' AND descripcion_falla = 'Servicio Preventivo G.S.P. (A, B, C, D, E, F)'),
    observaciones_diagnostico = 'Servicios Programados (G.S.P.): Servicio Preventivo G.S.P. (A, B, C, D, E, F)'
WHERE (UPPER(falla_reportada) LIKE '%GSP%' OR UPPER(falla_reportada) LIKE '%G.S.P.%' OR UPPER(falla_reportada) LIKE '%G.S.P%' OR UPPER(falla_reportada) LIKE '%PREVENTIVO%' OR UPPER(falla_reportada) LIKE '%PVO%' OR UPPER(falla_reportada) LIKE '%SERVICIO PREVENTIVO%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Servicios Programados (G.S.P.)' AND descripcion_falla = 'Revisión general de niveles y fluidos'),
    observaciones_diagnostico = 'Servicios Programados (G.S.P.): Revisión general de niveles y fluidos'
WHERE (UPPER(falla_reportada) LIKE '%NIVELES%' OR UPPER(falla_reportada) LIKE '%FLUIDOS%' OR UPPER(falla_reportada) LIKE '%REVISION GENERAL%' OR UPPER(falla_reportada) LIKE '%CHECK LIST%' OR UPPER(falla_reportada) LIKE '%INSPECCION%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Servicios Programados (G.S.P.)' AND descripcion_falla = 'Verificación vehicular / inspección físico-mecánica'),
    observaciones_diagnostico = 'Servicios Programados (G.S.P.): Verificación vehicular / inspección físico-mecánica'
WHERE (UPPER(falla_reportada) LIKE '%VERIFICACION%' OR UPPER(falla_reportada) LIKE '%FISICO MECANICA%' OR UPPER(falla_reportada) LIKE '%REVISTA%' OR UPPER(falla_reportada) LIKE '%INSPECCION FISICO%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Equipamiento a Bordo' AND descripcion_falla = 'Validador / autofare / barra contadora'),
    observaciones_diagnostico = 'Equipamiento a Bordo: Validador / autofare / barra contadora'
WHERE (UPPER(falla_reportada) LIKE '%VALIDADOR%' OR UPPER(falla_reportada) LIKE '%AUTOFARE%' OR UPPER(falla_reportada) LIKE '%BARRA CONTADORA%' OR UPPER(falla_reportada) LIKE '%ALCANCIA%' OR UPPER(falla_reportada) LIKE '%RECAUDO%' OR UPPER(falla_reportada) LIKE '%SISTEMA DE COBRO%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Equipamiento a Bordo' AND descripcion_falla = 'Letrero electrónico / rutero de ruta'),
    observaciones_diagnostico = 'Equipamiento a Bordo: Letrero electrónico / rutero de ruta'
WHERE (UPPER(falla_reportada) LIKE '%LETRERO%' OR UPPER(falla_reportada) LIKE '%RUTERO%' OR UPPER(falla_reportada) LIKE '%LETRERO ELECTRONICO%' OR UPPER(falla_reportada) LIKE '%DISPLAY%')
  AND id_falla IS NULL;

UPDATE pvo_ordenes_mantenimiento
SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Diagnóstico General' AND descripcion_falla = 'Revisión técnica general en taller'),
    observaciones_diagnostico = 'Diagnóstico General: Revisión técnica general en taller'
WHERE id_falla IS NULL;

COMMIT;