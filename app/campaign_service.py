from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import CampaignStep, ContactCampaign, EmailLog
from app.email_service import send_email
from datetime import datetime, timedelta


def run_campaign_steps_logic(campaign_id: int):
    db: Session = SessionLocal()

    try:
        steps = db.query(CampaignStep)\
            .filter_by(campaign_id=campaign_id)\
            .order_by(CampaignStep.order_index)\
            .all()

        contact_campaigns = db.query(ContactCampaign)\
            .filter_by(campaign_id=campaign_id)\
            .all()

        total_sent = 0
        now = datetime.utcnow()

        for cc in contact_campaigns:

            contacto = cc.contact

            if not contacto or not contacto.is_subscribed:
                continue

            # 🔥 normalización (evita bugs)
            email = contacto.email.strip().lower()

            for step in steps:

                send_time = cc.started_at + timedelta(days=step.delay_days)

                if now < send_time:
                    continue

                # 🔥 control de duplicados
                existing_log = db.query(EmailLog).filter_by(
                    contact_email=email,
                    campaign_step_id=step.id
                ).first()

                if existing_log:
                    continue

                success = send_email(
                    email,
                    contacto.unsubscribe_token,
                    step.subject,
                    step.content
                )

                # ✅ SOLO guarda si realmente se envió
                if success:
                    log = EmailLog(
                        contact_email=email,
                        campaign_step_id=step.id,
                        status="sent"
                    )

                    db.add(log)
                    db.commit()

                    total_sent += 1

        print(f"✅ enviados {total_sent} emails")
        return total_sent

    finally:
        db.close()