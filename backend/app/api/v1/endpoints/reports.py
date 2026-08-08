from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_teacher
from app.core.teacher_id import numeric_teacher_id
from app.models.teacher import TeacherMaster
from app.models.student import StudentMaster
from app.models.assessment import Assessment
from app.models.class_master import ClassMaster
from app.schemas.report import ReportResponse, StudentReportRow

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("", response_model=ReportResponse)
def get_report(
    teacher: TeacherMaster = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    teacher_id = numeric_teacher_id(teacher.teacher_id)

    class_record = (
        db.query(ClassMaster)
        .filter(ClassMaster.class_id == teacher.class_id)
        .first()
    )

    students = (
        db.query(StudentMaster)
        .filter(StudentMaster.class_id == teacher.class_id)
        .order_by(StudentMaster.roll_no)
        .all()
    )

    assessments = (
        db.query(Assessment)
        .filter(Assessment.teacher_id == teacher_id)
        .all()
    )

    total_assessments = len(assessments)

    rows: list[StudentReportRow] = []

    for student in students:
        marks_list = [
            float(result.marks_obtained)
            for result in student.results
            if not result.is_absent
            and result.marks_obtained is not None
            and result.assessment.teacher_id == teacher_id
        ]

        percentage_list = [
            float(result.marks_obtained)
            / float(result.assessment.max_marks)
            * 100
            for result in student.results
            if not result.is_absent
            and result.marks_obtained is not None
            and result.assessment.teacher_id == teacher_id
            and result.assessment.max_marks
        ]

        average_percentage = (
            round(sum(percentage_list) / len(percentage_list), 1)
            if percentage_list
            else None
        )

        average_marks = (
            round(sum(marks_list) / len(marks_list), 1)
            if marks_list
            else None
        )

        rows.append(
            StudentReportRow(
                student_id=student.student_id,
                name=student.full_name or "",
                roll_number=student.roll_no or "",
                total_assessed=len(marks_list),
                average_marks=average_marks,
                average_percent=average_percentage,
                highest_marks=max(marks_list) if marks_list else None,
                lowest_marks=min(marks_list) if marks_list else None,
                rank=0,
            )
        )

    rows.sort(
        key=lambda row: (
            -(row.average_percent or 0),
            row.roll_number,
        )
    )

    for index, row in enumerate(rows, start=1):
        row.rank = index

    class_name = (
        class_record.class_name
        if class_record and class_record.class_name
        else str(teacher.class_id)
    )

    section_name = (
        class_record.section_name
        if class_record and class_record.section_name
        else teacher.section_1 or "A"
    )

    return ReportResponse(
        teacher_id=teacher.teacher_id,
        class_name=class_name,
        section=section_name,
        total_students=len(students),
        total_assessments=total_assessments,
        students=rows,
    )