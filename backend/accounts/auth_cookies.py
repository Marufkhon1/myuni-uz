from django.conf import settings

ACCESS_COOKIE_NAME = "myuni_access"
REFRESH_COOKIE_NAME = "myuni_refresh"


def _cookie_secure():
    return not settings.DEBUG


def _access_max_age():
    return int(getattr(settings, "JWT_ACCESS_COOKIE_MAX_AGE", 60 * 60))


def _refresh_max_age():
    return int(getattr(settings, "JWT_REFRESH_COOKIE_MAX_AGE", 60 * 60 * 24 * 7))


def set_auth_cookies(response, refresh_token, *, request=None):
    access = str(refresh_token.access_token)
    refresh = str(refresh_token)
    common = {
        "httponly": True,
        "secure": _cookie_secure(),
        "samesite": "Lax",
        "path": "/",
    }
    response.set_cookie(
        ACCESS_COOKIE_NAME,
        access,
        max_age=_access_max_age(),
        **common,
    )
    response.set_cookie(
        REFRESH_COOKIE_NAME,
        refresh,
        max_age=_refresh_max_age(),
        **common,
    )
    if request is not None:
        from .csrf import set_csrf_cookie

        set_csrf_cookie(response, request)
    return response


def clear_auth_cookies(response):
    # Django 5.2+ HttpResponse.delete_cookie() does not accept `secure=`.
    response.delete_cookie(ACCESS_COOKIE_NAME, path="/", samesite="Lax")
    response.delete_cookie(REFRESH_COOKIE_NAME, path="/", samesite="Lax")
    return response
