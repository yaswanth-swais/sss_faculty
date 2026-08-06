from sqlalchemy.orm import Session

from app.models.user import UserMaster
from app.models.teacher import TeacherMaster
from app.models.class_master import ClassMaster
from app.models.student import StudentMaster
from app.core.security import verify_password, create_access_token
from app.schemas.auth import LoginRequest, TokenResponse


def _class_display(class_name: str) -> str:
    """Format a class number as ordinal grade: '8' -> '8th Grade'."""
    try:
        n = int(class_name)

        if 10 <= n % 100 <= 20:
            suffix = "th"
        else:
            suffix = {
                1: "st",
                2: "nd",
                3: "rd",
            }.get(n % 10, "th")

        return f"{n}{suffix} Grade"

    except (ValueError, TypeError):
        return str(class_name)


def get_class_context(
    db: Session,
    teacher: TeacherMaster,
) -> tuple[str | None, int]:
    """
    Resolve the teacher's class display name and live active-student count.
    """

    if not teacher.class_id:
        return None, 0

    cls = (
        db.query(ClassMaster)
        .filter(ClassMaster.class_id == teacher.class_id)
        .first()
    )

    class_name = (
        cls.class_name
        if cls and cls.class_name
        else _class_display(teacher.class_id)
    )

    total_students = (
        db.query(StudentMaster)
        .filter(
            StudentMaster.class_id == teacher.class_id,
            StudentMaster.is_active.is_(True),
        )
        .count()
    )

    return class_name, total_students


def authenticate_teacher(
    db: Session,
    payload: LoginRequest,
) -> TokenResponse:
    normalized_email = payload.email.strip().lower()

    # Find the active SSS user by email.
    user = (
        db.query(UserMaster)
        .filter(
            UserMaster.email.ilike(normalized_email),
            UserMaster.is_active.is_(True),
        )
        .first()
    )

    if not user or not verify_password(
        payload.password,
        user.password_hash,
    ):
        raise ValueError("Invalid email or password")

    # Only faculty/teacher accounts should access this dashboard.
    user_role = str(user.role).strip().lower()

    if user_role not in {"teacher", "faculty"}:
        raise ValueError("This account is not authorized as a teacher")

    # Teacher profile is connected through matching email.
    teacher = (
        db.query(TeacherMaster)
        .filter(
            TeacherMaster.email_id.ilike(user.email),
            TeacherMaster.is_active.is_(True),
        )
        .first()
    )

    if not teacher:
        raise ValueError("No active teacher profile found for this account")

    token = create_access_token(
        data={
            "sub": str(user.user_id),
            "teacher_id": teacher.teacher_id,
            "role": user_role,
        }
    )

    class_display, total_students = get_class_context(
        db,
        teacher,
    )

    return TokenResponse(
        access_token=token,
        teacher_id=teacher.teacher_id,
        name=teacher.full_name,
        email=user.email,
        subject=teacher.subject_name,
        class_assigned=class_display,
        section=teacher.section_1,
        avatar_initials=None,
        school_name=None,
        total_students=total_students,
    )