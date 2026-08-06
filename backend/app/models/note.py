"""
Teacher notes model.

Maps SGS notes functionality to the normalized SSS teacher-notes table.
"""

import enum
from datetime import datetime, timezone

from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.db.session import Base


class ContentType(str, enum.Enum):
    typed = "typed"
    voice = "voice"
    handwritten = "handwritten"


class TeacherNote(Base):
    __tablename__ = "sss_teacher_notes"

    note_id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    teacher_id = Column(
        BigInteger,
        ForeignKey(
            "sss_teacher_master.teacher_id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    title = Column(
        String(500),
        nullable=False,
    )

    content = Column(
        Text,
        nullable=True,
    )

    chapter = Column(
        String(255),
        nullable=False,
    )

    content_type = Column(
        SAEnum(
            ContentType,
            name="contenttype",
            create_type=False,
        ),
        nullable=False,
        default=ContentType.typed,
    )

    canvas_image_url = Column(
        Text,
        nullable=True,
    )

    tags = Column(
        JSONB,
        nullable=True,
        default=list,
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    teacher = relationship(
        "TeacherMaster",
        back_populates="notes",
    )