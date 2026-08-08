"""
Shared FastAPI dependencies.
get_current_teacher — verifies JWT and returns the authenticated teacher's ID.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import cast, String
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import decode_token
from app.models.teacher import TeacherMaster
from app.models.user import UserMaster

bearer_scheme = HTTPBearer()


def get_current_teacher(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> TeacherMaster:

    token = credentials.credentials
    payload = decode_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    teacher_id = payload.get("teacher_id") or payload.get("sub")

    if not teacher_id:
        raise HTTPException(status_code=401, detail="Token missing teacher_id")

    # The DB column sss_teacher_master.teacher_id is VARCHAR while the model maps
    # it as Integer, so compare as text (cast column + stringify value) — avoids
    # Postgres "operator does not exist: character varying = integer".
    teacher = db.query(TeacherMaster).filter(
        cast(TeacherMaster.teacher_id, String) == str(teacher_id)
    ).first()

    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    return teacher