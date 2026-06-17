from fastapi import APIRouter, UploadFile, File
from app.database import SessionLocal
from app.models import Contact, Campaign, CampaignStep, ContactCampaign, Tag, contact_tags
from app.schemas import ContactCreate
from app.campaign_service import run_campaign_steps_logic
from app.email_tasks import run_campaign_async
from datetime import datetime
import csv
from io import StringIO
import dns.resolver
from fastapi import HTTPException


router = APIRouter()


# ✅ SUBSCRIBE
@router.post("/subscribe")
def subscribe(email: str):
    db = SessionLocal()

    email = email.strip().lower()
    contacto = db.query(Contact).filter(Contact.email == email).first()

    if contacto:
        contacto.is_subscribed = True
    else:
        db.add(Contact(email=email))

    db.commit()
    db.close()

    return {"message": "✅ email suscripto"}


# ✅ DESUBSCRIBE
@router.get("/unsubscribe")
def unsubscribe(token: str):
    db = SessionLocal()

    try:
        contact = db.query(Contact).filter_by(unsubscribe_token=token).first()

        if not contact:
            return {"message": "Token inválido"}

        contact.is_subscribed = False
        db.commit()

        return {"message": "✅ Te desuscribiste correctamente"}

    finally:
        db.close()


# ✅ CREAR CAMPAÑA
@router.post("/campaign")
def create_campaign(name: str, subject: str):
    db = SessionLocal()

    campaign = Campaign(
        name=name,
        subject=subject 
    )

    db.add(campaign)
    db.commit()

    result = {"message": "✅ campaña creada", "id": campaign.id}

    db.close()
    return result


# ✅ CREAR STEP
@router.post("/campaign-step")
def create_campaign_step(
        campaign_id: int,
        subject: str,        
        content: str,
        delay_days: int,
        order_index: int
    ):

    db = SessionLocal()

    step = CampaignStep(
        campaign_id=campaign_id,
        subject=subject,      
        content=content,
        delay_days=delay_days,
        order_index=order_index
    )

    db.add(step)
    db.commit()

    result = {"message": "✅ step creado", "id": step.id}

    db.close()
    return result


# ✅ INICIAR CAMPAÑA (CON TAGS)
@router.post("/start-campaign")
def start_campaign(campaign_id: int, tag_ids: list[int] = []):
    db = SessionLocal()

    query = db.query(Contact).filter(Contact.is_subscribed == True)

    # 🔥 FIX IMPORTANTE
    if tag_ids:
        query = query.join(contact_tags, Contact.id == contact_tags.c.contact_id)
        query = query.filter(contact_tags.c.tag_id.in_(tag_ids))

    contactos = query.all()

    count = 0

    for c in contactos:
        existing = db.query(ContactCampaign).filter_by(
            contact_id=c.id,
            campaign_id=campaign_id
        ).first()

        if existing:
            continue

        cc = ContactCampaign(
            contact_id=c.id,
            campaign_id=campaign_id,
            started_at=datetime.utcnow()
        )

        db.add(cc)
        db.commit()
        count += 1

    db.close()
    return {"message": f"✅ campaña iniciada para {count} contactos"}


# ✅ EJECUTAR CAMPAÑA
@router.post("/run-campaign-steps")
def run_campaign_steps(campaign_id: int):
    total = run_campaign_steps_logic(campaign_id)
    return {"message": f"✅ enviados {total} emails"}


# ✅ ASYNC
@router.post("/run-campaign-async")
def run_campaign_async_endpoint(campaign_id: int):
    run_campaign_async.delay(campaign_id)
    return {"message": "✅ campaña encolada"}


# ✅ SUBIR CSV
@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):

    db = SessionLocal()

    content = await file.read()
    decoded = content.decode("utf-8")

    reader = csv.reader(StringIO(decoded))

    next(reader, None)

    nuevos = 0
    duplicados = 0
    invalidos = 0

    for row in reader:
        if not row:
            continue

        email = row[0].strip().lower()

        if not email:
            continue

        if not dominio_valido(email):
            invalidos += 1
            continue

        existing = db.query(Contact).filter(Contact.email == email).first()

        if existing:
            duplicados += 1
            continue

        db.add(Contact(email=email))
        nuevos += 1

    db.commit()
    db.close()

    return {
        "message": f"✅ {nuevos} contactos cargados | ⚠ {duplicados} duplicados | ❌ {invalidos} inválidos"
    }


# ✅ CREAR TAG
@router.post("/tag")
def create_tag(name: str):
    db = SessionLocal()

    tag = Tag(name=name)
    db.add(tag)
    db.commit()

    db.close()
    return {"message": "✅ tag creado"}


# ✅ ASIGNAR TAG A CONTACTO (FIX IMPORTANTE)
@router.post("/assign-tag")
def assign_tag(contact_id: int, tag_id: int):

    db = SessionLocal()

    exists = db.execute(
        contact_tags.select().where(
            (contact_tags.c.contact_id == contact_id) &
            (contact_tags.c.tag_id == tag_id)
        )
    ).first()

    if exists:
        db.close()
        return {"message": "⚠ ya asignado"}

    db.execute(
        contact_tags.insert().values(
            contact_id=contact_id,
            tag_id=tag_id
        )
    )

    db.commit()
    db.close()

    return {"message": "✅ asignado"}



# ✅ LISTAR CONTACTOS

@router.get("/contacts")
def get_contacts():
    db = SessionLocal()

    contacts = db.query(Contact).all()

    result = []

    for c in contacts:

        tag_names = [
            t.name for t in c.tags
        ]

        result.append({
            "id": c.id,
            "email": c.email,
            "is_subscribed": c.is_subscribed,
            "tags": tag_names
        })

    db.close()

    return result



# ✅ CREAR CONTACTO
@router.post("/contacts")
def create_contact(data: ContactCreate):

    db = SessionLocal()

    try:
        if not dominio_valido(data.email):
            raise HTTPException(
                status_code=400,
                detail="❌ dominio no válido"
            )

        existing = db.query(Contact).filter(Contact.email == data.email).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail="⚠ El contacto ya fue cargado"
            )

        nuevo = Contact(
            email=data.email,
            is_subscribed=True
        )

        db.add(nuevo)
        db.commit()
        db.refresh(nuevo)

        return {
            "id": nuevo.id,
            "email": nuevo.email,
            "is_subscribed": nuevo.is_subscribed
        }

    finally:
        db.close()


@router.get("/tags")
def get_tags():
    db = SessionLocal()
    tags = db.query(Tag).all()
    db.close()

    return [{"id": t.id, "name": t.name} for t in tags]


def dominio_valido(email):
    domain = email.split("@")[1]

    try:
        dns.resolver.resolve(domain, 'A')
        dns.resolver.resolve(domain, 'MX')
        return True
    except:
        return False
    

@router.post("/unsubscribe-by-id")
def unsubscribe_by_id(contact_id: int):
    db = SessionLocal()

    try:
        contact = db.query(Contact).filter_by(id=contact_id).first()

        if not contact:
            return {"message": "❌ contacto no encontrado"}

        contact.is_subscribed = False
        db.commit()

        return {"message": "✅ desuscripto"}

    finally:
        db.close()


@router.post("/subscribe-by-id")
def subscribe_by_id(contact_id: int):
    db = SessionLocal()

    try:
        contact = db.query(Contact).filter_by(id=contact_id).first()

        if not contact:
            return {"message": "❌ contacto no encontrado"}

        contact.is_subscribed = True
        db.commit()

        return {"message": "✅ suscripto"}

    finally:
        db.close()

@router.post("/upload-tags")
async def upload_tags(file: UploadFile = File(...)):

    db = SessionLocal()

    content = await file.read()
    decoded = content.decode("utf-8")

    reader = csv.reader(StringIO(decoded))

    next(reader, None)  # salta header

    nuevos = 0
    duplicados = 0

    for row in reader:
        if not row:
            continue

        name = row[0].strip().lower()

        if not name:
            continue

        existing = db.query(Tag).filter(Tag.name == name).first()

        if existing:
            duplicados += 1
            continue

        db.add(Tag(name=name))
        nuevos += 1

    db.commit()
    db.close()

    return {
        "message": f"✅ {nuevos} tags creados | ⚠ {duplicados} duplicados"
    }

@router.delete("/tag")
def delete_tag(name: str):

    db = SessionLocal()

    tag = db.query(Tag).filter(Tag.name == name).first()

    if not tag:
        db.close()
        return {"message": "❌ no encontrado"}

    # ✅ 1. ELIMINAR RELACIONES (MUY IMPORTANTE)
    db.execute(
        contact_tags.delete().where(contact_tags.c.tag_id == tag.id)
    )

    # ✅ 2. ELIMINAR TAG
    db.delete(tag)

    # ✅ 3. GUARDAR CAMBIOS
    db.commit()

    db.close()

    return {"message": "✅ eliminado"}
