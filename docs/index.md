```mermaid
flowchart TD
    A["Usuario ingresa credenciales en /login"] --> B["index.php: Recibe POST (username, password)"]
    B --> C["Consulta SQL preparada (PDO) en tabla usuarios"]
    C --> D{"¿Existe el usuario?"}

    D -- No --> E["Registra error genérico (Evita enumeración)"]
    D -- Sí --> F["Verificar si bloqueado_hasta > AHORA"]

    F -- Sí --> G["Mantener bloqueo temporal (Mostrar temporizador)"]
    F -- No --> H{"¿password_verify y activo == true?"}

    H -- No --> I["Incrementar intentos_fallidos + 1"]
    I --> J{"¿intentos_fallidos >= 5?"}
    J -- Sí --> K["Asignar bloqueado_hasta = AHORA + 5 minutos"]
    J -- No --> L["Guardar contador en PostgreSQL"]
    
    H -- Sí --> M["Reiniciar intentos_fallidos = 0 y bloqueado_hasta = NULL"]
    M --> N["Crear Variables de Sesión ($_SESSION['rol'], etc.)"]
    N --> O["Redirigir a /dashboard/{rol}"]