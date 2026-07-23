import os

class Config:
    # Ajusta con tus credenciales locales de PostgreSQL:
    # postgresql://usuario:password@localhost:5432/nombre_base_datos
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 
        'postgresql://postgres:0897@localhost:5432/rtp_mantenimiento'
    )
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get('SECRET_KEY', 'rtp-secret-key-2026')