from app.database import Base, engine
from app import models

# crea todas las tablas
Base.metadata.create_all(bind=engine)

print("✅ Tabla contacts creada correctamente")