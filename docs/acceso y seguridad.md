```mermaid
flowchart TD
    A["Petición POST en /login"] --> B["Sanear y recuperar inputs (username, password)"]
    B --> C["Conexión PDO a PostgreSQL"]
    C --> D["Buscar usuario en tabla de usuarios"]
    D --> E{"¿El usuario existe?"}
    
    E -- No --> F["Retornar error genérico (Evita enumeración de cuentas)"]
    E -- Sí --> G{"¿Cuenta bloqueada temporalmente?"}
    
    G -- Sí --> H["Denegar acceso y mostrar mensaje de restricción temporal"]
    G -- No --> I{"¿Contraseña válida mediante password_verify()?"}
    
    I -- No --> J["Incrementar contador de intentos fallidos"]
    J --> K{"¿Intentos >= Límite configurado?"}
    K -- Sí --> L["Establecer marca de tiempo de bloqueo temporal"]
    K -- No --> M["Registrar intento fallido en base de datos"]
    
    I -- Sí --> N["Reiniciar contador de fallos a 0 y limpiar bloqueos"]
    N --> O["Generar y registrar variables de sesión ($_SESSION)"]
    O --> P["Redirección segura al Dashboard correspondiente"]