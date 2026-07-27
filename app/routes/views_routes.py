from flask import Blueprint, render_template, request, redirect, url_for, flash
from app.models import Usuario

main_bp = Blueprint('main', __name__)

@main_bp.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        usuario = Usuario.query.filter_by(username_tag=username).first()

        if usuario and usuario.check_password(password):
            if not usuario.activo:
                return render_template('login.html', error="El usuario se encuentra inactivo.")

            if usuario.rol == 'Administrador':
                return redirect(url_for('main.dashboard_admin'))
            elif usuario.rol == 'Capturista':
                return redirect(url_for('main.dashboard_editor'))
            elif usuario.rol == 'Consultor':
                return redirect(url_for('main.dashboard_consulta'))
        
        return render_template('login.html', error="Usuario o contraseña incorrectos")

    return render_template('login.html')

# --- NUEVA RUTA DE LOGOUT ---
@main_bp.route('/logout')
def logout():
    # Redirige al login principal
    return redirect(url_for('main.login'))

@main_bp.route('/login-support')
def login_support():
    return render_template('login-support.html')

# Dashboards por Rol
@main_bp.route('/dashboard/admin')
def dashboard_admin():
    return render_template('dashboards/dashboard_admin.html')

@main_bp.route('/dashboard/editor')
def dashboard_editor():
    return render_template('dashboards/dashboard_editor.html')

@main_bp.route('/dashboard/consulta')
def dashboard_consulta():
    return render_template('dashboards/dashboard_consulta.html')

# Módulos Operativos
@main_bp.route('/modulos/odometro')
def odometro():
    return render_template('modulos/odometro.html')

@main_bp.route('/modulos/correctivo')
def correctivo():
    return render_template('modulos/correctivo.html')

@main_bp.route('/modulos/gsp')
def gsp():
    return render_template('modulos/gsp.html')

@main_bp.route('/modulos/reportes')
def reportes():
    return render_template('modulos/reportes.html')

@main_bp.route('/modulos/ayuda')
def ayuda():
    return render_template('modulos/ayuda.html')