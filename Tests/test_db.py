from app.database import engine

try:
    conn = engine.connect()
    print("✅ Conectado correctamente a PostgreSQL")
    conn.close()
except Exception as e:
    print("❌ Error:", e)