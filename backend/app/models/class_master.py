"""
ClassMaster model.

Maps to the SSS class master table.
Stores class and section display information.
"""

from sqlalchemy import BigInteger, Column, String

from app.db.session import Base


class ClassMaster(Base):
    __tablename__ = "sss_class_master"

    class_id = Column(
        BigInteger,
        primary_key=True,
    )

    class_name = Column(
        String(100),
        nullable=True,
    )

    section_name = Column(
        String(50),
        nullable=True,
    )