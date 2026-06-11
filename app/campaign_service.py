from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import CampaignStep, ContactCampaign, EmailLog
from app.email_service import send_email
from datetime import datetime, timedelta
from sqlalchemy.orm import relationship





def run_campaign_steps_logic(campaign_id: int):
    db: Session = SessionLocal()

    try:
        steps = db.query(CampaignStep) \
            .filter_by(campaign_id=campaign_id) \
            .order_by(CampaignStep.order_index) \
            .all()

        contact_campaigns = db.query(ContactCampaign) \
            .filter_by(campaign_id=campaign_id) \
            .all()

        total_sent = 0
        now = datetime.utcnow()

        for cc in contact_campaigns:

            contacto = cc.contact

            if not contacto or not contacto.is_subscribed:
                continue

            email = contacto.email.strip().lower()

            for step in steps:

                if not cc.started_at:
                    cc.started_at = now

                send_time = cc.started_at + timedelta(days=step.delay_days or 0)

                # mantener control de tiempo (opcional activar/desactivar)
                # if now < send_time:
                #     continue

                existing_log = db.query(EmailLog).filter_by(
                    contact_id=cc.contact_id,
                    campaign_step_id=step.id
                ).first()

                if existing_log:
                    continue

                # ✅ subject robusto (no rompe nada)
                subject = step.subject or cc.campaign.subject or "Interborders"

                success = send_email(
                    email,
                    contacto.unsubscribe_token,
                    subject,
                    step.content
                )

                if success:
                    log = EmailLog(
                        contact_id=cc.contact_id,
                        campaign_step_id=step.id,
                        status="sent"
                    )

                    db.add(log)
                    total_sent += 1

        db.commit()
        return total_sent

    except Exception as e:
        db.rollback()
        raise

    finally:
        db.close()


