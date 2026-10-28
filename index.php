<?php
// index.php
session_start();
require_once __DIR__ . '/config/database.php';

// Limpieza de caché estricta
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

// Obtener la ruta solicitada limpiando parámetros
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Enrutador básico
switch ($requestUri) {
    case '/':
    case '/index.php':
        if (isset($_SESSION['rol'])) {
            header("Location: /dashboard/" . strtolower($_SESSION['rol']));
            exit;
        }

        $error_message = '';
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $form_username = $_POST['username'] ?? '';
            $form_password = $_POST['password'] ?? '';

            $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE username = ?");
            $stmt->execute([$form_username]);
            $user = $stmt->fetch();

            if ($user) {
                $now = new DateTime();
                $bloqueadoHasta = $user['bloqueado_hasta'] ? new DateTime($user['bloqueado_hasta']) : null;

                if ($bloqueadoHasta && $bloqueadoHasta > $now) {
                    $error_message = 'Error en usuario o contraseña';
                } else {
                    if (password_verify($form_password, $user['password_hash']) && $user['activo']) {
                        $updateStmt = $pdo->prepare("UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?");
                        $updateStmt->execute([$user['id']]);

                        $_SESSION['rol'] = $user['rol'];
                        $_SESSION['username'] = $user['username'];

                        header("Location: /dashboard/" . strtolower($user['rol']));
                        exit;
                    } else {
                        $intentos = $user['intentos_fallidos'] + 1;
                        $bloqueoQuery = null;
                        if ($intentos >= 5) {
                            $dt = new DateTime();
                            $dt->modify('+5 minutes');
                            $bloqueoQuery = $dt->format('Y-m-d H:i:s');
                        }

                        $failStmt = $pdo->prepare("UPDATE usuarios SET intentos_fallidos = ?, bloqueado_hasta = ? WHERE id = ?");
                        $failStmt->execute([$intentos, $bloqueoQuery, $user['id']]);

                        $error_message = 'Error en usuario o contraseña';
                    }
                }
            } else {
                $error_message = 'Error en usuario o contraseña';
            }
        }

        include __DIR__ . '/views/login/login.php';
        break;

    case '/dashboard/admin':
    case '/dashboard/editor':
    case '/dashboard/consulta':
        if (!isset($_SESSION['rol'])) {
            header("Location: /");
            exit;
        }
        
        $role = strtolower($_SESSION['rol']);
        $requestedRole = str_replace('/dashboard/', '', $requestUri);
        
        if ($role !== $requestedRole && $role !== 'admin') {
            header("Location: /dashboard/" . $role);
            exit;
        }

        $page_title = "Panel de Control";
        $content_view = __DIR__ . "/views/dashboards/dashboard_{$role}.php";
        include __DIR__ . '/views/base.php';
        break;

    case '/odometro':
        if (!isset($_SESSION['rol'])) { header("Location: /"); exit; }
        $page_title = "Control de Odómetros";
        $content_view = __DIR__ . "/views/modulos/odometro/odometro.php";
        include __DIR__ . '/views/base.php';
        break;

    case '/gsp':
        if (!isset($_SESSION['rol'])) { header("Location: /"); exit; }
        $page_title = "Módulo GSP (Preventivo)";
        $content_view = __DIR__ . "/views/modulos/gsp.php";
        include __DIR__ . '/views/base.php';
        break;

    case '/ordenes-reparacion':
    case '/correctivo':
        if (!isset($_SESSION['rol'])) { header("Location: /"); exit; }
        $page_title = "Órdenes de Reparación";
        $content_view = __DIR__ . "/views/modulos/ordenes_reparacion.php";
        include __DIR__ . '/views/base.php';
        break;

    case '/plantilla-orden':
        if (!isset($_SESSION['rol'])) { header("Location: /"); exit; }
        $page_title = "Plantilla de Orden Oficial";
        $content_view = __DIR__ . "/views/modulos/plantilla_orden_reparacion.php";
        include __DIR__ . '/views/base.php';
        break;

    case '/reportes':
        if (!isset($_SESSION['rol'])) { header("Location: /"); exit; }
        $page_title = "Generar Reportes";
        $content_view = __DIR__ . "/views/modulos/reportes.php";
        include __DIR__ . '/views/base.php';
        break;

    case '/gestion-usuarios':
        if (!isset($_SESSION['rol'])) { header("Location: /"); exit; }
        $page_title = "Gestión de Usuarios";
        $content_view = __DIR__ . "/views/modulos/gestion_usuarios.php";
        include __DIR__ . '/views/base.php';
        break;

    case '/ayuda':
        if (!isset($_SESSION['rol'])) { header("Location: /"); exit; }
        $page_title = "Ayuda del Sistema";
        $content_view = __DIR__ . "/views/modulos/ayuda.php";
        include __DIR__ . '/views/base.php';
        break;

    case '/logout':
        session_destroy();
        header("Location: /");
        exit;
        
    case '/orden-reparacion':
        if (!isset($_SESSION['rol'])) { header("Location: /"); exit; }
        $page_title = "Detalle y Orden de Reparación";
        $content_view = __DIR__ . "/views/modulos/odometro/generar_orden_reparacion.php";
        include __DIR__ . '/views/base.php';
        break;

    default:
        http_response_code(404);
        $error_codigo = 404;
        $error_mensaje = 'Vista no encontrada 🔍';
        $error_descripcion = 'El módulo o enlace solicitado no existe en este servidor.';
        
        $content_view = __DIR__ . "/views/error/error_private.php";
        if (isset($_SESSION['rol'])) {
            include __DIR__ . '/views/base.php';
        } else {
            include __DIR__ . '/views/error/error_public.php';
        }
        break;

        // ... dentro del switch ($requestUri)
    case '/ordenes-reparacion':
        if (!isset($_SESSION['rol'])) { header("Location: /"); exit; }
        $page_title = "Órdenes de Reparación";
        $content_view = __DIR__ . "/views/modulos/ordenes_reparacion.php";
        include __DIR__ . '/views/base.php';
        break;

        case '/guardar-orden':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $nuevaOrden = [
                'economico' => $_POST['economico'] ?? 'N/A',
                'modulo' => $_POST['modulo'] ?? '03',
                'modelo' => $_POST['modelo'] ?? 'Unidad RTP',
                'tipo_servicio' => $_POST['tipo_servicio'] ?? 'A',
                'fecha_alta' => $_POST['fecha_alta'] ?? date('Y-m-d'),
                'no_orden' => rand(500, 999),
                'fecha_odo' => $_POST['fecha_odo'] ?? date('d-m-Y'),
                'km_odo' => $_POST['km_odo'] ?? '0.0',
                'fecha_mant' => $_POST['fecha_mant'] ?? 'N/A',
                'km_mant' => $_POST['km_mant'] ?? '0.0',
                'km_acum' => $_POST['km_acum'] ?? '0.0',
                'dias' => $_POST['dias'] ?? '0'
            ];

            if (!isset($_SESSION['lista_ordenes_reparacion'])) {
                $_SESSION['lista_ordenes_reparacion'] = [];
            }
            array_unshift($_SESSION['lista_ordenes_reparacion'], $nuevaOrden);
        }
        header("Location: /ordenes-reparacion");
        exit;

        case '/eliminar-orden':
        if (isset($_GET['eco'])) {
            $ecoAEliminar = $_GET['eco'];
            if (isset($_SESSION['lista_ordenes_reparacion'])) {
                $_SESSION['lista_ordenes_reparacion'] = array_filter(
                    $_SESSION['lista_ordenes_reparacion'], 
                    function($ord) use ($ecoAEliminar) {
                        return $ord['economico'] !== $ecoAEliminar;
                    }
                );
                // Reindexar el arreglo para mantener orden limpio
                $_SESSION['lista_ordenes_reparacion'] = array_values($_SESSION['lista_ordenes_reparacion']);
            }
        }
        header("Location: /ordenes-reparacion");
        exit;
}