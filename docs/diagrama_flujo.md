# Arquitectura y Macroflujo de RTP-Preventivo (Actualizado con Puntos 1 al 9)

```mermaid
flowchart TD
    subgraph CLIENTE["1. Cliente"]
        A["Usuario / navegador"]
    end

    subgraph ENRUTADOR["2. Entrada y enrutamiento (index.php)"]
        B["Recibir solicitud y lectura de REQUEST_URI"]
        
        %% Punto 2: Validación de datos de entrada para evitar errores
        VAL["Validación y sanitización de datos de entrada"]
        
        C{"¿La ruta es pública? <br/> (/ o /login)"}
        A --> B --> VAL --> C

        C -- "Sí" --> D{"¿Es POST de credenciales de login?"}
        
        %% Punto 6: Manejo de errores de conexión a Base de Datos
        subgraph DB_AUTH["Autenticación y BD"]
            E["Consultar cuenta en PostgreSQL (PDO)"]
            DBERR{"¿Error de conexión <br/> o fallo de BD?"}
            DBERR -- "Sí" --> RESDB["Respuesta HTTP 500: Error interno de BD"]
        end

        D -- "Sí" --> E --> DBERR
        DBERR -- "No" --> F{"¿Se encontró la cuenta?"}

        F -- "No" --> NOUSER["Respuesta genérica de autenticación"]
        F -- "Sí" --> G{"¿Bloqueo temporal activo?"}
        G -- "Sí" --> BLOCK["Rechazar sesión por bloqueo activo"]
        G -- "No" --> H{"¿password_verify() es válido?"}

        %% Punto 3: Manejo de contraseña incorrecta varias veces y bloqueo
        H -- "No" --> INC["Incrementar contador de intentos fallidos"]
        INC --> J{"¿Límite de intentos superado?"}
        J -- "Sí" --> K["Aplicar tiempo de bloqueo temporal y registrar en BD"]
        J -- "No" --> L["Respuesta de credenciales incorrectas"]

        %% Punto 4: Regeneración de sesión al autenticar con éxito
        H -- "Sí" --> M["Regenerar ID de sesión (session_regenerate_id) e inicializar $_SESSION"]
        M --> N["Redirección al dashboard del rol"]

        %% Punto 4: Manejo de sesiones expiradas o cierre de sesión
        D -- "No" --> O{"¿Sesión activa y válida? <br/> (Control de expiración / logout)"}
        O -- "Sí" --> P["Redirección al dashboard"]
        O -- "No" --> Q["Renderizar formulario de login"]

        C -- "No" --> R{"¿Existe sesión autenticada válida?"}
        R -- "No" --> S["Redirección HTTP a /login <br/> (Sesión expirada o nula)"]
        R -- "Sí" --> T["Resolver ruta privada solicitada"]
    end

    subgraph AUTORIZACION["3. Resolución y Autorización (RBAC)"]
        T --> U{"¿Existe ruta o módulo?"}
        U -- "No" --> V["Respuesta HTTP 404 <br/> (Ruta no encontrada)"]
        U -- "Sí" --> W{"¿El rol tiene permisos <br/> para la ruta?"}
        
        %% Punto 5: Reforzar permisos para que cada usuario acceda solo a lo permitido
        W -- "No" --> Y["Respuesta HTTP 403 <br/> (Acceso denegado / Sin permisos)"]
        W -- "Sí" --> Z{"¿Qué módulo corresponde?"}
    end

    subgraph MODULOS["4. Módulos de la aplicación"]
        %% Punto 8: Registros de actividad (bitácora de accesos, intentos y acciones)
        Z -- "Odómetro" --> LOG["Registrar bitácora: Accesos, intentos y acciones importantes"]
        Z -- "GSP" --> LOG
        Z -- "Órdenes" --> LOG
        Z -- "Usuarios" --> LOG
        Z -- "Reportes" --> LOG

        LOG --> EXEC["Ejecutar controlador y lógica de negocio"]
        
        %% Punto 5: Permisos operativos internos (consulta, edición, eliminación)
        EXEC --> PERMOP{"¿Permisos para acción <br/> específica permitida?"}
        PERMOP -- "No" --> Y
        PERMOP -- "Sí" --> OUT{"¿Tipo de respuesta?"}
    end

    subgraph RESPUESTAS["5. Respuestas HTTP al cliente"]
        BLOCK --> RLOCK["HTTP 423 / Bloqueo temporal"]
        K --> RLOCK
        NOUSER --> RFAIL["Mensaje de autenticación fallida"]
        L --> RFAIL
        N --> RDASH["Redirección HTTP a Dashboard"]
        P --> RDASH
        Q --> RLOGIN["HTML Form Login"]
        S --> RTOLOGIN["Redirección HTTP a /login"]
        V --> R404["HTTP 404 Not Found"]
        Y --> R403["HTTP 403 Forbidden"]
        RESDB --> R500["HTTP 500 Internal Server Error"]

        OUT -- "Vista HTML" --> RHTML["Renderizar vista con views/base.php"]
        OUT -- "Redirección" --> RREDIR["Redirección HTTP sin layout"]
        OUT -- "Archivo" --> RFILE["Enviar archivo o exportación"]
        OUT -- "Otra" --> ROTHER["Respuesta JSON o texto"]
    end