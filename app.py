from flask import Flask
from routes import main_bp
from database import db

app = Flask(__name__)

# Configuración de la llave secreta para manejar sesiones (necesario para el login más adelante)
app.config['SECRET_KEY'] = 'clave_secreta_rtp_desarrollo'

# Cadena de conexión a tu base de datos PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://Cricamju:0426@localhost:5432/rtp_mantenimiento'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializamos la DB con la aplicación
db.init_app(app)
app.register_blueprint(main_bp)

if __name__ == '__main__':
    # Contexto de la aplicación para operaciones de la Base de Datos
    with app.app_context():
        # Crea las tablas si no existen
        db.create_all()
        
        # Importamos el modelo
        from models import Usuario
        
        # Si la tabla está vacía, inyectamos los usuarios de prueba
        if not Usuario.query.first():
            usuarios_prueba = [
                Usuario(username='admin_test', rol='Admin'),
                Usuario(username='editor_test', rol='Editor'),
                Usuario(username='consulta_test', rol='Consulta')
            ]
            
            for u in usuarios_prueba:
                u.set_password('123098456') # Aquí encriptamos la contraseña solicitada
                db.session.add(u)
                
            db.session.commit()
            print("Usuarios de prueba creados exitosamente en PostgreSQL.")

    app.run(debug=True)