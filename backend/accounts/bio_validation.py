BIO_MIN_LENGTH = 3
BIO_MAX_LENGTH = 70


def normalize_bio(value):
    if value is None:
        return None
    return str(value).strip()


def validate_bio(value):
    if value == "":
        return ""
    if len(value) < BIO_MIN_LENGTH:
        raise ValueError(f"Bio kamida {BIO_MIN_LENGTH} belgi bo'lishi kerak.")
    if len(value) > BIO_MAX_LENGTH:
        raise ValueError(f"Bio {BIO_MAX_LENGTH} belgidan oshmasligi kerak.")
    return value
