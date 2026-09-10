import os
import pandas as pd

# Definir la ruta base del proyecto (un nivel arriba de la carpeta scripts)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
file_path = os.path.join(BASE_DIR, "RAT Y PVO 07-07-2026.xlsx")

# Definir la ruta de salida para el archivo SQL dentro de /scripts
sql_output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "seed_cat_personal_rtp.sql")

print(f"Leyendo la pestaña PLANTILLA RTP desde: {file_path}")
df_p = pd.read_excel(file_path, sheet_name="PLANTILLA RTP")

col_cred = df_p.columns[0]
col_nombre = 'NOMBRE'
col_adsc = 'ADSCRIPCION'
col_cat = 'CATEGORIA'
col_est = 'ESTATUS'

clean_data = []

for _, row in df_p.iterrows():
    cred_val = row[col_cred]
    nombre_val = str(row[col_nombre]).replace("'", "''").strip() if pd.notna(row[col_nombre]) else ''
    adsc_val = str(row[col_adsc]).replace("'", "''").strip() if pd.notna(row[col_adsc]) else ''
    cat_val = str(row[col_cat]).replace("'", "''").strip() if pd.notna(row[col_cat]) else ''
    est_val = str(row[col_est]).replace("'", "''").strip() if pd.notna(row[col_est]) else 'Activo'
    
    try:
        cred_num = int(cred_val)
        clean_data.append((cred_num, nombre_val, adsc_val, cat_val, est_val))
    except (ValueError, TypeError):
        continue

df_clean = pd.DataFrame(clean_data, columns=['credencial', 'nombre', 'adscripcion', 'categoria', 'estatus'])
df_clean = df_clean.drop_duplicates(subset=['credencial'])

print(f"Registros únicos procesados: {len(df_clean)}")

sql_statements = [
    "BEGIN;\n",
    "-- Carga masiva de la plantilla real RTP (cat_personal_rtp)",
    "INSERT INTO cat_personal_rtp (credencial, nombre, adscripcion, categoria, estatus) VALUES"
]

values_list = []
for row in df_clean.itertuples():
    values_list.append(
        f"  ({row.credencial}, '{row.nombre}', '{row.adscripcion}', '{row.categoria}', '{row.estatus}')"
    )

sql_statements.append(",\n".join(values_list))
sql_statements.append(
    "ON CONFLICT (credencial) DO UPDATE SET\n"
    "    nombre = EXCLUDED.nombre,\n"
    "    adscripcion = EXCLUDED.adscripcion,\n"
    "    categoria = EXCLUDED.categoria,\n"
    "    estatus = EXCLUDED.estatus;\n"
    "\nCOMMIT;"
)

full_sql = "\n".join(sql_statements)

with open(sql_output_path, "w", encoding="utf-8") as f:
    f.write(full_sql)

print(f"¡Archivo '{sql_output_path}' generado con éxito!")