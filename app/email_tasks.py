from celery import shared_task
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Campaign
from app.campaign_service import run_campaign_steps_logic


@shared_task
def run_campaign_async(campaign_id):
    print(f"🚀 Ejecutando campaña async {campaign_id}")
    return run_campaign_steps_logic(campaign_id)


@shared_task
def run_all_campaigns():
    db: Session = SessionLocal()

    try:
        campaigns = db.query(Campaign).all()

        for campaign in campaigns:
            print(f"🚀 Ejecutando campaña {campaign.id} (auto)")
            run_campaign_steps_logic(campaign.id)

    finally:
        db.close()
