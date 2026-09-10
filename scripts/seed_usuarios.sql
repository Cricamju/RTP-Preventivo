BEGIN;

-- Inserción de usuarios del sistema con columna 'rol' y ENUM exacto
INSERT INTO sis_usuarios (username_tag, email, nombre_completo, password_hash, rol, activo) VALUES
  ('admin_test', 'admin@rtp.gob.mx', 'Administrador General RTP', 'scrypt:32768:8:1$1DuNySccA4HniV7d$7b2b4f77fc61526f99e39449972a6696c2226318eacc7d3a90ff73dfaceada245e8e792f6d9059a211f211d39a790a79960e09ebb1659a1cfb78a8a8f075f7f3', 'Administrador', TRUE),
  ('editor_test', 'editor@rtp.gob.mx', 'Jefe de Taller Editor', 'scrypt:32768:8:1$1DuNySccA4HniV7d$7b2b4f77fc61526f99e39449972a6696c2226318eacc7d3a90ff73dfaceada245e8e792f6d9059a211f211d39a790a79960e09ebb1659a1cfb78a8a8f075f7f3', 'Capturista', TRUE),
  ('consulta_test', 'consulta@rtp.gob.mx', 'Auditor de Consulta', 'scrypt:32768:8:1$1DuNySccA4HniV7d$7b2b4f77fc61526f99e39449972a6696c2226318eacc7d3a90ff73dfaceada245e8e792f6d9059a211f211d39a790a79960e09ebb1659a1cfb78a8a8f075f7f3', 'Consultor', TRUE)
ON CONFLICT (username_tag) DO UPDATE SET
    email = EXCLUDED.email,
    nombre_completo = EXCLUDED.nombre_completo,
    password_hash = EXCLUDED.password_hash,
    rol = EXCLUDED.rol,
    activo = EXCLUDED.activo;

COMMIT;