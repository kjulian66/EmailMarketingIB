from fastapi import APIRouter, UploadFile, File
from app.database import SessionLocal
from app.models import Contact, Campaign, CampaignStep, ContactCampaign
from app.campaign_service import run_campaign_steps_logic
from app.email_tasks import run_campaign_async
from datetime import datetime
import csv
from io import StringIO

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


# ✅ UNSUBSCRIBE
@router.get("/unsubscribe")
def unsubscribe(token: str):
    db = SessionLocal()

    contacto = db.query(Contact).filter_by(
        unsubscribe_token=token
    ).first()

    if contacto:
        contacto.is_subscribed = False
        db.commit()

    db.close()
    return {"message": "✅ desuscripto"}


# ✅ CREAR CAMPAÑA
@router.post("/campaign")
def create_campaign(name: str, subject: str, content: str):
    db = SessionLocal()

    campaign = Campaign(
        name=name,
        subject=subject,
        content=content
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


# ✅ INICIAR CAMPAÑA
@router.post("/start-campaign")
def start_campaign(campaign_id: int):
    db = SessionLocal()

    contactos = db.query(Contact).filter_by(is_subscribed=True).all()
    count = 0

    for c in contactos:
        existing = db.query(ContactCampaign).filter_by(
            contact_email=c.email,
            campaign_id=campaign_id
        ).first()

        if existing:
            continue

        cc = ContactCampaign(
            contact_email=c.email,
            campaign_id=campaign_id,
            started_at=datetime.utcnow()
        )

        db.add(cc)
        db.commit()
        count += 1

    db.close()
    return {"message": f"✅ campaña iniciada para {count} contactos"}


# ✅ EJECUTAR CAMPAÑA (SYNC)
@router.post("/run-campaign-steps")
def run_campaign_steps(campaign_id: int):
    total = run_campaign_steps_logic(campaign_id)
    return {"message": f"✅ enviados {total} emails"}


# ✅ EJECUTAR CAMPAÑA (ASYNC - CELERY)
@router.post("/run-campaign-async")
def run_campaign_async_endpoint(campaign_id: int):
    run_campaign_async.delay(campaign_id)
    return {"message": "✅ campaña encolada"}


# ✅ CARGA CSV
@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    db = SessionLocal()

    content = await file.read()
    decoded = content.decode("utf-8")

    reader = csv.reader(StringIO(decoded))

    count = 0

    for row in reader:
        if not row:
            continue

        email = row[0].strip().lower()

        if not email:
            continue

        existing = db.query(Contact).filter(Contact.email == email).first()

        if existing:
            existing.is_subscribed = True
        else:
            db.add(Contact(email=email))

        count += 1

    db.commit()
    db.close()

    return {"message": f"✅ {count} contactos cargados"}