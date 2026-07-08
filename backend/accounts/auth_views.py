from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .auth_cookies import ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME, clear_auth_cookies
from .auth_exchange import consume_auth_exchange_code
from .auth_response import auth_json_response
from .authentication import get_refresh_token_from_request, refresh_token_came_from_cookie
from .csrf import enforce_csrf
from .serializers import UserSerializer
from .stream_tokens import issue_stream_token

User = get_user_model()


class CookieTokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if refresh_token_came_from_cookie(request):
            enforce_csrf(request)

        refresh_value = get_refresh_token_from_request(request)
        if not refresh_value:
            return Response({"detail": "Refresh token topilmadi."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            refresh = RefreshToken(refresh_value)
            user = User.objects.get(pk=refresh["user_id"])
            new_refresh = RefreshToken.for_user(user)
        except (TokenError, InvalidToken, User.DoesNotExist):
            response = Response({"detail": "Refresh token yaroqsiz."}, status=status.HTTP_401_UNAUTHORIZED)
            clear_auth_cookies(response)
            return response

        return auth_json_response(new_refresh, request=request)


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Clearing httpOnly session cookies is a CSRF-sensitive action when
        # those cookies are present (logout-as-DoS / force re-auth).
        if request.COOKIES.get(ACCESS_COOKIE_NAME) or request.COOKIES.get(REFRESH_COOKIE_NAME):
            enforce_csrf(request)
        response = Response({"detail": "Chiqildi."})
        clear_auth_cookies(response)
        return response


class StreamTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token, ttl = issue_stream_token(request.user.id)
        return Response({"stream_token": token, "expires_in": ttl})


class CsrfCookieView(APIView):
    """Issue a readable csrftoken cookie for SPA double-submit."""

    permission_classes = [AllowAny]

    def get(self, request):
        from .csrf import set_csrf_cookie

        response = Response({"detail": "CSRF cookie o'rnatildi."})
        set_csrf_cookie(response, request)
        return response


class AuthSessionView(APIView):
    """Legacy one-shot refresh token → cookie exchange."""

    permission_classes = [AllowAny]

    def post(self, request):
        refresh_value = (request.data.get("refresh") or "").strip()
        if not refresh_value:
            return Response({"detail": "Tokenlar topilmadi."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refresh = RefreshToken(refresh_value)
            user = User.objects.get(pk=refresh["user_id"])
            session_refresh = RefreshToken.for_user(user)
        except (TokenError, InvalidToken, User.DoesNotExist):
            return Response({"detail": "Token yaroqsiz."}, status=status.HTTP_401_UNAUTHORIZED)

        return auth_json_response(
            session_refresh,
            user_data=UserSerializer(user, context={"request": request}).data,
            extra={"detail": "Sessiya o'rnatildi."},
            request=request,
        )


class AuthExchangeView(APIView):
    """
    Exchange a one-time OAuth code for httpOnly cookies.

    Called from the SPA origin (via Vite proxy / same-site API) so Set-Cookie
    attaches to the application host — never put JWTs in the URL.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        code = (request.data.get("code") or "").strip()
        refresh_value = consume_auth_exchange_code(code)
        if not refresh_value:
            return Response(
                {"detail": "Kirish kodi yaroqsiz yoki muddati tugagan."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            refresh = RefreshToken(refresh_value)
            user = User.objects.get(pk=refresh["user_id"])
            session_refresh = RefreshToken.for_user(user)
        except (TokenError, InvalidToken, User.DoesNotExist, KeyError):
            return Response({"detail": "Kirish kodi yaroqsiz."}, status=status.HTTP_400_BAD_REQUEST)

        return auth_json_response(
            session_refresh,
            user_data=UserSerializer(user, context={"request": request}).data,
            extra={"detail": "Sessiya o'rnatildi."},
            request=request,
        )