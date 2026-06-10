"""Add student_master, assessments, assessment_results tables

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-30
"""
from typing import Sequence, Union
import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── sss_student_master ─────────────────────────────────────────────────────────
    op.create_table(
        "sss_student_master",
        sa.Column("student_id",   sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("teacher_id",   sa.Integer(), nullable=False),
        sa.Column("name",         sa.String(150), nullable=False),
        sa.Column("roll_number",  sa.String(20),  nullable=False),
        sa.Column("gender",       sa.Enum("male", "female", "other", name="gender"), nullable=True),
        sa.Column("parent_name",  sa.String(150), nullable=True),
        sa.Column("parent_phone", sa.String(20),  nullable=True),
        sa.Column("class_name",   sa.String(10),  nullable=True),
        sa.Column("section",      sa.String(10),  nullable=True),
        sa.Column("created_at",   sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at",   sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["teacher_id"], ["sss_teacher_master.teacher_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("student_id"),
    )
    op.create_index("ix_sss_student_master_teacher_id", "sss_student_master", ["teacher_id"])

    # ── sss_assessments ────────────────────────────────────────────────────────────
    op.create_table(
        "sss_assessments",
        sa.Column("assessment_id",   sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("teacher_id",      sa.Integer(), nullable=False),
        sa.Column("title",           sa.String(300), nullable=False),
        sa.Column("chapter",         sa.String(255), nullable=True),
        sa.Column("assessment_type", sa.Enum("quiz","test","exam","assignment", name="assessmenttype"), nullable=False, server_default="test"),
        sa.Column("max_marks",       sa.Float(), nullable=False, server_default="100"),
        sa.Column("assessment_date", sa.Date(), nullable=True),
        sa.Column("description",     sa.Text(), nullable=True),
        sa.Column("created_at",      sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at",      sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["teacher_id"], ["sss_teacher_master.teacher_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("assessment_id"),
    )
    op.create_index("ix_sss_assessments_teacher_id", "sss_assessments", ["teacher_id"])

    # ── sss_assessment_results ─────────────────────────────────────────────────────
    op.create_table(
        "sss_assessment_results",
        sa.Column("result_id",      sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("assessment_id",  sa.Integer(), nullable=False),
        sa.Column("student_id",     sa.Integer(), nullable=False),
        sa.Column("marks_obtained", sa.Float(),   nullable=True),
        sa.Column("remarks",        sa.String(300), nullable=True),
        sa.Column("created_at",     sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["assessment_id"], ["sss_assessments.assessment_id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["student_id"],    ["sss_student_master.student_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("result_id"),
    )
    op.create_index("ix_sss_assessment_results_assessment_id", "sss_assessment_results", ["assessment_id"])
    op.create_index("ix_sss_assessment_results_student_id",    "sss_assessment_results", ["student_id"])


def downgrade() -> None:
    op.drop_index("ix_sss_assessment_results_student_id",    table_name="sss_assessment_results")
    op.drop_index("ix_sss_assessment_results_assessment_id", table_name="sss_assessment_results")
    op.drop_table("sss_assessment_results")
    op.execute("DROP TYPE IF EXISTS assessmenttype")

    op.drop_index("ix_sss_assessments_teacher_id", table_name="sss_assessments")
    op.drop_table("sss_assessments")

    op.drop_index("ix_sss_student_master_teacher_id", table_name="sss_student_master")
    op.drop_table("sss_student_master")
    op.execute("DROP TYPE IF EXISTS gender")
