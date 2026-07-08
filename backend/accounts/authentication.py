from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken

from .auth_cookies import ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME
from .csrf import enforce_csrf
from .presence import touch_user_last_seen


def _touch_presence(result):
    if result is not None:
        touch_user_last_seen(result[0])
    return result


class PresenceJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        return _touch_presence(super().authenticate(request))


class CookieJWTAuthentication(PresenceJWTAuthentication):
    """
    JWT from Authorization header or httpOnly access cookie.

    Cookie-based auth requires CSRF on unsafe methods (SPA double-submit),
    matching DRF SessionAuthentication. Bearer-only requests stay CSRF-exempt.
    """

    def authenticate(self, request):
        header = self.get_header(request)
        if header is not None:
            try:
                result = super().authenticate(request)
                if result is not None:
                    request.myuni_auth_via_cookie = False
                    return result
            except (InvalidToken, AuthenticationFailed):
                pass

        raw_token = request.COOKIES.get(ACCESS_COOKIE_NAME)
        if not raw_token:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
        except InvalidToken:
            return None

        user = self.get_user(validated_token)
        # Cookie credentials → browsers will auto-send them; require CSRF.
        enforce_csrf(request)
        touch_user_last_seen(user)
        request.myuni_auth_via_cookie = True
        return user, validated_token


def get_refresh_token_from_request(request):
    data_refresh = ""
    if hasattr(request, "data") and request.data:
        data_refresh = (request.data.get("refresh") or "").strip()
    body_refresh = (request.POST.get("refresh") or "").strip()
    cookie_refresh = (request.COOKIES.get(REFRESH_COOKIE_NAME) or "").strip()
    return data_refresh or body_refresh or cookie_refresh


def refresh_token_came_from_cookie(request) -> bool:
    """True when refresh is taken from the httpOnly cookie (not request body)."""
    data_refresh = ""
    if hasattr(request, "data") and request.data:
        data_refresh = (request.data.get("refresh") or "").strip()
    body_refresh = (request.POST.get("refresh") or "").strip()
    if data_refresh or body_refresh:
        return False
    return bool((request.COOKIES.get(REFRESH_COOKIE_NAME) or "").strip())

