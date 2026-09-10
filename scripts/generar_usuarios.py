import os
from werkzeug.security import generate_password_hash

raw_pass = "123098456"
hashed_pass = generate_password_hash(raw_pass)

# Mapeo con los valores exactos del ENUM (Administrador, Capturista, Consultor)
usuarios = [
    {
        "username": "admin_test",
        "email": "admin@rtp.gob.mx",
        "nombre": "Administrador General RTP",
        "rol": "Administrador"
    },
    {
        "username": "editor_test",
        "email": "editor@rtp.gob.mx",
        "nombre": "Jefe de Taller Editor",
        "rol": "Capturista"
    },
    {
        "username": "consulta_test",
        "email": "consulta@rtp.gob.mx",
        "nombre": "Auditor de Consulta",
        "rol": "Consultor"
    }
]

sql_output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "seed_usuarios.sql")

sql_lines = [
    "BEGIN;\n",
    "-- Inserción de usuarios del sistema con columna 'rol' y ENUM exacto",
    "INSERT INTO sis_usuarios (username_tag, email, nombre_completo, password_hash, rol, activo) VALUES"
]

values_list = []
for u in usuarios:
    values_list.append(
        f"  ('{u['username']}', '{u['email']}', '{u['nombre']}', '{hashed_pass}', '{u['rol']}', TRUE)"
    )

sql_lines.append(",\n".join(values_list))
sql_lines.append(
    "ON CONFLICT (username_tag) DO UPDATE SET\n"
    "    email = EXCLUDED.email,\n"
    "    nombre_completo = EXCLUDED.nombre_completo,\n"
    "    password_hash = EXCLUDED.password_hash,\n"
    "    rol = EXCLUDED.rol,\n"
    "    activo = EXCLUDED.activo;\n\n"
    "COMMIT;"
)

with open(sql_output_path, "w", encoding="utf-8") as f:
    f.write("\n".join(sql_lines))

print("¡Script 'seed_usuarios.sql' generado con la columna 'rol' corregida!")