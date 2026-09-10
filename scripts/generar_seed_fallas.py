import os
import re
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
file_path = os.path.join(BASE_DIR, "RAT Y PVO 07-07-2026.xlsx")
sql_output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "seed_fallas_estandar.sql")

print("Generando catálogo estandarizado de fallas y reglas de clasificación...")

# Catálogo estructurado según tu propuesta
catalogo_fallas = [
    # 1. Enfriamiento y Temperatura
    ("Enfriamiento y Temperatura", "Fuga de refrigerante / anticongelante", ["FUGA DE REFRIGERANTE", "FUGA DE ANTICONGELANTE", "TIRA REFRIGERANTE", "TIRA ANTICONGELANTE", "FUGA REFRIGERANTE"]),
    ("Enfriamiento y Temperatura", "Nivel bajo de refrigerante (relleno)", ["NIVELAR REFRIGERANTE", "NIVEL DE REFRIGERANTE", "RELLENO DE REFRIGERANTE", "FALTA REFRIGERANTE", "REFRIGERANTE"]),
    ("Enfriamiento y Temperatura", "Sobrecalentamiento de motor", ["CALENTAMIENTO", "SE CALIENTA", "TEMPERATURA ALTA", "CALIENTA", "SOBRECALENTAMIENTO"]),
    ("Enfriamiento y Temperatura", "Daño en manguera / radiador / tapón", ["RADIADOR", "MANGUERA DE REFRIGERANTE", "TAPON DE RADIADOR", "TERMOSTATO", "POSTENFRIADOR"]),
    ("Enfriamiento y Temperatura", "Falla de ventilador / motoventilador", ["FANCLUCH", "FAN CLUTCH", "VENTILADOR", "MOTOVENTILADOR", "FAN-CLUTCH", "FANCLUTCH"]),

    # 2. Motor y Escape
    ("Motor y Escape", "Motor no arranca / se apaga", ["NO ARRANCA", "SE APAGA", "NO ENCIENDE", "NO DA MARCHA", "MOTOR NO ARRANCA"]),
    ("Motor y Escape", "Falta de potencia / no acelera", ["FALTA DE POTENCIA", "NO ACELERA", "POTENCIA", "DESBOCA", "BURRO", "SIN FUERZA"]),
    ("Motor y Escape", "Nivel bajo / fuga de aceite de motor", ["FUGA DE ACEITE", "ACEITE DE MOTOR", "NIVEL DE ACEITE", "TIRA ACEITE", "ACEITE"]),
    ("Motor y Escape", "Regeneración DPF / nivel crítico de hollín", ["DPF", "HOLLIN", "REGENERACION", "FILTRO DE PARTICULAS", "CATALIZADOR"]),
    ("Motor y Escape", "Falla de inyectores / turbo / humo excesivo", ["INYECTOR", "INYECTORES", "TURBO", "HUMO NEGRO", "HUMO BLANCO", "HUMO AZUL", "HUMO"]),
    ("Motor y Escape", "Fuga / nivel bajo de urea (DEF / AdBlue)", ["UREA", "DEF", "ADBLUE"]),
    ("Motor y Escape", "Ruido o daño en bandas de accesorios", ["BANDA", "BANDAS", "TENSOR", "POLEA"]),

    # 3. Neumático y Frenos
    ("Neumático y Frenos", "Fuga de aire comprimido", ["FUGA DE AIRE", "FUGAS DE AIRE", "DESCARGA DE AIRE", "DESCARGAN TANQUES", "SIN AIRE", "TANQUES DE AIRE"]),
    ("Neumático y Frenos", "Calibración / nivelación de frenos", ["CALIBRAR FRENOS", "AJUSTE DE FRENOS", "FRENOS LARGOS", "GRADUAR FRENOS"]),
    ("Neumático y Frenos", "Falla en compresor / secador de aire", ["COMPRESOR", "SECADOR DE AIRE", "GOBERNADOR", "VALVULA GOBERNADORA", "PURGA"]),
    ("Neumático y Frenos", "Válvula de pedal / estacionamiento dañada", ["VALVULA DE PEDAL", "VALVULA DE ESTACIONAMIENTO", "VALVULA DE FRENO", "FRENO DE MANO", "MAXI"]),
    ("Neumático y Frenos", "Balatas desgastadas / frenos amarrados", ["BALATAS", "BALATA", "FRENOS AMARRADOS", "FRENOS", "DISCO DE FRENO", "TAMBOR", "AMARRADO"]),

    # 4. Eléctrico y Electrónico
    ("Eléctrico y Electrónico", "Baterías descargadas / pasar corriente", ["BATERIA", "BATERIAS", "PASAR CORRIENTE", "DESCARGADA", "ACUMULADOR"]),
    ("Eléctrico y Electrónico", "Falla de marcha / motor de arranque", ["MARCHA", "MOTOR DE ARRANQUE", "SOLENOIDE"]),
    ("Eléctrico y Electrónico", "Alternador / sistema de carga", ["ALTERNADOR", "SISTEMA DE CARGA", "NO CARGA"]),
    ("Eléctrico y Electrónico", "Luces exteriores (faros, calaveras, direccionales)", ["LUCES", "FARO", "FAROS", "CALAVERA", "CALAVERAS", "DIRECCIONAL", "DIRECCIONALES", "STOP", "CUARTOS"]),
    ("Eléctrico y Electrónico", "Código de avería en tablero / testigo activo", ["TESTIGO", "TABLERO", "CHECK ENGINE", "CODIGO", "ALARMA", "SENSORES"]),
    ("Eléctrico y Electrónico", "Cámaras de seguridad / sensores / timbres", ["CAMARA", "CAMARAS", "TIMBRE", "TIMBRES", "AUDIO", "SENSOR"]),

    # 5. Transmisión, Suspensión y Dirección
    ("Transmisión, Suspensión y Dirección", "Falla en transmisión / no embraga / patea", ["TRANSMISION", "CAJA DE VELOCIDADES", "PATEA", "NO HACE CAMBIOS", "TRANSMISIÓN"]),
    ("Transmisión, Suspensión y Dirección", "Embrague (clutch) dañado / neutralizado", ["CLUTCH", "EMBRAGUE", "PEDAL DE CLUTCH", "BOMBA DE CLUTCH", "NEUTRALIZADO"]),
    ("Transmisión, Suspensión y Dirección", "Bolsas de aire / fuelles de suspensión (colgado)", ["BOLSA DE AIRE", "BOLSAS DE AIRE", "SUSPENSION", "COLGADO", "NIVELACION DE SUSPENSION", "FUELLE", "VALVULA DE NIVEL"]),
    ("Transmisión, Suspensión y Dirección", "Fuga de líquido / dureza en dirección hidráulica", ["DIRECCION", "DIRECCIÓN", "DIRECCION DURA", "LICUADORA", "BOMBA DE DIRECCION", "VOLANTE DURO"]),
    ("Transmisión, Suspensión y Dirección", "Daño en amortiguadores / barra estabilizadora", ["AMORTIGUADOR", "AMORTIGUADORES", "BARRA ESTABILIZADORA", "PERNOS DE DIRECCION", "PERNO", "TERMINAL"]),

    # 6. Carrocería, Puertas e Interiores
    ("Carrocería, Puertas e Interiores", "Falla en mecanismo de puertas (no abren/cierran)", ["PUERTA", "PUERTAS", "PISTON DE PUERTA", "VALVULA DE PUERTA", "NO ABRE PUERTA", "NO CIERRA PUERTA"]),
    ("Carrocería, Puertas e Interiores", "Cristales / parabrisas estrellado o roto", ["PARABRISAS", "CRISTAL", "CRISTALES", "MEDALLON", "VENTANA", "VENTANILLA"]),
    ("Carrocería, Puertas e Interiores", "Golpes de carrocería / hojalatería y pintura", ["HOJALATERIA", "PINTURA", "GOLPE", "FASCIA", "DEFENSA", "LAMINA", "ESTRIBOS"]),
    ("Carrocería, Puertas e Interiores", "Limpiaparabrisas / mangueras de chisguetero", ["LIMPIAPARABRISAS", "CHISGUETERO", "PLUMAS"]),
    ("Carrocería, Puertas e Interiores", "Espejos retrovisores dañados / asientos sueltos", ["ESPEJO", "ESPEJOS", "RETROVISOR", "ASIENTO", "ASIENTOS", "PASAMANOS"]),

    # 7. Neumáticos y Ruedas
    ("Neumáticos y Ruedas", "Llanta ponchada / desinflada", ["PONCHADA", "DESINFLADA", "PONCHADURA", "BAJA DE AIRE EN LLANTA"]),
    ("Neumáticos y Ruedas", "Llanta desgastada / lisa", ["LLANTA LISA", "LLANTA DESGASTADA", "DESGASTE DE LLANTA", "LLANTA BOLA"]),
    ("Neumáticos y Ruedas", "Birlos / tuercas flojas o rotas", ["BIRLOS", "BIRLO", "TUERCAS", "TUERCA", "CAPUCHONES"]),
    ("Neumáticos y Ruedas", "Rin dañado / cambio de neumático", ["RIN", "RINES", "CAMBIO DE LLANTA", "LLANTA", "LLANTAS", "NEUMATICO"]),

    # 8. Servicios Programados (G.S.P.)
    ("Servicios Programados (G.S.P.)", "Servicio Preventivo G.S.P. (A, B, C, D, E, F)", ["GSP", "G.S.P.", "G.S.P", "PREVENTIVO", "PVO", "SERVICIO PREVENTIVO"]),
    ("Servicios Programados (G.S.P.)", "Revisión general de niveles y fluidos", ["NIVELES", "FLUIDOS", "REVISION GENERAL", "CHECK LIST", "INSPECCION"]),
    ("Servicios Programados (G.S.P.)", "Verificación vehicular / inspección físico-mecánica", ["VERIFICACION", "FISICO MECANICA", "REVISTA", "INSPECCION FISICO"]),

    # 9. Equipamiento a Bordo
    ("Equipamiento a Bordo", "Validador / autofare / barra contadora", ["VALIDADOR", "AUTOFARE", "BARRA CONTADORA", "ALCANCIA", "RECAUDO", "SISTEMA DE COBRO"]),
    ("Equipamiento a Bordo", "Letrero electrónico / rutero de ruta", ["LETRERO", "RUTERO", "LETRERO ELECTRONICO", "DISPLAY"]),
    
    # Falla General por Defecto
    ("Diagnóstico General", "Revisión técnica general en taller", [])
]

sql_lines = [
    "BEGIN;\n",
    "-- 1. Poblar catálogo cat_fallas",
    "INSERT INTO cat_fallas (sistema, descripcion_falla) VALUES"
]

cat_values = [f"  ('{s}', '{d}')" for s, d, _ in catalogo_fallas]
sql_lines.append(",\n".join(cat_values))
sql_lines.append("ON CONFLICT (sistema, descripcion_falla) DO NOTHING;\n")

# 2. Sentencias UPDATE para clasificar las órdenes
sql_lines.append("-- 2. Clasificación y estandarización automática de pvo_ordenes_mantenimiento\n")

for sistema, descripcion, keywords in catalogo_fallas:
    if not keywords:
        continue
    conditions = " OR ".join([f"UPPER(falla_reportada) LIKE '%{kw}%'" for kw in keywords])
    sql_lines.append(
        f"UPDATE pvo_ordenes_mantenimiento\n"
        f"SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = '{sistema}' AND descripcion_falla = '{descripcion}'),\n"
        f"    observaciones_diagnostico = '{sistema}: {descripcion}'\n"
        f"WHERE ({conditions})\n"
        f"  AND id_falla IS NULL;\n"
    )

# Asignar Diagnóstico General al remanente
sql_lines.append(
    "UPDATE pvo_ordenes_mantenimiento\n"
    "SET id_falla = (SELECT id_falla FROM cat_fallas WHERE sistema = 'Diagnóstico General' AND descripcion_falla = 'Revisión técnica general en taller'),\n"
    "    observaciones_diagnostico = 'Diagnóstico General: Revisión técnica general en taller'\n"
    "WHERE id_falla IS NULL;\n"
)

sql_lines.append("COMMIT;")

with open(sql_output_path, "w", encoding="utf-8") as f:
    f.write("\n".join(sql_lines))

print(f"¡Listo! Catálogo con {len(catalogo_fallas)} fallas preparado.")
print(f"Archivo '{sql_output_path}' generado exitosamente.")