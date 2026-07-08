"""CSRF helpers for httpOnly cookie JWT sessions (SPA double-submit)."""

from django.conf import settings
from django.middleware.csrf import get_token
from rest_framework import exceptions
from rest_framework.authentication import CSRFCheck


def _django_request(request):
    return getattr(request, "_request", request)


def enforce_csrf(request):
    """
    Run Django's CSRF check (same as DRF SessionAuthentication).

    Used when identity or session credentials come from cookies, where
    browsers auto-attach cookies on cross-site form POSTs.
    """

    def dummy_get_response(_request):  # pragma: no cover
        return None

    django_request = _django_request(request)
    check = CSRFCheck(dummy_get_response)
    # Populates request.META['CSRF_COOKIE'] for process_view().
    check.process_request(django_request)
    reason = check.process_view(django_request, None, (), {})
    if reason:
        raise exceptions.PermissionDenied(f"CSRF Failed: {reason}")


def set_csrf_cookie(response, request):
    """Ensure a readable csrftoken cookie is present on auth responses."""
    token = get_token(_django_request(request))
    response.set_cookie(
        settings.CSRF_COOKIE_NAME,
        token,
        max_age=settings.CSRF_COOKIE_AGE,
        domain=settings.CSRF_COOKIE_DOMAIN,
        path=settings.CSRF_COOKIE_PATH,
        secure=settings.CSRF_COOKIE_SECURE,
        httponly=settings.CSRF_COOKIE_HTTPONLY,
        samesite=settings.CSRF_COOKIE_SAMESITE,
    )
    return response