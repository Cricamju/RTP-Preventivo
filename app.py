from flask import Flask, request, jsonify

app = Flask(__name__)

# 1. Ruta principal (La cara de la aplicación)
@app.route('/')
def index():
    # Por ahora devolvemos un texto simple para probar que el servidor sirve.
    # Después, el Chat de Frontend cambiará esto por el HTML con la tabla.
    return "<h1>¡Servidor Flask de RTP funcionando!</h1><p>Esperando la interfaz de captura...</p>"

# 2. Ruta API (El receptor de datos)
# Aquí es donde el Frontend de Cristofer mandará la tabla con los colores
@app.route('/api/guardar_odometro', methods=['POST'])
def guardar_odometro():
    try:
        # Recibimos el JSON que nos mandará el Frontend
        datos_recibidos = request.json
        
        # Imprimimos en la terminal para confirmar que llegaron
        print("¡Datos recibidos desde la web!")
        print(datos_recibidos)
        
        # Aquí es donde conectaremos la magia de PostgreSQL más adelante
        
        return jsonify({
            "status": "success", 
            "mensaje": "Datos recibidos correctamente por el servidor"
        }), 200
        
    except Exception as e:
        # Manejo de errores por si algo falla
        return jsonify({
            "status": "error",
            "mensaje": str(e)
        }), 500

if __name__ == '__main__':
    # Arrancamos el servidor en modo Debug para que los cambios se guarden en tiempo real
    # El puerto por defecto es el 5000
    app.run(debug=True, host='0.0.0.0', port=5000)