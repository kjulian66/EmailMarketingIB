from fastapi import FastAPI
from app.database import Base, engine
from app import models
from app.routes import router

app = FastAPI()

app.include_router(router)

Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"mensaje": "API funcionando"}