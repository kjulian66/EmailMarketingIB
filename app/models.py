from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base


# 🔥 RELACIÓN MUCHOS A MUCHOS (contactos ↔ etiquetas)
contact_tags = Table(
    "contact_tags",
    Base.metadata,
    Column("contact_id", Integer, ForeignKey("contactos.id")),
    Column("tag_id", Integer, ForeignKey("etiquetas.id"))
)


# ✅ ETIQUETAS
class Tag(Base):
    __tablename__ = "etiquetas"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)


# ✅ CONTACTOS
class Contact(Base):
    __tablename__ = "contactos"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    is_subscribed = Column(Boolean, default=True)
    unsubscribe_token = Column(String, default=lambda: str(uuid.uuid4()))

    tags = relationship("Tag", secondary=contact_tags)
    contact_campaigns = relationship("ContactCampaign", back_populates="contact")


# ✅ PLANTILLAS
class EmailTemplate(Base):
    __tablename__ = "plantillas"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String)
    subject = Column(String)

    html = Column(String)
    css = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)


# ✅ CAMPAÑAS
class Campaign(Base):
    __tablename__ = "campañas"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String)
    subject = Column(String)

    template_id = Column(Integer, ForeignKey("plantillas.id"))

    status = Column(String, default="borrador")
    created_at = Column(DateTime, default=datetime.utcnow)

    template = relationship("EmailTemplate")
    steps = relationship("CampaignStep", back_populates="campaign")
    contact_campaigns = relationship("ContactCampaign", back_populates="campaign")


# ✅ PASOS DE CAMPAÑA
class CampaignStep(Base):
    __tablename__ = "pasos_campaña"

    id = Column(Integer, primary_key=True, index=True)

    campaign_id = Column(Integer, ForeignKey("campañas.id"))
    template_id = Column(Integer, ForeignKey("plantillas.id"))

    delay_days = Column(Integer, default=0)
    order_index = Column(Integer)

    campaign = relationship("Campaign", back_populates="steps")
    template = relationship("EmailTemplate")


# ✅ LOGS DE EMAIL
class EmailLog(Base):
    __tablename__ = "logs_email"

    id = Column(Integer, primary_key=True, index=True)

    contact_id = Column(Integer, ForeignKey("contactos.id"))
    campaign_id = Column(Integer, ForeignKey("campañas.id"))
    campaign_step_id = Column(Integer, ForeignKey("pasos_campaña.id"))

    status = Column(String)
    sent_at = Column(DateTime, default=datetime.utcnow)

    contact = relationship("Contact")
    campaign = relationship("Campaign")
    campaign_step = relationship("CampaignStep")


# ✅ RELACIÓN CONTACTO ↔ CAMPAÑA
class ContactCampaign(Base):
    __tablename__ = "contactos_campañas"

    id = Column(Integer, primary_key=True, index=True)

    contact_id = Column(Integer, ForeignKey("contactos.id"))
    campaign_id = Column(Integer, ForeignKey("campañas.id"))

    started_at = Column(DateTime, default=datetime.utcnow)

    contact = relationship("Contact", back_populates="contact_campaigns")
    campaign = relationship("Campaign", back_populates="contact_campaigns")