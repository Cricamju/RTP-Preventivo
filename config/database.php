<?php
// config/database.php

// Apuntando a tu base de datos local en PostgreSQL (Fedora)
$host = 'localhost';
$port = '5432';
$db   = 'rtp_preventivo_local';
$user = 'rtp_user';
$pass = 'tu_contraseña_segura'; // La contraseña que asignaste al crear el usuario local

$dsn = "pgsql:host=$host;port=$port;dbname=$db;";

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // 1. CREACIÓN AUTOMÁTICA DE TABLAS
    $queryUsuarios = "
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            rol VARCHAR(20) NOT NULL,
            correo_institucional VARCHAR(150) UNIQUE,
            nombre_completo VARCHAR(150),
            adscripcion VARCHAR(100),
            categoria_puesto VARCHAR(100),
            activo BOOLEAN DEFAULT TRUE NOT NULL,
            intentos_fallidos INT DEFAULT 0 NOT NULL,
            bloqueado_hasta TIMESTAMP WITHOUT TIME ZONE
        );
    ";
    $pdo->exec($queryUsuarios);

    // 2. CREACIÓN DE USUARIOS DE PRUEBA SI LA TABLA ESTÁ VACÍA
    $stmt = $pdo->query("SELECT COUNT(*) FROM usuarios");
    if ($stmt->fetchColumn() == 0) {
        $passHash = password_hash('123098456', PASSWORD_DEFAULT);
        
        $usuariosPrueba = [
            ['admin_test', $passHash, 'Admin'],
            ['editor_test', $passHash, 'Editor'],
            ['consulta_test', $passHash, 'Consulta']
        ];

        $insertStmt = $pdo->prepare("INSERT INTO usuarios (username, password_hash, rol, activo, intentos_fallidos) VALUES (?, ?, ?, TRUE, 0)");
        foreach ($usuariosPrueba as $u) {
            $insertStmt->execute($u);
        }
    }

} catch (\PDOException $e) {
    die("Error crítico de conexión a PostgreSQL local: " . $e->getMessage());
}