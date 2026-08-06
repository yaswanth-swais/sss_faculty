"""
Assignment models.

Maps assignment and submission data to the SSS tables.
"""

from sqlalchemy import (
    BigInteger,
    Column,
    Date,
    DateTime,
    Integer,
    String,
    Text,
)

from app.db.session import Base


class AssignmentMaster(Base):
    __tablename__ = "sss_assignment_master"

    assignment_id = Column(
        BigInteger,
        primary_key=True,
    )

    chapter_id = Column(
        BigInteger,
        nullable=True,
    )

    assignment_title = Column(
        String(200),
        nullable=True,
    )

    assignment_text = Column(
        Text,
        nullable=True,
    )

    due_date = Column(
        Date,
        nullable=True,
    )

    assigned_by = Column(
        BigInteger,
        nullable=True,
    )

    class_id = Column(
        BigInteger,
        nullable=True,
    )

    subject_id = Column(
        BigInteger,
        nullable=True,
    )

    created_datetime = Column(
        DateTime,
        nullable=True,
    )

    record_status = Column(
        String(20),
        nullable=True,
    )

    version_no = Column(
        Integer,
        nullable=True,
    )


class AssignmentResult(Base):
    __tablename__ = "sss_assignment_results"

    assignment_result_id = Column(
        BigInteger,
        primary_key=True,
    )

    assignment_id = Column(
        BigInteger,
        nullable=False,
    )

    student_id = Column(
        BigInteger,
        nullable=False,
    )

    status = Column(
        String(50),
        nullable=True,
    )

    submitted_at = Column(
        DateTime,
        nullable=True,
    )

    created_datetime = Column(
        DateTime,
        nullable=True,
    )

    record_status = Column(
        String(20),
        nullable=True,
    )

    version_no = Column(
        Integer,
        nullable=True,
    )