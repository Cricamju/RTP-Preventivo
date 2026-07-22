from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash, session
from models import Usuario

main_bp = Blueprint('main', __name__)

@main_bp.after_request
def add_header(response):
    # Le decimos al navegador que NO guarde historial ni caché de las páginas
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    return response

@main_bp.route('/', methods=['GET', 'POST'])
def login():
    # 1. EVITAR EL BOTÓN ATRÁS: Si ya hay sesión, redirigir al dashboard correspondiente
    if 'rol' in session:
        if session['rol'] == 'Admin':
            return redirect(url_for('main.dashboard_admin'))
        elif session['rol'] == 'Editor':
            return redirect(url_for('main.dashboard_editor'))
        elif session['rol'] == 'Consulta':
            return redirect(url_for('main.dashboard_consulta'))

    # 2. Lógica normal de inicio de sesión
    if request.method == 'POST':
        form_username = request.form.get('username')
        form_password = request.form.get('password')
        
        user = Usuario.query.filter_by(username=form_username).first()
        
        if user and user.check_password(form_password):
            session['rol'] = user.rol # Guardamos la sesión
            session['username'] = user.username
            
            if user.rol == 'Admin':
                return redirect(url_for('main.dashboard_admin'))
            elif user.rol == 'Editor':
                return redirect(url_for('main.dashboard_editor'))
            elif user.rol == 'Consulta':
                return redirect(url_for('main.dashboard_consulta'))
        else:
            flash('Usuario o contraseña incorrectos', 'error')

    return render_template('login.html')

@main_bp.route('/soporte-login')
def login_support():
    if 'rol' in session:
        if session['rol'] == 'Admin':
            return redirect(url_for('main.dashboard_admin'))
        elif session['rol'] == 'Editor':
            return redirect(url_for('main.dashboard_editor'))
        elif session['rol'] == 'Consulta':
            return redirect(url_for('main.dashboard_consulta'))
    return render_template('login-support.html')

# ==========================================
# RUTAS PRIVADAS (Protegidas por Sesión)
# ==========================================
@main_bp.route('/dashboard/admin')
def dashboard_admin():
    # Validar que exista la sesión y que el rol sea el correcto
    if 'rol' not in session or session['rol'] != 'Admin':
        # Si no tiene permiso, lo mandamos al login
        return redirect(url_for('main.login'))
    
    return render_template('dashboards/dashboard_admin.html', role='admin')

@main_bp.route('/dashboard/editor')
def dashboard_editor():
    if 'rol' not in session or session['rol'] != 'Editor':
        return redirect(url_for('main.login'))
        
    return render_template('dashboards/dashboard_editor.html', role='editor')

@main_bp.route('/dashboard/consulta')
def dashboard_consulta():
    if 'rol' not in session or session['rol'] != 'Consulta':
        return redirect(url_for('main.login'))
        
    return render_template('dashboards/dashboard_consulta.html', role='consulta')

# Módulo de Captura
@main_bp.route('/odometro')
def odometro():
    # 1. Validar que exista la sesión y que el rol tenga permisos (Admin o Editor)
    if 'rol' not in session or session['rol'] not in ['Admin', 'Editor']:
        # Si es de Consulta o no tiene sesión, lo expulsamos al login
        return redirect(url_for('main.login'))
    
    # 2. Extraer el rol real del usuario y pasarlo a minúsculas para el CSS (ej. 'Admin' -> 'admin')
    rol_actual = session['rol'].lower()
    
    # 3. Mandar el rol dinámico al HTML
    return render_template('modulos/odometro.html', role=rol_actual)

# ==========================================
# NUEVOS MÓDULOS OPERATIVOS Y DE CONSULTA
# ==========================================

@main_bp.route('/gsp')
def gsp():
    # Solo Admin y Editor tienen acceso
    if 'rol' not in session or session['rol'] not in ['Admin', 'Editor']:
        return redirect(url_for('main.login'))
    return render_template('modulos/gsp.html', role=session['rol'].lower())

@main_bp.route('/correctivo')
def correctivo():
    # Solo Admin y Editor tienen acceso
    if 'rol' not in session or session['rol'] not in ['Admin', 'Editor']:
        return redirect(url_for('main.login'))
    return render_template('modulos/correctivo.html', role=session['rol'].lower())

@main_bp.route('/reportes')
def reportes():
    # Solo Admin y Consulta tienen acceso
    if 'rol' not in session or session['rol'] not in ['Admin', 'Consulta']:
        return redirect(url_for('main.login'))
    return render_template('modulos/reportes.html', role=session['rol'].lower())

@main_bp.route('/ayuda')
def ayuda():
    # Todos los roles con sesión activa tienen acceso
    if 'rol' not in session:
        return redirect(url_for('main.login'))
    return render_template('modulos/ayuda.html', role=session['rol'].lower())

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
        
@main_bp.route('/logout')
def logout():
    # Limpiamos todos los datos de la sesión actual
    session.clear()
    return redirect(url_for('main.login'))