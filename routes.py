from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash, session
from models import Usuario
from datetime import datetime, timedelta

main_bp = Blueprint('main', __name__)

@main_bp.after_request
def add_header(response):
    # Le decimos al navegador que NO guarde historial ni caché de las páginas
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    return response

from datetime import datetime, timedelta # 🟢 Asegúrate de tener esto arriba

@main_bp.route('/', methods=['GET', 'POST'])
def login():
    if 'rol' in session:
        return redirect(url_for(f"main.dashboard_{session['rol'].lower()}"))

    if request.method == 'POST':
        form_username = request.form.get('username')
        form_password = request.form.get('password')
        
        user = Usuario.query.filter_by(username=form_username).first()
        
        if user:
            # 1. VERIFICAR SI ESTÁ BLOQUEADO TEMPORALMENTE
            if user.bloqueado_hasta and user.bloqueado_hasta > datetime.now():
                flash('Error en usuario o contraseña', 'error')
                return redirect(url_for('main.login'))

            # 2. INTENTO DE LOGIN
            if user.check_password(form_password) and user.activo:
                # Login exitoso: Limpiamos su historial de errores
                user.intentos_fallidos = 0
                user.bloqueado_hasta = None
                
                from database import db
                db.session.commit()

                session['rol'] = user.rol
                session['username'] = user.username
                flash(f'¡Bienvenido, @{user.username}!', 'success')
                flash('Tip: Explora el menú flotante inferior derecho para cambiar temas y letras.', 'info')
                
                return redirect(url_for(f"main.dashboard_{user.rol.lower()}"))
            else:
                # Falló la contraseña: Le sumamos un strike
                user.intentos_fallidos += 1
                if user.intentos_fallidos >= 5: # Límite de 5 intentos
                    user.bloqueado_hasta = datetime.now() + timedelta(minutes=5)
                
                from database import db
                db.session.commit()
                
                flash('Error en usuario o contraseña', 'error')
                return redirect(url_for('main.login'))
        else:
            # El usuario no existe (mensaje genérico)
            flash('Error en usuario o contraseña', 'error')
            return redirect(url_for('main.login'))

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

import os
from flask import send_from_directory

# ... (tus rutas de login) ...

@main_bp.route('/favicon.ico')
def favicon():
    # Esto fuerza a los navegadores a encontrar el logo aunque ignoren el HTML
    return send_from_directory(
        os.path.join(main_bp.root_path, '../static/img/logos'),
        'main_logo.png', mimetype='image/png'
    )

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

# Módulo de Captura y Consulta de Odómetro
@main_bp.route('/odometro')
def odometro():
    # 1. Validar que exista la sesión (Todos pueden entrar ahora)
    if 'rol' not in session:
        return redirect(url_for('main.login'))
    
    # 2. Extraer el rol real del usuario y pasarlo a minúsculas
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
        
        
from sqlalchemy.exc import IntegrityError # Asegúrate de importar esto hasta arriba del archivo si no lo tienes

@main_bp.route('/gestion-usuarios', methods=['GET', 'POST'])
def gestion_usuarios():
    if 'rol' not in session or session['rol'] != 'Admin':
        return redirect(url_for('main.login'))
    
    from database import db 
    
    if request.method == 'POST':
        # 🟢 LA MAGIA AQUÍ: Convertimos el ID de texto a número entero
        raw_id = request.form.get('id')
        user_id = int(raw_id) if raw_id and raw_id.isdigit() else None
        
        nombre_completo = request.form.get('nombre_completo')
        
        correo_institucional = request.form.get('correo_institucional')
        if not correo_institucional or correo_institucional.strip() == "":
            correo_institucional = None
        else:
            correo_institucional = correo_institucional.strip()
            
        username = request.form.get('username')
        password = request.form.get('password')
        adscripcion = request.form.get('adscripcion')
        categoria_puesto = request.form.get('categoria_puesto')
        rol = request.form.get('rol')
        activo = True if request.form.get('activo') == 'true' else False

        # ==========================================
        # 1. VALIDACIONES PREVIAS ESTRICTAS
        # ==========================================
        
        if correo_institucional:
            if user_id: 
                # Buscamos si OTRO usuario distinto tiene este correo
                dup_correo = Usuario.query.filter(Usuario.correo_institucional == correo_institucional, Usuario.id != user_id).first()
            else: 
                dup_correo = Usuario.query.filter_by(correo_institucional=correo_institucional).first()
            
            if dup_correo:
                flash('Error: El correo institucional ya está registrado por otro usuario.', 'error')
                usuarios_db = Usuario.query.order_by(Usuario.id.desc()).all()
                return render_template('modulos/gestion_usuarios.html', role=session['rol'].lower(), usuarios=usuarios_db, form_data=request.form)

        if username:
            if user_id:
                dup_user = Usuario.query.filter(Usuario.username == username, Usuario.id != user_id).first()
            else:
                dup_user = Usuario.query.filter_by(username=username).first()
            
            if dup_user:
                flash('Error: El nombre de usuario (Login) ya está en uso.', 'error')
                usuarios_db = Usuario.query.order_by(Usuario.id.desc()).all()
                return render_template('modulos/gestion_usuarios.html', role=session['rol'].lower(), usuarios=usuarios_db, form_data=request.form)

        # ==========================================
        # 2. GUARDADO SEGURO
        # ==========================================
        try:
            if user_id:
                user = Usuario.query.get(user_id)
                if user:
                    user.nombre_completo = nombre_completo
                    user.correo_institucional = correo_institucional
                    user.username = username
                    user.adscripcion = adscripcion
                    user.categoria_puesto = categoria_puesto
                    user.rol = rol
                    user.activo = activo
                    user.intentos_fallidos = 0
                    user.bloqueado_hasta = None
                    
                    if password:
                        user.set_password(password)
                    
                    # Guardamos primero. Si esto falla, salta al "except" y NO muestra el mensaje de éxito
                    db.session.commit()
                    flash('Usuario actualizado correctamente.', 'success')
            else:
                nuevo_usuario = Usuario(
                    nombre_completo=nombre_completo,
                    correo_institucional=correo_institucional,
                    username=username,
                    adscripcion=adscripcion,
                    categoria_puesto=categoria_puesto,
                    rol=rol,
                    activo=activo
                )
                nuevo_usuario.set_password(password if password else 'rtp1234')
                db.session.add(nuevo_usuario)
                
                db.session.commit()
                flash('Nuevo usuario registrado con éxito.', 'success')

        except Exception as e:
            db.session.rollback()
            flash('Error crítico al procesar la solicitud en la base de datos.', 'error')
            # Si hay un error raro, mantenemos el formulario abierto para no perder los datos
            usuarios_db = Usuario.query.order_by(Usuario.id.desc()).all()
            return render_template('modulos/gestion_usuarios.html', role=session['rol'].lower(), usuarios=usuarios_db, form_data=request.form)

        return redirect(url_for('main.gestion_usuarios'))

    # Carga GET normal
    usuarios_db = Usuario.query.order_by(Usuario.id.desc()).all()
    
    # 🟢 Agregamos "ahora=datetime.now()" para que el HTML sepa qué hora es
    return render_template('modulos/gestion_usuarios.html', 
                           role=session['rol'].lower(), 
                           usuarios=usuarios_db,
                           ahora=datetime.now())  

@main_bp.route('/logout')
def logout():
    # Limpiamos todos los datos de la sesión actual
    session.clear()
    
    # ✅ AGREGADO: Alerta de cierre de sesión exitoso
    flash('Cerró sesión con éxito', 'success')
    return redirect(url_for('main.login'))

# ==========================================
# MANEJADORES DE ERRORES INTELIGENTES
# ==========================================

def render_error(codigo, mensaje, descripcion):
    # Si hay sesión activa, muestra la plantilla privada con barra lateral
    if 'rol' in session:
        return render_template('error_private.html', 
                               role=session['rol'].lower(), 
                               codigo=codigo, 
                               mensaje=mensaje, 
                               descripcion=descripcion), int(codigo)
    # Si no hay sesión, muestra la plantilla pública
    else:
        return render_template('error_public.html', 
                               codigo=codigo, 
                               mensaje=mensaje, 
                               descripcion=descripcion), int(codigo)

@main_bp.app_errorhandler(404)
def pagina_no_encontrada(e):
    return render_error("404", "Página no encontrada", "La ruta a la que intentas acceder no existe o fue movida en el sistema.")

@main_bp.app_errorhandler(500)
def error_interno(e):
    return render_error("500", "Error interno", "El sistema encontró un error inesperado al procesar tu solicitud.")

@main_bp.app_errorhandler(403)
def acceso_denegado(e):
    return render_error("403", "Acceso Denegado", "No tienes los permisos necesarios para visualizar este módulo.")

@main_bp.app_errorhandler(405)
def metodo_no_permitido(e):
    return render_error("405", "Método no permitido", "La acción que intentaste requiere permisos de envío (POST) no configurados.")