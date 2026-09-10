import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
file_path = os.path.join(BASE_DIR, "RAT Y PVO 07-07-2026.xlsx")
sql_output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "seed_control_firmas.sql")

print("Cargando plantilla de personal válida...")
df_p = pd.read_excel(file_path, sheet_name="PLANTILLA RTP")
creds_validas = set()
for v in df_p.iloc[:, 0].dropna():
    try:
        creds_validas.add(int(float(v)))
    except (ValueError, TypeError):
        pass

print(f"Personal registrado en catálogo: {len(creds_validas)}")
print("Procesando auditoría de Firmas desde CAPTURAS CORRECTIVO...")
df_corr = pd.read_excel(file_path, sheet_name="CAPTURAS CORRECTIVO")

sql_lines = [
    "BEGIN;\n",
    "-- Inserción masiva de Control de Firmas por Orden con validación de FK",
    "INSERT INTO pvo_control_firmas (id_orden, credencial_operador, credencial_jefe_abre, credencial_jefe_cierra, credencial_diagnosticador)",
    "SELECT",
    "    o.id_orden,",
    "    f.cred_op,",
    "    f.cred_j_abre,",
    "    f.cred_j_cierra,",
    "    f.cred_diag",
    "FROM (VALUES"
]

values_list = []
ordenes_vistas = set()
firmas_validas = 0

def limpiar_y_validar_cred(val):
    if pd.isna(val) or str(val).strip() in ['', 'nan', '0']:
        return "NULL"
    try:
        cred_num = int(float(val))
        # Solo se inserta si existe como FK válida en cat_personal_rtp
        if cred_num in creds_validas:
            return str(cred_num)
        return "NULL"
    except (ValueError, TypeError):
        return "NULL"

for i in range(2, len(df_corr)):
    row = df_corr.iloc[i]
    
    no_orden_raw = str(row.iloc[5]).strip() if pd.notna(row.iloc[5]) else None
    eco_raw = str(row.iloc[6]).strip() if pd.notna(row.iloc[6]) else None
    
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

    cred_op = limpiar_y_validar_cred(row.iloc[30])
    cred_j_abre = limpiar_y_validar_cred(row.iloc[32])
    cred_j_cierra = limpiar_y_validar_cred(row.iloc[34])
    cred_diag = limpiar_y_validar_cred(row.iloc[36])

    values_list.append(
        f"  ('{no_orden_oficial}', {cred_op}, {cred_j_abre}, {cred_j_cierra}, {cred_diag})"
    )
    firmas_validas += 1

sql_lines.append(",\n".join(values_list))
sql_lines.append(
    ") AS f(no_orden_oficial, cred_op, cred_j_abre, cred_j_cierra, cred_diag)\n"
    "INNER JOIN pvo_ordenes_mantenimiento o ON o.no_orden_oficial = f.no_orden_oficial;\n\n"
    "COMMIT;"
)

full_sql = "\n".join(sql_lines)

with open(sql_output_path, "w", encoding="utf-8") as f:
    f.write(full_sql)

print(f"¡Listo! Se procesaron {firmas_validas} registros de auditoría de firmas válidos.")
print(f"Archivo '{sql_output_path}' generado con éxito.")