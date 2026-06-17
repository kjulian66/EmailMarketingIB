from fastapi import FastAPI
from app.database import Base, engine
from app import models
from app.routes import router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ✅ para desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(router)

Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"mensaje": "API funcionando"}