# 📊 Arquitectura y Macro-Flujo del Sistema - RTP-Preventivo (PHP 8.2 MVC)

```mermaid
flowchart TD
    subgraph CLIENTE ["1. Interfaz de Usuario (Frontend)"]
        A["Usuario accede a URL o Credenciales"]
    end

    subgraph ENRUTADOR ["2. Núcleo de Enrutamiento y Seguridad (index.php)"]
        A --> B["index.php: Captura REQUEST_URI"]
        B --> C{"¿La ruta es pública? <br> (/ o /login)"}
        
        %% Ruta Pública y Login
        C -- Sí --> D{"¿Envía credenciales POST?"}
        D -- Sí --> D1["Consulta PDO segura + password_verify()"]
        D1 --> D2{"¿Bloqueado por intentos o credenciales inválidas?"}
        D2 -- Sí --> D3["Incrementar intentos / Activar bloqueo 5 min"]
        D2 -- No --> D4["Reiniciar intentos / Crear $_SESSION"]
        
        D -- No --> E{"¿Ya tiene sesión activa?"}
        E -- Sí --> F["Redirigir a /dashboard/{rol}"]
        E -- No --> G["Renderizar Vista de Login"]
        
        %% Ruta Privada
        C -- No --> H{"¿Existe sesión ($_SESSION)?"}
        H -- No --> I["Bloquear y Redirigir al Login"]
        H -- Sí --> J["Cargar config/database.php (PDO PostgreSQL)"]
    end

    subgraph RBAC ["3. Control de Acceso Basado en Roles"]
        J --> K["Validar Permisos del Rol <br> (Admin / Editor / Consulta)"]
        K --> L{"¿Tiene autorización para la ruta?"}
        L -- No --> M["Renderizar Error 403 (Acceso Denegado)"]
        L -- Sí --> N{"¿Existe el Módulo Solicitado?"}
    end

    subgraph MODULOS ["4. Capa de Módulos (MVC Ligero)"]
        N -- No --> O["Renderizar Error 404 (No Encontrado)"]
        N -- Sí --> P["Cargar Layout Base (views/base.php)"]
        
        P --> Q1["⏱️ Módulo Odómetro"]
        P --> Q2["🛠️ Módulo GSP (Preventivo)"]
        P --> Q3["📋 Órdenes de Reparación"]
        P --> Q4["👥 Gestión de Usuarios (CRUD y Desbloqueo)"]
        P --> Q5["📊 Reportes y Ayuda"]
    end

    subgraph RESPUESTA ["5. Respuesta al Cliente"]
        Q1 --> Z["Renderizado Glassmorphic Final"]
        Q2 --> Z
        Q3 --> Z
        Q4 --> Z
        Q5 --> Z
    end