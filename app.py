# IMPORTANTE: Agregamos 'render_template' a la lista de importaciones
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# 1. Ruta principal (Pantalla de Login - La cara de la aplicación)
@app.route('/')
def login():
    # Flask buscará automáticamente 'login.html' dentro de la carpeta 'templates'
    return render_template('login.html')

# 2. Ruta para el Dashboard del Odómetro (La zona de captura)
@app.route('/odometro')
def odometro():
    return render_template('index.html')

# 3. Ruta API (El receptor de datos)
# Aquí es donde el Frontend mandará la tabla con los colores
@app.route('/api/guardar_odometro', methods=['POST'])
def guardar_odometro():
    try:
        # Recibimos el JSON que nos mandará el Frontend
        datos_recibidos = request.json
        
        # Imprimimos en la terminal para confirmar que llegaron
        print("¡Datos recibidos desde la web!")
        print(datos_recibidos)
        
        # Aquí es donde conectaremos la magia de PostgreSQL con Merari más adelante
        
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

@app.route('/soporte-login')
def login_support():
    return render_template('login-support.html')


@app.route('/dashboard')
def dashboard():
    return render_template('base.html')

if __name__ == '__main__':
    app.run(debug=True)