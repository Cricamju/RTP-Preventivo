from database import db
from werkzeug.security import generate_password_hash, check_password_hash

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(20), nullable=False) # 'Admin', 'Editor', 'Consulta'

    # Método para encriptar la contraseña antes de guardarla en la DB
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    # Método para validar la contraseña ingresada en el Login
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)