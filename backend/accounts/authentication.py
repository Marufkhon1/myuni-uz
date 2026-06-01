from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken

from .auth_cookies import ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME


class CookieJWTAuthentication(JWTAuthentication):
    """JWT from Authorization header or httpOnly access cookie."""

    def authenticate(self, request):
        header = self.get_header(request)
        if header is not None:
            try:
                return super().authenticate(request)
            except (InvalidToken, AuthenticationFailed):
                pass

        raw_token = request.COOKIES.get(ACCESS_COOKIE_NAME)
        if not raw_token:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
        except InvalidToken:
            return None

        return self.get_user(validated_token), validated_token


def get_refresh_token_from_request(request):
    data_refresh = ""
    if hasattr(request, "data") and request.data:
        data_refresh = (request.data.get("refresh") or "").strip()
    body_refresh = (request.POST.get("refresh") or "").strip()
    cookie_refresh = (request.COOKIES.get(REFRESH_COOKIE_NAME) or "").strip()
    return data_refresh or body_refresh or cookie_refresh
