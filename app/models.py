from app.database import db  
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Enum

# Valores exactos registrados en la DB
ROL_USUARIO_ENUM = Enum('Administrador', 'Capturista', 'Consultor', name='rol_usuario')

class Usuario(db.Model):
    __tablename__ = 'sis_usuarios'
    
    id_usuario = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username_tag = db.Column(db.String(30), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    nombre_completo = db.Column(db.String(150), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    rol = db.Column(ROL_USUARIO_ENUM, nullable=False)
    activo = db.Column(db.Boolean, default=True, nullable=False)
    ultimo_acceso = db.Column(db.DateTime, nullable=True)
    creado_en = db.Column(db.DateTime, server_default=db.func.now())
    actualizado_en = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)\

        
# ==========================================
# 2. CATÁLOGOS BASE
# ==========================================
class CatAutobus(db.Model):
    __tablename__ = 'cat_autobuses'

    id_autobus = db.Column(db.Integer, primary_key=True, autoincrement=True)
    eco_numero = db.Column(db.String(20), unique=True, nullable=False)
    placa = db.Column(db.String(15), unique=True, nullable=False)
    modelo = db.Column(db.String(50), nullable=True)
    # MAPEAMOS 'ano_fabricacion' EN PYTHON A LA COLUMNA REAL 'año_fabricacion' EN POSTGRESQL:
    ano_fabricacion = db.Column('año_fabricacion', db.Integer, nullable=True)
    activo = db.Column(db.Boolean, default=True, nullable=False)

    # Relaciones
    historial_kilometraje = db.relationship('OpHistorialKilometraje', backref='autobus', lazy=True)
    ordenes_mantenimiento = db.relationship('PvoOrdenMantenimiento', backref='autobus', lazy=True)

class CatRuta(db.Model):
    __tablename__ = 'cat_rutas'

    id_ruta = db.Column(db.Integer, primary_key=True, autoincrement=True)
    codigo_ruta = db.Column(db.String(20), unique=True, nullable=False)
    descripcion = db.Column(db.String(150), nullable=True)

    # Relaciones
    ordenes_mantenimiento = db.relationship('PvoOrdenMantenimiento', backref='ruta', lazy=True)


class CatPersonalRtp(db.Model):
    __tablename__ = 'cat_personal_rtp'

    credencial = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), nullable=False)
    adscripcion = db.Column(db.String(100), nullable=True)
    categoria = db.Column(db.String(100), nullable=True)
    estatus = db.Column(db.String(20), nullable=True)


# ==========================================
# 3. OPERACIONES Y MANTENIMIENTO
# ==========================================
class OpHistorialKilometraje(db.Model):
    __tablename__ = 'op_historial_kilometraje'

    id_kilometraje = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_autobus = db.Column(db.Integer, db.ForeignKey('cat_autobuses.id_autobus'), nullable=False)
    fecha_registro = db.Column(db.Date, nullable=False)
    odometro_actual = db.Column(db.Integer, nullable=False)
    autofare = db.Column(db.Integer, nullable=True)
    color_alerta = db.Column(db.String(20), nullable=True)
    creado_en = db.Column(db.DateTime, server_default=db.func.now())


class PvoOrdenMantenimiento(db.Model):
    __tablename__ = 'pvo_ordenes_mantenimiento'

    id_orden = db.Column(db.Integer, primary_key=True, autoincrement=True)
    no_orden_oficial = db.Column(db.String(30), unique=True, nullable=False)
    id_autobus = db.Column(db.Integer, db.ForeignKey('cat_autobuses.id_autobus'), nullable=False)
    id_ruta = db.Column(db.Integer, db.ForeignKey('cat_rutas.id_ruta'), nullable=False)
    tipo_mantenimiento = db.Column(db.String(50), nullable=True)
    subtipo_servicio = db.Column(db.String(50), nullable=True)
    estatus_orden = db.Column(db.String(30), nullable=True)
    fecha_hora_ingreso = db.Column(db.DateTime, nullable=True)
    fecha_hora_egreso = db.Column(db.DateTime, nullable=True)
    km_en_ingreso = db.Column(db.Integer, nullable=True)
    tiempo_total_taller = db.Column(db.Interval, nullable=True)
    falla_reportada = db.Column(db.Text, nullable=True)
    observaciones_diagnostico = db.Column(db.Text, nullable=True)
    creado_en = db.Column(db.DateTime, server_default=db.func.now())

    # Relaciones
    firmas = db.relationship('PvoControlFirmas', backref='orden_mantenimiento', uselist=False, lazy=True)


class PvoControlFirmas(db.Model):
    __tablename__ = 'pvo_control_firmas'

    id_firma = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_orden = db.Column(db.Integer, db.ForeignKey('pvo_ordenes_mantenimiento.id_orden'), nullable=False)
    credencial_operador = db.Column(db.Integer, db.ForeignKey('cat_personal_rtp.credencial'), nullable=True)
    credencial_jefe_abre = db.Column(db.Integer, db.ForeignKey('cat_personal_rtp.credencial'), nullable=True)
    credencial_jefe_cierra = db.Column(db.Integer, db.ForeignKey('cat_personal_rtp.credencial'), nullable=True)
    credencial_diagnosticador = db.Column(db.Integer, db.ForeignKey('cat_personal_rtp.credencial'), nullable=True)

    # Relaciones ORM para consultar los datos del personal firmado fácilmente
    operador = db.relationship('CatPersonalRtp', foreign_keys=[credencial_operador])
    jefe_abre = db.relationship('CatPersonalRtp', foreign_keys=[credencial_jefe_abre])
    jefe_cierra = db.relationship('CatPersonalRtp', foreign_keys=[credencial_jefe_cierra])
    diagnosticador = db.relationship('CatPersonalRtp', foreign_keys=[credencial_diagnosticador])