from celery import Celery

celery = Celery(
    "worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

# ✅ registrar tareas
celery.conf.imports = (
    "app.email_tasks",
)

# ✅ scheduler automático (Celery Beat)
celery.conf.beat_schedule = {
    "run-all-campaigns-every-30-seconds": {
        "task": "app.email_tasks.run_all_campaigns",
        "schedule": 300.0,
    }
}
