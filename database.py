from flask_sqlalchemy import SQLAlchemy

# Creamos la instancia de la base de datos aquí, vacía.
# Esto evita que 'models.py' y 'app.py' se confundan al intentar importarse mutuamente.
db = SQLAlchemy()