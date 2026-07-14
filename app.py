from flask import Flask
from routes import main_bp  # Importamos el Blueprint que creamos

app = Flask(__name__)

# Registramos todas las rutas en la aplicación principal
app.register_blueprint(main_bp)

if __name__ == '__main__':
    # Arrancamos el servidor
    app.run(debug=True)