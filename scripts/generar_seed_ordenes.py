import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
file_path = os.path.join(BASE_DIR, "RAT Y PVO 07-07-2026.xlsx")
sql_output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "seed_ordenes_mantenimiento.sql")

print("Procesando CAPTURAS CORRECTIVO con mapeo estricto de estatus...")
df_corr = pd.read_excel(file_path, sheet_name="CAPTURAS CORRECTIVO")

sql_lines = [
    "BEGIN;\n",
    "-- Inserción masiva de Órdenes de Mantenimiento relacionales",
    "INSERT INTO pvo_ordenes_mantenimiento (no_orden_oficial, id_autobus, id_ruta, tipo_mantenimiento, subtipo_servicio, estatus_orden, km_en_ingreso, falla_reportada)",
    "SELECT",
    "    v.no_orden_oficial,",
    "    a.id_autobus,",
    "    r.id_ruta,",
    "    v.tipo_mantenimiento,",
    "    v.subtipo_servicio,",
    "    v.estatus_orden,",
    "    v.km_en_ingreso,",
    "    v.falla_reportada",
    "FROM (VALUES"
]

values_list = []
ordenes_vistas = set()
registros_validos = 0

for i in range(2, len(df_corr)):
    row = df_corr.iloc[i]
    
    no_orden_raw = str(row.iloc[5]).strip() if pd.notna(row.iloc[5]) else None
    eco_raw = str(row.iloc[6]).strip() if pd.notna(row.iloc[6]) else None
    ruta_raw = str(row.iloc[8]).strip() if pd.notna(row.iloc[8]) else None
    
    if not no_orden_raw or not eco_raw or eco_raw == 'nan' or no_orden_raw == 'nan':
        continue
        
    try:
        no_orden = str(int(float(no_orden_raw)))
    except (ValueError, TypeError):
        no_orden = no_orden_raw

    try:
        eco_clean = str(int(float(eco_raw)))
    except (ValueError, TypeError):
        eco_clean = eco_raw

    no_orden_oficial = f"ORD-{no_orden}-{eco_clean}"
    if no_orden_oficial in ordenes_vistas:
        no_orden_oficial = f"ORD-{no_orden}-{eco_clean}-{i}"
    ordenes_vistas.add(no_orden_oficial)

    # Mapeo de Tipo de Mantenimiento
    tipo_raw = str(row.iloc[21]).upper() if pd.notna(row.iloc[21]) else ''
    if 'PREV' in tipo_raw:
        tipo = 'PREVENTIVO'
    else:
        tipo = 'CORRECTIVO'

    subtipo = str(row.iloc[9]).replace("'", "''").strip() if pd.notna(row.iloc[9]) else ''
    
    # Mapeo estricto de Estatus para cumplir con el CHECK constraint
    status_raw = str(row.iloc[22]).strip().upper() if pd.notna(row.iloc[22]) else ''
    if 'NO' in status_raw:
        estatus_orden = 'ABIERTA'
    else:
        estatus_orden = 'CERRADA'

    try:
        km = int(float(row.iloc[25])) if pd.notna(row.iloc[25]) else 0
    except (ValueError, TypeError):
        km = 0
        
    falla = str(row.iloc[28]).replace("'", "''").strip() if pd.notna(row.iloc[28]) else ''
    
    values_list.append(
        f"  ('{no_orden_oficial}', '{eco_clean}', '{ruta_raw or ''}', '{tipo}', '{subtipo}', '{estatus_orden}', {km}, '{falla}')"
    )
    registros_validos += 1

sql_lines.append(",\n".join(values_list))
sql_lines.append(
    ") AS v(no_orden_oficial, eco_numero, codigo_ruta, tipo_mantenimiento, subtipo_servicio, estatus_orden, km_en_ingreso, falla_reportada)\n"
    "INNER JOIN cat_autobuses a ON a.eco_numero = v.eco_numero\n"
    "LEFT JOIN cat_rutas r ON r.codigo_ruta = v.codigo_ruta\n"
    "ON CONFLICT (no_orden_oficial) DO NOTHING;\n\n"
    "COMMIT;"
)

with open(sql_output_path, "w", encoding="utf-8") as f:
    f.write("\n".join(sql_lines))

print(f"¡Listo! Se procesaron {registros_validos} órdenes de mantenimiento válidas.")
print(f"Archivo '{sql_output_path}' generado con éxito.")