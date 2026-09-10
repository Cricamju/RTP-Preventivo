import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
file_path = os.path.join(BASE_DIR, "RAT Y PVO 07-07-2026.xlsx")
sql_output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "seed_kilometraje_y_update.sql")

print("Procesando la pestaña KILOMETRAJE con las columnas exactas de PostgreSQL...")
df_km = pd.read_excel(file_path, sheet_name="KILOMETRAJE")

sql_lines = [
    "BEGIN;\n",
    "-- 1. Poblar la tabla op_historial_kilometraje",
    "INSERT INTO op_historial_kilometraje (id_autobus, fecha_registro, odometro_actual, color_alerta)",
    "SELECT",
    "    a.id_autobus,",
    "    v.fecha_registro,",
    "    v.odometro_actual,",
    "    'blanco'",
    "FROM (VALUES"
]

values_list = []
registros_vistos = set()
registros_validos = 0

for i in range(1, len(df_km)):
    row = df_km.iloc[i]
    eco_val = row.iloc[1]   # Columna Index 1: Económico real
    fecha_val = row.iloc[2] # Columna Index 2: Fecha
    km_val = row.iloc[3]    # Columna Index 3: Odómetro actual
    
    if pd.isna(eco_val) or pd.isna(km_val):
        continue
        
    try:
        eco_clean = str(int(float(eco_val))).strip()
        km_num = int(float(km_val))
        
        if pd.notna(fecha_val):
            fecha_str = pd.to_datetime(fecha_val).strftime('%Y-%m-%d')
        else:
            fecha_str = '2026-07-07'
            
        # Evitar duplicados por la restricción uq_autobus_fecha
        clave_unica = (eco_clean, fecha_str)
        if clave_unica in registros_vistos:
            continue
        registros_vistos.add(clave_unica)
        
        values_list.append(f"  ('{eco_clean}', '{fecha_str}'::DATE, {km_num})")
        registros_validos += 1
    except (ValueError, TypeError):
        continue

sql_lines.append(",\n".join(values_list))
sql_lines.append(
    ") AS v(eco_numero, fecha_registro, odometro_actual)\n"
    "INNER JOIN cat_autobuses a ON a.eco_numero = v.eco_numero\n"
    "ON CONFLICT (id_autobus, fecha_registro) DO UPDATE SET\n"
    "    odometro_actual = EXCLUDED.odometro_actual;\n\n"
)

# 2. Sentencia UPDATE masiva para corregir los ceros en pvo_ordenes_mantenimiento
sql_lines.append(
    "-- 2. Actualizar las órdenes de trabajo con el odómetro real del autobús\n"
    "UPDATE pvo_ordenes_mantenimiento o\n"
    "SET km_en_ingreso = h.odometro_actual\n"
    "FROM (\n"
    "    SELECT DISTINCT ON (id_autobus)\n"
    "        id_autobus,\n"
    "        odometro_actual\n"
    "    FROM op_historial_kilometraje\n"
    "    ORDER BY id_autobus, fecha_registro DESC\n"
    ") h\n"
    "WHERE o.id_autobus = h.id_autobus\n"
    "  AND (o.km_en_ingreso IS NULL OR o.km_en_ingreso = 0);\n\n"
    "COMMIT;"
)

full_sql = "\n".join(sql_lines)

with open(sql_output_path, "w", encoding="utf-8") as f:
    f.write(full_sql)

print(f"¡Listo! Se procesaron {registros_validos} registros de odómetro únicos.")
print(f"Archivo '{sql_output_path}' generado con éxito.")