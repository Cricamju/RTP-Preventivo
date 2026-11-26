<?php
// index.php
session_start();
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/module_access.php';
require_once __DIR__ . '/helpers/ordenes_reparacion_store.php';

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
                        $_SESSION['modulo_usuario'] = $user['modulo'] ?? '';

                        $_SESSION['flash_messages'] = [
                            ['message' => '👋 ¡Bienvenido al sistema, ' . htmlspecialchars($user['username']) . '!', 'type' => 'success'],
                            ['message' => '💡 Tip: Explora el menú flotante inferior derecho para cambiar temas y letras de accesibilidad.', 'type' => 'info']
                        ];

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
        $puede_seleccionar_modulo = rtpCanSelectAnyModule();
        $modulo_asignado = rtpNormalizeModuleId($_SESSION['modulo_usuario'] ?? '');
        $moduloActivo = $puede_seleccionar_modulo ? '' : ($modulo_asignado ?? '');

        // El repositorio entrega filas normalizadas; la vista no depende del origen de datos.
        /** @var list<array{economico: string, modulo: string, modelo: string, tipo_servicio: string, color: string, fecha_alta: string, no_orden: string, fecha_odo: string, km_odo: string, fecha_mant: string, km_mant: string, km_acum: string, dias: string}> $ordenes */
        $ordenes = rtpListRepairOrders();
        if (!$puede_seleccionar_modulo) {
            $ordenes = array_values(array_filter($ordenes, static function ($orden) use ($modulo_asignado) {
                return $modulo_asignado !== null
                    && rtpNormalizeModuleId($orden['modulo'] ?? '') === $modulo_asignado;
            }));
        }

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
    case '/reportes/servicios-preventivos':
        if (!isset($_SESSION['rol'])) { header("Location: /"); exit; }
        $page_title = "Reporte de Servicios Preventivos";
        $content_view = __DIR__ . "/views/modulos/reportes/servicios_preventivos.php";
        include __DIR__ . '/views/base.php';
        break;

    case '/reportes/historicos-km-preventivos':
        if (!isset($_SESSION['rol'])) { header("Location: /"); exit; }
        $page_title = "Históricos KM y Preventivos";
        $content_view = __DIR__ . "/views/modulos/reportes/historicos_km_preventivos.php";
        include __DIR__ . '/views/base.php';
        break;

    case '/reportes/historicos-dia-dia':
        if (!isset($_SESSION['rol'])) { header("Location: /"); exit; }
        $page_title = "Históricos KM Día Día";
        $content_view = __DIR__ . "/views/modulos/reportes/historicos_dia_dia.php";
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

    case '/soporte-login':
        include __DIR__ . '/views/login/login-support.php';
        break;

    case '/logout':
        $logoutFlash = [
            ['message' => '🚪 Sesión cerrada correctamente en el sistema. ¡Hasta pronto!', 'type' => 'info']
        ];
        session_destroy();
        session_start();
        $_SESSION['flash_messages'] = $logoutFlash;
        header("Location: /");
        exit;
        
    case '/orden-reparacion':
        if (!isset($_SESSION['rol'])) { header("Location: /"); exit; }
        if (!rtpUserCanAccessModule($_GET['modulo'] ?? '')) {
            http_response_code(403);
            $error_codigo = 403;
            $error_mensaje = 'Acceso denegado';
            $error_descripcion = 'No tienes permiso para consultar órdenes de otro módulo.';
            $content_view = __DIR__ . '/views/error/error_private.php';
            include __DIR__ . '/views/base.php';
            break;
        }
        $page_title = "Detalle y Orden de Reparación";
        $content_view = __DIR__ . "/views/modulos/odometro/generar_orden_reparacion.php";
        include __DIR__ . '/views/base.php';
        break;

    case '/guardar-orden':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            require_once __DIR__ . '/helpers/semaforo_helper.php';
            
            $economico = $_POST['economico'] ?? 'N/A';
            $moduloSolicitado = rtpNormalizeModuleId($_POST['modulo'] ?? '');
            if ($moduloSolicitado === null || !rtpUserCanAccessModule($moduloSolicitado)) {
                http_response_code(403);
                exit('No tienes permiso para guardar órdenes en ese módulo.');
            }
            $modulo = $moduloSolicitado;
            $modelo = $_POST['modelo'] ?? 'Volvo Caio Access 2020';
            $km_acum = $_POST['km_acum'] ?? '0.0';
            
            $_SESSION['filtro_modulo_ordenes'] = $modulo;
            $semaforoInfo = calcularSemaforoMantenimientoPHP($km_acum, $modelo);

            $nuevaOrden = [
                'economico' => $economico,
                'modulo' => $modulo,
                'modelo' => $modelo,
                'tipo_servicio' => $semaforoInfo['servicioTexto'],
                'color' => $semaforoInfo['color'],
                'fecha_alta' => $_POST['fecha_alta'] ?? date('Y-m-d'),
                'no_orden' => rand(500, 999), 
                'fecha_odo' => $_POST['fecha_odo'] ?? date('d-m-Y'),
                'km_odo' => $_POST['km_odo'] ?? '0.0',
                'fecha_mant' => $_POST['fecha_mant'] ?? 'N/A',
                'km_mant' => $_POST['km_mant'] ?? '0.0',
                'km_acum' => $km_acum,
                'dias' => $_POST['dias'] ?? '0'
            ];

            rtpSaveRepairOrder($nuevaOrden);
        }
        header("Location: /ordenes-reparacion");
        exit;

    case '/eliminar-orden':
        if (isset($_GET['eco'])) {
            $ecoAEliminar = $_GET['eco'];
            $moduloOrdenPermitida = null;
            foreach (rtpListRepairOrders() as $orden) {
                if ($orden['economico'] === $ecoAEliminar
                    && rtpUserCanAccessModule($orden['modulo'] ?? '')) {
                    $moduloOrdenPermitida = rtpNormalizeModuleId($orden['modulo']);
                    break;
                }
            }
            if ($moduloOrdenPermitida !== null) {
                rtpDeleteRepairOrder($ecoAEliminar, $moduloOrdenPermitida);
            } else {
                http_response_code(403);
            }
        }
        header("Location: /ordenes-reparacion");
        exit;

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
}