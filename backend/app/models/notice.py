"""
NoticeBoard model.

Maps to the SSS notice board table.
Faculty access is read-only.
"""

from sqlalchemy import BigInteger, Column, Date, String, Text

from app.db.session import Base


class NoticeBoard(Base):
    __tablename__ = "sss_notice_board"

    notice_id = Column(
        BigInteger,
        primary_key=True,
    )

    notice_title = Column(
        String,
        nullable=True,
    )

    notice_text = Column(
        Text,
        nullable=True,
    )

    notice_date = Column(
        Date,
        nullable=True,
    )

    applicable_class = Column(
        String,
        nullable=True,
    )

    posted_by = Column(
        BigInteger,
        nullable=True,
    )