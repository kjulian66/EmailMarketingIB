@echo off
chcp 65001 >nul

echo ============================
echo INICIANDO SISTEMA COMPLETO
echo ============================

echo.
echo Iniciando Redis...

docker start redis-container >nul 2>&1 || (
    echo Creando contenedor Redis...
    docker run -d -p 6379:6379 --name redis-container --restart unless-stopped redis
)

echo.
echo Iniciando FastAPI...
start cmd /k "call venv\Scripts\activate && uvicorn app.main:app --reload"

timeout /t 3 >nul

echo.
echo Iniciando Celery Worker...
start cmd /k "call venv\Scripts\activate && celery -A app.celery_app:celery worker --loglevel=info --pool=solo"

timeout /t 3 >nul

echo.
echo Iniciando Celery Beat...
start cmd /k "call venv\Scripts\activate && celery -A app.celery_app:celery beat --loglevel=info"

echo.
echo SISTEMA LISTO
timeout /t 3 >nul
exit
