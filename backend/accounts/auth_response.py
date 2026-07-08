"""Helpers for httpOnly-cookie auth responses."""

from django.conf import settings
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .auth_cookies import set_auth_cookies


def auth_return_tokens_in_body() -> bool:
    return bool(getattr(settings, "AUTH_RETURN_TOKENS_IN_BODY", False))


def build_auth_body(refresh: RefreshToken, *, user_data=None, extra=None) -> dict:
    body = dict(extra or {})
    if user_data is not None:
        body["user"] = user_data
    if auth_return_tokens_in_body():
        body["access"] = str(refresh.access_token)
        body["refresh"] = str(refresh)
    return body


def auth_json_response(
    refresh: RefreshToken,
    *,
    status=200,
    user_data=None,
    extra=None,
    request=None,
):
    response = Response(
        build_auth_body(refresh, user_data=user_data, extra=extra),
        status=status,
    )
    set_auth_cookies(response, refresh, request=request)
    return response


def strip_tokens_from_mapping(data: dict) -> dict:
    if auth_return_tokens_in_body():
        return data
    cleaned = dict(data)
    cleaned.pop("access", None)
    cleaned.pop("refresh", None)
    return cleaned
