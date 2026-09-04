"""
Chapter content model for the SSS faculty dashboard.

Maps to the actual sss_chapter_content table.
"""

from sqlalchemy import Column, Integer, Text

from app.db.session import Base


class SssChapterContent(Base):
    __tablename__ = "sss_chapter_content"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    chapter_id = Column(
        Integer,
        nullable=True,
    )

    subject = Column(
        Text,
        nullable=True,
    )

    lesson = Column(
        Text,
        nullable=True,
    )

    content_title = Column(
        Text,
        nullable=True,
    )

    full_text_content = Column(
        Text,
        nullable=True,
    )