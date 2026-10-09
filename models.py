from database import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime # 🟢 NUEVO IMPORT

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(20), nullable=False) 
    
    correo_institucional = db.Column(db.String(150), unique=True, nullable=True)
    nombre_completo = db.Column(db.String(150), nullable=True)
    adscripcion = db.Column(db.String(100), nullable=True)
    categoria_puesto = db.Column(db.String(100), nullable=True)
    activo = db.Column(db.Boolean, default=True, nullable=False)

    # 🟢 NUEVOS CAMPOS DE CIBERSEGURIDAD
    intentos_fallidos = db.Column(db.Integer, default=0, nullable=False)
    bloqueado_hasta = db.Column(db.DateTime, nullable=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)