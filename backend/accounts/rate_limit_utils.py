from rest_framework import status
from rest_framework.response import Response


def rate_limit_response(detail, retry_after_seconds, *, code="rate_limited"):
    payload = {
        "detail": detail,
        "code": code,
        "retry_after_seconds": max(1, int(retry_after_seconds or 1)),
    }
    response = Response(payload, status=status.HTTP_429_TOO_MANY_REQUESTS)
    response["Retry-After"] = str(payload["retry_after_seconds"])
    return response
