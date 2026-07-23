# app/routes/auth_routes.py
from datetime import datetime
from flask import Blueprint, request, jsonify
from app.database import db
from app.models import Usuario

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    
    username_tag = data.get('username_tag') or data.get('username')
    password = data.get('password')

    if not username_tag or not password:
        return jsonify({
            "error": "Petición incompleta",
            "mensaje": "Se requieren las credenciales 'username_tag' y 'password'"
        }), 400

    # Buscar usuario en sis_usuarios
    usuario = Usuario.query.filter_by(username_tag=username_tag).first()

    # Validar existencia del usuario y verificación del hash
    if not usuario or not usuario.check_password(password):
        return jsonify({
            "error": "Autenticación fallida",
            "mensaje": "Usuario o contraseña incorrectos"
        }), 401

    if not usuario.activo:
        return jsonify({
            "error": "Acceso denegado",
            "mensaje": "El usuario se encuentra inactivo en el sistema"
        }), 403

    # Registrar fecha y hora del último acceso exitoso
    usuario.ultimo_acceso = datetime.utcnow()
    db.session.commit()

    # Retornar payload JSON con perfil y rol RBAC
    return jsonify({
        "mensaje": "Autenticación exitosa",
        "usuario": {
            "id_usuario": usuario.id_usuario,
            "username_tag": usuario.username_tag,
            "email": usuario.email,
            "nombre_completo": usuario.nombre_completo,
            "rol": usuario.rol,
            "ultimo_acceso": usuario.ultimo_acceso.isoformat() if usuario.ultimo_acceso else None
        }
    }), 200