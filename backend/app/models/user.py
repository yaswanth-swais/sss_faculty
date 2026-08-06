"""
UserMaster authentication model.

Maps to the actual SSS users table structure.
"""

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Integer,
    String,
)

from app.db.session import Base


class UserMaster(Base):
    __tablename__ = "sss_users_master"

    user_id = Column(
        Integer,
        primary_key=True,
    )

    username = Column(
        String(255),
        nullable=False,
        unique=True,
        index=True,
    )

    email = Column(
        String(255),
        nullable=False,
        unique=True,
        index=True,
    )

    password_hash = Column(
        String(255),
        nullable=False,
    )

    role = Column(
        String(50),
        nullable=False,
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    phone = Column(
        String(50),
        nullable=True,
    )