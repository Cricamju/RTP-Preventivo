from flask import Flask
from routes import main_bp
from database import db

app = Flask(__name__)

# Configuración de la llave secreta para manejar sesiones
app.config['SECRET_KEY'] = 'clave_secreta_rtp_desarrollo'

# Cadena de conexión a tu base de datos PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://Cricamju:0426@localhost:5432/rtp_mantenimiento'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializamos la DB con la aplicación
db.init_app(app)
app.register_blueprint(main_bp)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        try:
            from models import Usuario
            if not Usuario.query.first():
                usuarios_prueba = [
                    Usuario(username='admin_test', rol='Admin'),
                    Usuario(username='editor_test', rol='Editor'),
                    Usuario(username='consulta_test', rol='Consulta')
                ]
                for u in usuarios_prueba:
                    u.set_password('123098456')
                    db.session.add(u)
                db.session.commit()
                print("Usuarios de prueba creados exitosamente en PostgreSQL.")
        except Exception as e:
            print(f"Nota sobre modelos: {e}")

    # host='0.0.0.0' abre el servidor a la red local y tu hotspot
    app.run(debug=False, host='0.0.0.0', port=5000)