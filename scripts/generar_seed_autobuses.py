import os
import re
import pandas as pd

# Rutas dinámicas
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
file_path = os.path.join(BASE_DIR, "RAT Y PVO 07-07-2026.xlsx")
sql_output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "seed_autobuses_rutas.sql")

print("Extrayendo Catálogos de Autobuses (con Modelo y Año) y Rutas...")

# 1. Leer hojas relevantes
df_km = pd.read_excel(file_path, sheet_name="KILOMETRAJE")
df_corr = pd.read_excel(file_path, sheet_name="CAPTURAS CORRECTIVO")

autobuses_dict = {}  # eco -> {'modelo': str, 'anio': int/None}

# Función para registrar o actualizar info de autobús
def registrar_autobus(eco_val, mod_raw=None):
    if pd.isna(eco_val):
        return
    try:
        eco_str = str(int(float(eco_val))).strip()
    except (ValueError, TypeError):
        eco_str = str(eco_val).strip()
    
    # Filtrar valores no válidos o leyendas de copyright
    if not eco_str or eco_str == 'nan' or len(eco_str) > 15 or eco_str.startswith('©'):
        return
        
    if eco_str not in autobuses_dict:
        autobuses_dict[eco_str] = {'modelo': 'NULL', 'anio': 'NULL'}
        
    if mod_raw and pd.notna(mod_raw) and str(mod_raw).strip() not in ['', 'nan', '0']:
        mod_str = str(mod_raw).strip()
        match_year = re.search(r'\b(19\d\d|20\d\d)\b', mod_str)
        if match_year:
            autobuses_dict[eco_str]['anio'] = match_year.group(1)
        
        modelo_limpio = re.sub(r'\b(19\d\d|20\d\d)\b', '', mod_str).replace("'", "''").strip()
        if not modelo_limpio:
            modelo_limpio = mod_str.replace("'", "''").strip()
        modelo_limpio = modelo_limpio[:50]
        if modelo_limpio:
            autobuses_dict[eco_str]['modelo'] = f"'{modelo_limpio}'"

# 2. Extraer desde 'PVO SOLO.' y 'e' si existen
try:
    df_pvo_solo = pd.read_excel(file_path, sheet_name="PVO SOLO.")
    for _, row in df_pvo_solo.iterrows():
        registrar_autobus(row.iloc[0], row.iloc[1])
except Exception:
    pass

try:
    df_e = pd.read_excel(file_path, sheet_name="e")
    for _, row in df_e.iterrows():
        registrar_autobus(row.iloc[1], row.iloc[2])
except Exception:
    pass

# 3. Extraer desde 'KILOMETRAJE'
for val in df_km.iloc[1:, 0].dropna().unique():
    registrar_autobus(val)

# 4. Extraer desde 'CAPTURAS CORRECTIVO'
for i in range(2, len(df_corr)):
    row = df_corr.iloc[i]
    registrar_autobus(row.iloc[6], row.iloc[9])

# 5. Extraer Rutas
rutas_raw = df_corr.iloc[2:, 8].dropna().unique()
todas_rutas = set()
for r in rutas_raw:
    r_str = str(r).strip()
    if r_str and r_str != 'nan' and len(r_str) <= 20:
        todas_rutas.add(r_str)

# Construir script SQL
sql_lines = [
    "BEGIN;\n",
    "-- Carga y actualización de Catálogo de Autobuses con Modelo y Año",
    "INSERT INTO cat_autobuses (eco_numero, modelo, \"año_fabricacion\", activo) VALUES"
]

bus_values = []
for eco in sorted(autobuses_dict.keys()):
    info = autobuses_dict[eco]
    bus_values.append(f"  ('{eco}', {info['modelo']}, {info['anio']}, TRUE)")

sql_lines.append(",\n".join(bus_values))
sql_lines.append(
    "ON CONFLICT (eco_numero) DO UPDATE SET\n"
    "    modelo = COALESCE(EXCLUDED.modelo, cat_autobuses.modelo),\n"
    "    \"año_fabricacion\" = COALESCE(EXCLUDED.\"año_fabricacion\", cat_autobuses.\"año_fabricacion\"),\n"
    "    activo = EXCLUDED.activo;\n"
)

sql_lines.append("-- Carga de Catálogo de Rutas (cat_rutas)")
sql_lines.append("INSERT INTO cat_rutas (codigo_ruta, descripcion) VALUES")

ruta_values = [f"  ('{ruta}', 'RUTA {ruta}')" for ruta in sorted(todas_rutas)]
sql_lines.append(",\n".join(ruta_values))
sql_lines.append("ON CONFLICT (codigo_ruta) DO NOTHING;\n")

sql_lines.append("COMMIT;")

with open(sql_output_path, "w", encoding="utf-8") as f:
    f.write("\n".join(sql_lines))

print(f"¡Listo! Se procesaron {len(autobuses_dict)} autobuses y {len(todas_rutas)} rutas.")
print(f"Archivo '{sql_output_path}' generado con éxito.")