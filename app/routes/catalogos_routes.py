from flask import Blueprint, jsonify
from app.models import CatAutobus, CatRuta, CatPersonalRtp

catalogos_bp = Blueprint('catalogos', __name__)

@catalogos_bp.route('/autobuses', methods=['GET'])
def get_autobuses():
    autobuses = CatAutobus.query.filter_by(activo=True).all()
    resultado = [
        {
            "id_autobus": a.id_autobus,
            "eco_numero": a.eco_numero,
            "placa": a.placa,
            "modelo": a.modelo,
            "ano_fabricacion": a.ano_fabricacion
        } for a in autobuses
    ]
    return jsonify(resultado), 200

@catalogos_bp.route('/rutas', methods=['GET'])
def get_rutas():
    rutas = CatRuta.query.all()
    resultado = [
        {
            "id_ruta": r.id_ruta,
            "codigo_ruta": r.codigo_ruta,
            "descripcion": r.descripcion
        } for r in rutas
    ]
    return jsonify(resultado), 200

@catalogos_bp.route('/personal', methods=['GET'])
def get_personal():
    personal = CatPersonalRtp.query.all()
    resultado = [
        {
            "credencial": p.credencial,
            "nombre": p.nombre,
            "adscripcion": p.adscripcion,
            "categoria": p.categoria,
            "estatus": p.estatus
        } for p in personal
    ]
    return jsonify(resultado), 200