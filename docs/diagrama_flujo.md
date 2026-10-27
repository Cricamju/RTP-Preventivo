# Arquitectura y macroflujo de RTP-Preventivo

**Tecnología indicada:** PHP 8.2, PostgreSQL mediante PDO y arquitectura MVC ligera.

**Propósito:** representar el recorrido general de una solicitud desde su entrada al sistema hasta la respuesta HTTP, incluyendo autenticación, autorización por roles (RBAC), ejecución de módulos y respuestas finales. El orden exacto de los pasos debe coincidir con la implementación real.

## 1. Macrodiagrama general

```mermaid
flowchart TD
    subgraph CLIENTE["1. Cliente"]
        A["Usuario / navegador"]
    end

    subgraph ENRUTADOR["2. Entrada y enrutamiento - index.php"]
        B["Recibir solicitud HTTP y leer REQUEST_URI y método"]
        C{"¿La ruta es pública? <br/> (/ o /login)"}
        A --> B --> C

        C -- "Sí" --> D{"¿Es un POST de credenciales de login?"}
        D -- "Sí" --> E["Obtener acceso a PDO y consultar la cuenta en PostgreSQL"]
        E --> F{"¿Se encontró la cuenta?"}

        F -- "No" --> NOUSER["Preparar error genérico de autenticación"]
        F -- "Sí" --> G{"¿La cuenta tiene un bloqueo temporal activo?"}
        G -- "Sí" --> BLOCK["Rechazar el inicio de sesión por bloqueo activo"]
        G -- "No" --> H{"¿password_verify() valida la contraseña?"}

        H -- "No" --> INC["Incrementar el contador de intentos fallidos"]
        INC --> J{"¿El contador alcanzó el límite configurado?"}
        J -- "Sí" --> K["Registrar el bloqueo temporal en la base de datos"]
        J -- "No" --> L["Preparar respuesta de credenciales incorrectas"]

        H -- "Sí" --> M["Restablecer intentos; regenerar ID de sesión e inicializar $_SESSION"]
        M --> N["Preparar redirección al dashboard del rol"]

        D -- "No" --> O{"¿Existe una sesión autenticada válida?"}
        O -- "Sí" --> P["Preparar redirección al dashboard del rol"]
        O -- "No" --> Q["Preparar formulario de inicio de sesión"]

        C -- "No" --> R{"¿Existe una sesión autenticada válida?"}
        R -- "No" --> S["Emitir redirección HTTP a /login"]
        R -- "Sí" --> T["Resolver la ruta privada solicitada"]
    end

    subgraph AUTORIZACION["3. Resolución y autorización"]
        T --> U{"¿Existe la ruta o el módulo solicitado?"}
        U -- "No" --> V["Preparar respuesta HTTP 404"]
        U -- "Sí" --> W["Comprobar permisos del rol para la ruta"]
        W --> X{"¿El usuario está autorizado?"}
        X -- "No" --> Y["Preparar respuesta HTTP 403"]
        X -- "Sí" --> Z{"¿Qué módulo corresponde?"}
    end

    subgraph MODULOS["4. Módulos de la aplicación"]
        Z -- "Odómetro" --> MOD1["Odómetro<br/>Filtros, edición y exportación, según corresponda"]
        Z -- "GSP" --> MOD2["GSP / control preventivo<br/>Estado de flota, según corresponda"]
        Z -- "Órdenes" --> MOD3["Órdenes de reparación<br/>Búsqueda y formato de salida, según corresponda"]
        Z -- "Usuarios" --> MOD4["Gestión de usuarios<br/>CRUD, roles y gestión de intentos, según corresponda"]
        Z -- "Reportes / ayuda" --> MOD5["Reportes y ayuda"]

        MOD1 --> EXEC["Ejecutar controlador, acción y lógica del módulo"]
        MOD2 --> EXEC
        MOD3 --> EXEC
        MOD4 --> EXEC
        MOD5 --> EXEC
        EXEC --> OUT{"¿Qué tipo de respuesta produce la acción?"}
    end

    subgraph RESPUESTAS["5. Respuestas HTTP al cliente"]
        BLOCK --> RLOCK["Respuesta de bloqueo temporal"]
        K --> RLOCK
        NOUSER --> RFAIL["Respuesta genérica de autenticación fallida"]
        L --> RFAIL
        N --> RDASH["Redirección HTTP al dashboard del rol"]
        P --> RDASH
        Q --> RLOGIN["Renderizar formulario HTML de login"]
        S --> RTOLOGIN["Redirección HTTP a /login"]
        V --> R404["Respuesta HTTP 404 - No encontrado"]
        Y --> R403["Respuesta HTTP 403 - Acceso denegado"]

        OUT -- "Vista HTML" --> RHTML["Renderizar la vista con views/base.php, si corresponde"]
        OUT -- "Redirección" --> RREDIR["Emitir redirección HTTP sin renderizar el layout"]
        OUT -- "Archivo" --> RFILE["Enviar archivo o exportación sin renderizar el layout"]
        OUT -- "Otra respuesta" --> ROTHER["Emitir la respuesta correspondiente, por ejemplo JSON o texto"]
    end
```

## 2. Notas técnicas y puntos de verificación

- **Enrutamiento:** confirmar que `index.php` recibe las solicitudes y clasifica las rutas públicas y privadas como se muestra.
- **PDO:** comprobar cuándo se carga `config/database.php` y cuándo se establece la conexión. El diagrama no presupone que toda solicitud abra una conexión si el código no lo hace.
- **Autenticación:** validar el orden real de búsqueda de la cuenta, comprobación del bloqueo, uso de `password_verify()` y actualización de los intentos.
- **Cuenta inexistente:** esta versión separa la cuenta no encontrada de los fallos de contraseña y no la pasa por el contador, siguiendo la descripción proporcionada por la auditoría de Gemini. Confirmar que el código haga exactamente eso.
- **Contador y bloqueo:** el flujo supone que se incrementa el contador después de una contraseña incorrecta y luego se evalúa el límite. Confirmar el orden, el umbral y la duración del bloqueo en la implementación; esos valores no se fijan en este documento.
- **Sesiones:** comprobar que `session_regenerate_id()` y la inicialización de `$_SESSION` ocurran después de autenticar correctamente.
- **Autorización:** verificar si la aplicación comprueba primero la existencia de la ruta y luego los permisos, como se dibuja, y si protege también las operaciones sensibles dentro de cada módulo.
- **Respuestas terminales:** comprobar que los flujos 403 y 404 realmente detengan la ejecución y no continúen hacia los módulos.
- **MVC y layout:** confirmar que el controlador ejecuta la lógica antes de renderizar `views/base.php`, y que las redirecciones y salidas de archivos omiten el layout.
- **Rutas públicas con sesión:** verificar que una sesión válida al visitar `/` o `/login` provoca una redirección al dashboard del rol.
- **Consideración de seguridad:** si la respuesta por cuenta bloqueada es distinta de la respuesta por credenciales incorrectas, evaluar si esa diferencia puede revelar la existencia de una cuenta. La decisión debe documentarse según el comportamiento y los requisitos reales.

## 3. Alcance y criterio de aceptación

Este es un macrodiagrama, no un diagrama de clases ni una auditoría completa de seguridad. Debe considerarse definitivo solo después de contrastar las ramas, nombres, condiciones y respuestas con el código fuente. Las recomendaciones que no estén implementadas deben mantenerse como observaciones y no presentarse como controles existentes.
