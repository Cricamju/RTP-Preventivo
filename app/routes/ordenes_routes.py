from flask import Blueprint, request, jsonify
from datetime import datetime
from app.database import db
from app.models import (
    PvoOrdenMantenimiento,
    OpHistorialKilometraje,
    PvoControlFirmas,
    CatAutobus,
    CatRuta
)

ordenes_bp = Blueprint('ordenes', __name__)

# ==========================================
# 1. CREAR ORDEN (TRANSACCIÓN ATÓMICA)
# ==========================================
@ordenes_bp.route('/', methods=['POST'])
def crear_orden():
    data = request.get_json() or {}

    # Validaciones mínimas requeridas
    if not data.get('no_orden_oficial') or not data.get('id_autobus'):
        return jsonify({
            "error": "Datos incompletos",
            "mensaje": "Se requieren los campos 'no_orden_oficial' e 'id_autobus'."
        }), 400

    try:
        # -----------------------------------------------------------
        # INICIO DE TRANSACCIÓN ATÓMICA
        # -----------------------------------------------------------

        # Paso A: Insertar la Orden de Mantenimiento
        nueva_orden = PvoOrdenMantenimiento(
            no_orden_oficial=data.get('no_orden_oficial'),
            id_autobus=data.get('id_autobus'),
            id_ruta=data.get('id_ruta'),
            tipo_mantenimiento=data.get('tipo_mantenimiento', 'PREVENTIVO'),
            subtipo_servicio=data.get('subtipo_servicio'),
            estatus_orden=data.get('estatus_orden', 'ABIERTA'),
            km_en_ingreso=data.get('km_en_ingreso', 0),
            falla_reportada=data.get('falla_reportada'),
            observaciones_diagnostico=data.get('observaciones_diagnostico')
        )
        db.session.add(nueva_orden)
        
        # Flush para obtener el 'id_orden' autogenerado sin hacer commit aún
        db.session.flush()

        # Paso B: Insertar Historial de Odómetro/Kilometraje (si se especificó km_en_ingreso)
        if data.get('km_en_ingreso'):
            nuevo_historial = OpHistorialKilometraje(
                id_autobus=data.get('id_autobus'),
                fecha_registro=datetime.utcnow().date(),
                odometro_actual=data.get('km_en_ingreso'),
                autofare=data.get('autofare'),
                color_alerta=data.get('color_alerta', 'VERDE')
            )
            db.session.add(nuevo_historial)

        # Paso C: Insertar Registro de Control de Firmas
        firmas_data = data.get('firmas', {})
        nuevas_firmas = PvoControlFirmas(
            id_orden=nueva_orden.id_orden,
            credencial_operador=firmas_data.get('credencial_operador'),
            credencial_jefe_abre=firmas_data.get('credencial_jefe_abre'),
            credencial_jefe_cierra=firmas_data.get('credencial_jefe_cierra'),
            credencial_diagnosticador=firmas_data.get('credencial_diagnosticador')
        )
        db.session.add(nuevas_firmas)

        # Confirmación final en PostgreSQL
        db.session.commit()
        # -----------------------------------------------------------

        return jsonify({
            "mensaje": "Orden de mantenimiento creada exitosamente",
            "id_orden": nueva_orden.id_orden,
            "no_orden_oficial": nueva_orden.no_orden_oficial
        }), 201

    except Exception as e:
        # Reversión total ante cualquier falla de integridad/DB
        db.session.rollback()
        return jsonify({
            "error": "Error al procesar la transacción",
            "detalle": str(e)
        }), 500


# ==========================================
# 2. LISTAR Y CONSULTAR ÓRDENES
# ==========================================
@ordenes_bp.route('/', methods=['GET'])
def listar_ordenes():
    ordenes = PvoOrdenMantenimiento.query.all()
    resultado = []
    
    for o in ordenes:
        resultado.append({
            "id_orden": o.id_orden,
            "no_orden_oficial": o.no_orden_oficial,
            "id_autobus": o.id_autobus,
            "tipo_mantenimiento": o.tipo_mantenimiento,
            "estatus_orden": o.estatus_orden,
            "km_en_ingreso": o.km_en_ingreso,
            "falla_reportada": o.falla_reportada
        })
        
    return jsonify(resultado), 200


@ordenes_bp.route('/<int:id_orden>', methods=['GET'])
def obtener_orden(id_orden):
    orden = PvoOrdenMantenimiento.query.get(id_orden)
    if not orden:
        return jsonify({"error": "Orden no encontrada"}), 404

    return jsonify({
        "id_orden": orden.id_orden,
        "no_orden_oficial": orden.no_orden_oficial,
        "id_autobus": orden.id_autobus,
        "id_ruta": orden.id_ruta,
        "tipo_mantenimiento": orden.tipo_mantenimiento,
        "subtipo_servicio": orden.subtipo_servicio,
        "estatus_orden": orden.estatus_orden,
        "km_en_ingreso": orden.km_en_ingreso,
        "falla_reportada": orden.falla_reportada,
        "observaciones_diagnostico": orden.observaciones_diagnostico
    }), 200