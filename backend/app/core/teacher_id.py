def numeric_teacher_id(teacher_id: str | int) -> int:
    """
    Convert SSS teacher master IDs such as T022 / T109
    to the numeric IDs used by related tables.
    """
    value = str(teacher_id).strip()

    if value.upper().startswith("T"):
        value = value[1:]

    if not value.isdigit():
        raise ValueError(f"Invalid teacher_id: {teacher_id}")

    return int(value)