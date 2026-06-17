from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base


# 🔥 MANY TO MANY RELATION (contacts ↔ tags)
contact_tags = Table(
    "contact_tags",
    Base.metadata,
    Column("contact_id", Integer, ForeignKey("contacts.id")),
    Column("tag_id", Integer, ForeignKey("tags.id"))
)


# ✅ TAGS
class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)


# ✅ CONTACTS
class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    is_subscribed = Column(Boolean, default=True)
    unsubscribe_token = Column(String, default=lambda: str(uuid.uuid4()))

    tags = relationship("Tag", secondary=contact_tags)
    contact_campaigns = relationship("ContactCampaign", back_populates="contact")


# ✅ TEMPLATES (mantengo porque vos lo tenías, después lo vas a borrar)
class EmailTemplate(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String)
    subject = Column(String)

    html = Column(String)
    css = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)


# ✅ CAMPAIGNS
class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String)
    subject = Column(String)

    template_id = Column(Integer, ForeignKey("templates.id"))

    status = Column(String, default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)

    template = relationship("EmailTemplate")
    steps = relationship("CampaignStep", back_populates="campaign")
    contact_campaigns = relationship("ContactCampaign", back_populates="campaign")
    schedules = relationship("CampaignSchedule", back_populates="campaign")


# ✅ CAMPAIGN STEPS (templates reales)
class CampaignStep(Base):
    __tablename__ = "campaign_steps"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))

    subject = Column(String, nullable=True)
    content = Column(String)

    delay_days = Column(Integer, default=0)
    order_index = Column(Integer)

    campaign = relationship("Campaign", back_populates="steps")


# ✅ EMAIL LOGS
class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True, index=True)

    contact_id = Column(Integer, ForeignKey("contacts.id"))
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    campaign_step_id = Column(Integer, ForeignKey("campaign_steps.id"))

    status = Column(String)
    sent_at = Column(DateTime, default=datetime.utcnow)

    contact = relationship("Contact")
    campaign = relationship("Campaign")
    campaign_step = relationship("CampaignStep")


# ✅ CONTACT ↔ CAMPAIGN RELATION
class ContactCampaign(Base):
    __tablename__ = "contact_campaigns"

    id = Column(Integer, primary_key=True, index=True)

    contact_id = Column(Integer, ForeignKey("contacts.id"))
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))

    started_at = Column(DateTime, default=datetime.utcnow)

    contact = relationship("Contact", back_populates="contact_campaigns")
    campaign = relationship("Campaign", back_populates="contact_campaigns")


# ✅ CAMPAIGN SCHEDULE (nuevo sistema de fechas)
class CampaignSchedule(Base):
    __tablename__ = "campaign_schedules"

    id = Column(Integer, primary_key=True, index=True)

    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    step_id = Column(Integer, ForeignKey("campaign_steps.id"))

    scheduled_at = Column(DateTime, nullable=False)

    campaign = relationship("Campaign", back_populates="schedules")
    step = relationship("CampaignStep")