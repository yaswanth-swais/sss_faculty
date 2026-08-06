from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_teacher
from app.db.session import get_db
from app.models.teacher import TeacherMaster
from app.models.chapter import SgsChapterContent

router = APIRouter(prefix="/chapters", tags=["chapters"])


@router.get("")
def get_chapters(
    teacher: TeacherMaster = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """
    Return chapter list for the logged-in teacher's subject.
    """

    query = (
        db.query(SgsChapterContent)
        .filter(
            SgsChapterContent.chapter_id.isnot(None),
        )
    )

    if teacher.subject_name:
        query = query.filter(
            SgsChapterContent.subject.ilike(
                f"%{teacher.subject_name.strip()}%"
            )
        )

    rows = (
        query
        .order_by(
            SgsChapterContent.chapter_id,
            SgsChapterContent.id,
        )
        .all()
    )

    chapters = [
        {
            "chapter_id": row.chapter_id,
            "chapter_name": row.lesson,
            "content_title": row.content_title,
            "subject": row.subject,
        }
        for row in rows
    ]

    return {"chapters": chapters}


@router.get("/{chapter_id}")
def get_chapter(
    chapter_id: int,
    teacher: TeacherMaster = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """
    Return one chapter's full reading content.
    """

    query = (
        db.query(SgsChapterContent)
        .filter(
            SgsChapterContent.chapter_id == chapter_id,
        )
    )

    if teacher.subject_name:
        query = query.filter(
            SgsChapterContent.subject.ilike(
                f"%{teacher.subject_name.strip()}%"
            )
        )

    row = query.order_by(SgsChapterContent.id).first()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found",
        )

    return {
        "chapter_id": row.chapter_id,
        "chapter_name": row.lesson,
        "content_title": row.content_title,
        "subject": row.subject,
        "content": row.full_text_content or "",
    }