"""
TeacherMaster — teacher profile data.
Maps to sgs_teacher_master table.
Linked to sgs_users_masters via email_id (no FK constraint).
"""

from sqlalchemy import Column, BigInteger, String, Boolean, DateTime
from sqlalchemy.orm import relationship

from app.db.session import Base


class TeacherMaster(Base):
    __tablename__ = "sss_teacher_master"

    teacher_id   = Column(String(50), primary_key=True)  # alphanumeric IDs e.g. "T022"
    full_name    = Column(String(255), nullable=False)
    subject_name = Column(String(255), nullable=True)
    class_id     = Column(BigInteger, nullable=True)
    section_1    = Column(String(50), nullable=True)
    role         = Column(String(50), nullable=True)
    email_id     = Column(String(255), nullable=False, unique=True, index=True)
    section_2    = Column(String(50), nullable=True)
    phone        = Column(String(50), nullable=True)
    is_active    = Column(Boolean, nullable=True)
    created_at   = Column(DateTime, nullable=True)

    notes       = relationship("TeacherNote",  back_populates="teacher", cascade="all, delete-orphan")
    assessments = relationship("Assessment",   back_populates="teacher", cascade="all, delete-orphan")
