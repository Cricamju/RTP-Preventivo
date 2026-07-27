import os
from flask import (
    Blueprint, render_template, request, redirect, 
    url_for, flash, session, send_from_directory
)
from app.models import Usuario

main_bp = Blueprint('main', __name__)

@main_bp.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    return response

# Función para convertir el Enum de PostgreSQL a la clave de CSS/Jinja2
def obtener_rol_key():
    rol_raw = str(session.get('rol', '')).strip()
    if rol_raw in ['Administrador', 'admin', 'Admin']:
        return 'admin'
    elif rol_raw in ['Capturista', 'editor', 'Editor', 'Captura']:
        return 'editor'
    elif rol_raw in ['Consultor', 'consulta', 'Consulta']:
        return 'consulta'
    return 'invitado'

@main_bp.route('/', methods=['GET', 'POST'])
def login():
    if 'rol' in session:
        role_key = obtener_rol_key()
        if role_key == 'admin':
            return redirect(url_for('main.dashboard_admin'))
        elif role_key == 'editor':
            return redirect(url_for('main.dashboard_editor'))
        elif role_key == 'consulta':
            return redirect(url_for('main.dashboard_consulta'))

    if request.method == 'POST':
        form_username = request.form.get('username')
        form_password = request.form.get('password')

        usuario = Usuario.query.filter_by(username_tag=form_username).first()

        if usuario and usuario.check_password(form_password):
            if not usuario.activo:
                flash('El usuario se encuentra inactivo.', 'error')
                return redirect(url_for('main.login'))

            session['rol'] = usuario.rol
            session['username'] = usuario.username_tag

            flash(f'¡Bienvenido, @{usuario.username_tag}!', 'success')
            flash('Tip: Explora el menú flotante inferior derecho para cambiar temas.', 'info')

            role_key = obtener_rol_key()
            if role_key == 'admin':
                return redirect(url_for('main.dashboard_admin'))
            elif role_key == 'editor':
                return redirect(url_for('main.dashboard_editor'))
            elif role_key == 'consulta':
                return redirect(url_for('main.dashboard_consulta'))
        else:
            flash('Error en usuario o contraseña', 'error')
            return redirect(url_for('main.login'))

    return render_template('login.html')

@main_bp.route('/logout')
def logout():
    session.clear()
    flash('Cerró sesión con éxito', 'success')
    return redirect(url_for('main.login'))

@main_bp.route('/soporte-login')
@main_bp.route('/login-support')
def login_support():
    if 'rol' in session:
        return redirect(url_for('main.login'))
    return render_template('login-support.html')

# --- DASHBOARDS POR ROL ---
@main_bp.route('/dashboard/admin')
@main_bp.route('/dashboard/administrador')
def dashboard_admin():
    role_key = obtener_rol_key()
    if 'rol' not in session or role_key != 'admin':
        return redirect(url_for('main.login'))
    return render_template('dashboards/dashboard_admin.html', role=role_key)

@main_bp.route('/dashboard/editor')
@main_bp.route('/dashboard/capturista')
def dashboard_editor():
    role_key = obtener_rol_key()
    if 'rol' not in session or role_key != 'editor':
        return redirect(url_for('main.login'))
    return render_template('dashboards/dashboard_editor.html', role=role_key)

@main_bp.route('/dashboard/consulta')
@main_bp.route('/dashboard/consultor')
def dashboard_consulta():
    role_key = obtener_rol_key()
    if 'rol' not in session or role_key != 'consulta':
        return redirect(url_for('main.login'))
    return render_template('dashboards/dashboard_consulta.html', role=role_key)

# --- MÓDULOS OPERATIVOS ---
@main_bp.route('/modulos/odometro')
@main_bp.route('/odometro')
def odometro():
    role_key = obtener_rol_key()
    if 'rol' not in session or role_key not in ['admin', 'editor']:
        return redirect(url_for('main.login'))
    return render_template('modulos/odometro.html', role=role_key)

@main_bp.route('/modulos/gsp')
@main_bp.route('/gsp')
def gsp():
    role_key = obtener_rol_key()
    if 'rol' not in session or role_key not in ['admin', 'editor']:
        return redirect(url_for('main.login'))
    return render_template('modulos/gsp.html', role=role_key)

@main_bp.route('/modulos/correctivo')
@main_bp.route('/correctivo')
def correctivo():
    role_key = obtener_rol_key()
    if 'rol' not in session or role_key not in ['admin', 'editor']:
        return redirect(url_for('main.login'))
    return render_template('modulos/correctivo.html', role=role_key)

@main_bp.route('/modulos/reportes')
@main_bp.route('/reportes')
def reportes():
    role_key = obtener_rol_key()
    if 'rol' not in session or role_key not in ['admin', 'consulta']:
        return redirect(url_for('main.login'))
    return render_template('modulos/reportes.html', role=role_key)

@main_bp.route('/modulos/ayuda')
@main_bp.route('/ayuda')
def ayuda():
    if 'rol' not in session:
        return redirect(url_for('main.login'))
    return render_template('modulos/ayuda.html', role=obtener_rol_key())