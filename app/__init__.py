import os
from flask import Flask
from flask_cors import CORS
from app.database import db
from config import Config

# Ruta raíz del proyecto (un nivel arriba de /app)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

def create_app(config_class=Config):
    # 1. Declaramos e inicializamos la instancia de 'app'
    app = Flask(
        __name__,
        template_folder=os.path.join(BASE_DIR, 'templates'),
        static_folder=os.path.join(BASE_DIR, 'static')
    )
    app.config.from_object(config_class)

    # 2. Habilitar CORS e inicializar DB
    CORS(app)
    db.init_app(app)

    # 3. Registrar Blueprints de la API (Backend)
    from app.routes.ordenes_routes import ordenes_bp
    from app.routes.catalogos_routes import catalogos_bp
    from app.routes.auth_routes import auth_bp
    
    app.register_blueprint(ordenes_bp, url_prefix='/api/ordenes')
    app.register_blueprint(catalogos_bp, url_prefix='/api/catalogos')
    app.register_blueprint(auth_bp, url_prefix='/api')

    # 4. Registrar Blueprint de Vistas (Frontend HTML)
    from app.routes.views_routes import main_bp
    app.register_blueprint(main_bp)

    return app