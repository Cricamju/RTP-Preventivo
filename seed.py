# seed.py
import os
import pandas as pd
from datetime import datetime
from app import create_app
from app.database import db
from app.models import (
    Usuario, CatAutobus, CatRuta, CatPersonalRtp, 
    OpHistorialKilometraje, PvoOrdenMantenimiento, PvoControlFirmas
)

app = create_app()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EXCEL_FILE = os.path.join(BASE_DIR, "RAT Y PVO  07-07-2026.xlsx")

def cargar_datos():
    with app.app_context():
        print("🚀 Iniciando proceso de carga inicial e infraestructura RBAC...")
        
        # ----------------------------------------------------
        # 1. SEMBRADO DE USUARIOS BASE (RBAC)
        # ----------------------------------------------------
        print("👤 Sembrando usuarios base (sis_usuarios)...")
        usuarios_iniciales = [
            {
                "username_tag": "admin_test",
                "email": "admin@rtp.gob.mx",
                "nombre_completo": "Administrador de Sistema",
                "rol": "Administrador",
                "password": "123098456"
            },
            {
                "username_tag": "editor_test",
                "email": "editor@rtp.gob.mx",
                "nombre_completo": "Capturista Operativo Taller",
                "rol": "Capturista",
                "password": "123098456"
            },
            {
                "username_tag": "consulta_test",
                "email": "consulta@rtp.gob.mx",
                "nombre_completo": "Consultor de Reportes y Tableros",
                "rol": "Consultor",
                "password": "123098456"
            }
        ]

        for user_data in usuarios_iniciales:
            if not Usuario.query.filter_by(username_tag=user_data["username_tag"]).first():
                nuevo_usuario = Usuario(
                    username_tag=user_data["username_tag"],
                    email=user_data["email"],
                    nombre_completo=user_data["nombre_completo"],
                    rol=user_data["rol"]
                )
                nuevo_usuario.set_password(user_data["password"])
                db.session.add(nuevo_usuario)

        db.session.commit()

        # ----------------------------------------------------
        # 2. CARGA DE EXCEL (CATÁLOGOS Y OPERACIONES)
        # ----------------------------------------------------
        if os.path.exists(EXCEL_FILE):
            print("📊 Procesando archivo Excel de operaciones...")
            df_excel = pd.read_excel(EXCEL_FILE)

            # Carga Autobuses
            if 'eco_numero' in df_excel.columns:
                print("  🚌 Procesando autobuses...")
                autobuses_unicos = df_excel[['eco_numero', 'placa', 'modelo', 'ano_fabricacion']].drop_duplicates()
                for _, row in autobuses_unicos.iterrows():
                    if not CatAutobus.query.filter_by(eco_numero=str(row['eco_numero'])).first():
                        bus = CatAutobus(
                            eco_numero=str(row['eco_numero']),
                            placa=str(row['placa']),
                            modelo=str(row.get('modelo', '')),
                            ano_fabricacion=int(row['ano_fabricacion']) if pd.notnull(row.get('ano_fabricacion')) else None,
                            activo=True
                        )
                        db.session.add(bus)
                db.session.commit()

            # Carga Rutas
            if 'codigo_ruta' in df_excel.columns:
                print("  🗺️ Procesando rutas...")
                rutas_unicas = df_excel[['codigo_ruta', 'descripcion']].drop_duplicates()
                for _, row in rutas_unicas.iterrows():
                    if not CatRuta.query.filter_by(codigo_ruta=str(row['codigo_ruta'])).first():
                        ruta = CatRuta(
                            codigo_ruta=str(row['codigo_ruta']),
                            descripcion=str(row.get('descripcion', ''))
                        )
                        db.session.add(ruta)
                db.session.commit()

            # Carga Historial Kilometraje y Órdenes
            print("  📈 Procesando historial de kilometraje y órdenes...")
            for _, row in df_excel.iterrows():
                bus = CatAutobus.query.filter_by(eco_numero=str(row['eco_numero'])).first()
                ruta = CatRuta.query.filter_by(codigo_ruta=str(row['codigo_ruta'])).first()

                if bus:
                    historial = OpHistorialKilometraje(
                        id_autobus=bus.id_autobus,
                        fecha_registro=pd.to_datetime(row['fecha']).date() if pd.notnull(row.get('fecha')) else datetime.utcnow().date(),
                        odometro_actual=int(row['odometro_actual']) if pd.notnull(row.get('odometro_actual')) else 0,
                        autofare=int(row['autofare']) if pd.notnull(row.get('autofare')) else None,
                        color_alerta=str(row.get('color_alerta', 'VERDE'))
                    )
                    db.session.add(historial)

                    if pd.notnull(row.get('no_orden_oficial')):
                        orden = PvoOrdenMantenimiento(
                            no_orden_oficial=str(row['no_orden_oficial']),
                            id_autobus=bus.id_autobus,
                            id_ruta=ruta.id_ruta if ruta else None,
                            tipo_mantenimiento=str(row.get('tipo_mantenimiento', 'PREVENTIVO')),
                            subtipo_servicio=str(row.get('subtipo_servicio', '')),
                            estatus_orden=str(row.get('estatus_orden', 'EN_PROCESO')),
                            km_en_ingreso=int(row.get('km_en_ingreso', 0)),
                            falla_reportada=str(row.get('falla_reportada', ''))
                        )
                        db.session.add(orden)

            db.session.commit()
            print("  ✓ Carga del Excel completada.")

        print("✅ Proceso de sembrado finalizado con éxito.")

if __name__ == '__main__':
    cargar_datos()