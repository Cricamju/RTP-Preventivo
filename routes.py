from flask import Blueprint, render_template, request, jsonify

# 1. Creamos el Blueprint. Esto actúa como una "mini-aplicación" de rutas.
main_bp = Blueprint('main', __name__)

# ==========================================
# RUTAS PÚBLICAS (Login y Soporte)
# ==========================================
@main_bp.route('/')
def login():
    return render_template('login.html')

@main_bp.route('/soporte-login')
def login_support():
    return render_template('login-support.html')

# ==========================================
# RUTAS PRIVADAS (Simulación de Roles)
# ==========================================
@main_bp.route('/dashboard/admin')
def dashboard_admin():
    return render_template('base.html', role='admin')

@main_bp.route('/dashboard/editor')
def dashboard_editor():
    return render_template('base.html', role='editor')

@main_bp.route('/dashboard/consulta')
def dashboard_consulta():
    return render_template('base.html', role='consulta')

# ==========================================
# RUTAS DE API (Automatización de Excel)
# ==========================================
@main_bp.route('/api/guardar_odometro', methods=['POST'])
def guardar_odometro():
    try:
        # Aquí recibiremos los datos de la tabla pegada (Dropzone)
        datos = request.get_json()
        
        # Más adelante, aquí irá la lógica para guardar en la BD
        
        return jsonify({
            "status": "success",
            "mensaje": "Datos recibidos correctamente por el servidor",
            "filas_procesadas": len(datos.get('payload', []))
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "mensaje": str(e)
        }), 500