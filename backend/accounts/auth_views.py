from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .auth_cookies import clear_auth_cookies, set_auth_cookies
from .authentication import get_refresh_token_from_request
from .serializers import UserSerializer
from .stream_tokens import issue_stream_token

User = get_user_model()


class CookieTokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
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

        response = Response(
            {
                "access": str(new_refresh.access_token),
                "refresh": str(new_refresh),
            }
        )
        set_auth_cookies(response, new_refresh)
        return response


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        response = Response({"detail": "Chiqildi."})
        clear_auth_cookies(response)
        return response


class StreamTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token, ttl = issue_stream_token(request.user.id)
        return Response({"stream_token": token, "expires_in": ttl})


class AuthSessionView(APIView):
    """Google OAuth va boshqa bir martalik token almashinuvi (httpOnly cookie)."""

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

        response = Response(
            {
                "detail": "Sessiya o'rnatildi.",
                "access": str(session_refresh.access_token),
                "refresh": str(session_refresh),
                "user": UserSerializer(user, context={"request": request}).data,
            }
        )
        set_auth_cookies(response, session_refresh)
        return response
