from flask import Blueprint, request, jsonify
from app.database import db
from app.models import (
    PvoOrdenMantenimiento, 
    OpHistorialKilometraje, 
    PvoControlFirmas, 
    CatAutobus
)
from datetime import datetime

ordenes_bp = Blueprint('ordenes', __name__)

@ordenes_bp.route('/', methods=['GET'])
def get_ordenes():
    ordenes = PvoOrdenMantenimiento.query.order_by(PvoOrdenMantenimiento.creado_en.desc()).all()
    resultado = []
    for o in ordenes:
        resultado.append({
            "id_orden": o.id_orden,
            "no_orden_oficial": o.no_orden_oficial,
            "eco_numero": o.autobus.eco_numero if o.autobus else None,
            "codigo_ruta": o.ruta.codigo_ruta if o.ruta else None,
            "tipo_mantenimiento": o.tipo_mantenimiento,
            "subtipo_servicio": o.subtipo_servicio,
            "estatus_orden": o.estatus_orden,
            "km_en_ingreso": o.km_en_ingreso,
            "falla_reportada": o.falla_reportada,
            "firmas": {
                "operador": o.firmas.credencial_operador if o.firmas else None,
                "jefe_abre": o.firmas.credencial_jefe_abre if o.firmas else None,
                "jefe_cierra": o.firmas.credencial_jefe_cierra if o.firmas else None,
                "diagnosticador": o.firmas.credencial_diagnosticador if o.firmas else None,
            } if o.firmas else None
        })
    return jsonify(resultado), 200


@ordenes_bp.route('/', methods=['POST'])
def crear_orden_mantenimiento():
    data = request.get_json() or {}

    # Validación de campos requeridos
    no_orden_oficial = data.get('no_orden_oficial')
    id_autobus = data.get('id_autobus')
    id_ruta = data.get('id_ruta')

    if not no_orden_oficial or not id_autobus or not id_ruta:
        return jsonify({"error": "Faltan campos obligatorios: no_orden_oficial, id_autobus, id_ruta"}), 400

    try:
        # 1. Crear la Orden de Mantenimiento
        nueva_orden = PvoOrdenMantenimiento(
            no_orden_oficial=no_orden_oficial,
            id_autobus=id_autobus,
            id_ruta=id_ruta,
            tipo_mantenimiento=data.get('tipo_mantenimiento', 'PREVENTIVO'),
            subtipo_servicio=data.get('subtipo_servicio'),
            estatus_orden=data.get('estatus_orden', 'EN_PROCESO'),
            km_en_ingreso=data.get('km_en_ingreso'),
            falla_reportada=data.get('falla_reportada'),
            observaciones_diagnostico=data.get('observaciones_diagnostico'),
            fecha_hora_ingreso=datetime.utcnow()
        )
        db.session.add(nueva_orden)
        db.session.flush()  # Obtiene id_orden generado antes del commit

        # 2. Registrar el Historial de Kilometraje (incluye color_alerta enviado por el frontend)
        if data.get('km_en_ingreso') is not None:
            historial_km = OpHistorialKilometraje(
                id_autobus=id_autobus,
                fecha_registro=datetime.utcnow().date(),
                odometro_actual=data.get('km_en_ingreso'),
                autofare=data.get('autofare'),
                color_alerta=data.get('color_alerta', 'VERDE')
            )
            db.session.add(historial_km)

        # 3. Registrar las Firmas asociadas a la Orden
        firmas_data = data.get('firmas', {})
        control_firmas = PvoControlFirmas(
            id_orden=nueva_orden.id_orden,
            credencial_operador=firmas_data.get('credencial_operador'),
            credencial_jefe_abre=firmas_data.get('credencial_jefe_abre'),
            credencial_jefe_cierra=firmas_data.get('credencial_jefe_cierra'),
            credencial_diagnosticador=firmas_data.get('credencial_diagnosticador')
        )
        db.session.add(control_firmas)

        # Confirmar la transacción
        db.session.commit()

        return jsonify({
            "mensaje": "Orden de mantenimiento registrada exitosamente",
            "id_orden": nueva_orden.id_orden,
            "no_orden_oficial": nueva_orden.no_orden_oficial
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al procesar la solicitud", "detalle": str(e)}), 500