import os
from flask import Flask
from flask_cors import CORS
from app.database import db
from config import Config

# Definimos la ruta de la raíz del proyecto (un nivel arriba de /app)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

def create_app(config_class=Config):
    # Le indicamos a Flask que busque templates y static en la raíz
    app = Flask(
        __name__,
        template_folder=os.path.join(BASE_DIR, 'templates'),
        static_folder=os.path.join(BASE_DIR, 'static')
    )
    app.config.from_object(config_class)

    CORS(app)
    db.init_app(app)

    # 1. Registrar Blueprints de la API (Backend)
    from app.routes.ordenes_routes import ordenes_bp
    from app.routes.catalogos_routes import catalogos_bp
    
    app.register_blueprint(ordenes_bp, url_prefix='/api/ordenes')
    app.register_blueprint(catalogos_bp, url_prefix='/api/catalogos')

    # 2. Registrar Blueprint de Vistas (Frontend HTML)
    from app.routes.views_routes import views_bp
    app.register_blueprint(views_bp)

    return app