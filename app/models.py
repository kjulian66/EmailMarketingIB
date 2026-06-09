from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base


# 🔥 TABLA INTERMEDIA (MUCHOS A MUCHOS)
contact_tags = Table(
    "contact_tags",
    Base.metadata,
    Column("contact_email", String, ForeignKey("contacts.email")),
    Column("tag_id", Integer, ForeignKey("tags.id"))
)


# 🔹 TAGS
class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)


# 🔹 CONTACTOS
class Contact(Base):
    __tablename__ = "contacts"

    email = Column(String, primary_key=True, index=True)
    is_subscribed = Column(Boolean, default=True)
    unsubscribe_token = Column(String, default=lambda: str(uuid.uuid4()))

    # ✅ campañas
    contact_campaigns = relationship("ContactCampaign", back_populates="contact")

    # ✅ 🔥 TAGS
    tags = relationship("Tag", secondary=contact_tags)


# 🔹 CAMPAÑAS
class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

    subject = Column(String)
    content = Column(String)

    steps = relationship("CampaignStep", back_populates="campaign")
    contact_campaigns = relationship("ContactCampaign", back_populates="campaign")


# 🔹 STEPS
class CampaignStep(Base):
    __tablename__ = "campaign_steps"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))

    subject = Column(String)
    content = Column(String)
    delay_days = Column(Integer, default=0)
    order_index = Column(Integer)

    campaign = relationship("Campaign", back_populates="steps")


# 🔹 EMAIL LOGS
class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True, index=True)

    contact_email = Column(String, ForeignKey("contacts.email"))
    campaign_step_id = Column(Integer, ForeignKey("campaign_steps.id"))

    status = Column(String)
    sent_at = Column(DateTime, default=datetime.utcnow)

    contact = relationship("Contact")
    campaign_step = relationship("CampaignStep")


# 🔹 RELACIÓN CONTACTO ↔ CAMPAÑA
class ContactCampaign(Base):
    __tablename__ = "contact_campaigns"

    id = Column(Integer, primary_key=True, index=True)

    contact_email = Column(String, ForeignKey("contacts.email"))
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))

    started_at = Column(DateTime, default=datetime.utcnow)

    contact = relationship("Contact", back_populates="contact_campaigns")
    campaign = relationship("Campaign", back_populates="contact_campaigns")