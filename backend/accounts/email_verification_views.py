from rest_framework import serializers, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import get_user_model

from .auth_response import auth_json_response
from .email_verification import (
    is_email_verified,
    mark_email_verified,
    record_verification_sent,
    send_verification_email,
    verification_resend_cooldown_remaining,
    verify_email_token,
)
from .rate_limit_utils import rate_limit_response
from .serializers import UserSerializer

User = get_user_model()


class EmailVerifyConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()


class EmailVerifyResendSerializer(serializers.Serializer):
    email = serializers.EmailField()


class EmailVerifyConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmailVerifyConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, error = verify_email_token(
            serializer.validated_data["uid"],
            serializer.validated_data["token"],
        )
        if not user:
            return Response({"detail": error}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)
        return auth_json_response(
            refresh,
            user_data=UserSerializer(user, context={"request": request}).data,
            extra={"detail": "Email muvaffaqiyatli tasdiqlandi."},
            request=request,
        )


class EmailVerifyResendView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmailVerifyResendSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()
        user = User.objects.filter(email=email).first()

        if user and not is_email_verified(user):
            remaining = verification_resend_cooldown_remaining(user.id)
            if remaining > 0:
                return rate_limit_response(
                    f"Tasdiqlash xatini qayta yuborish uchun {remaining} soniya kuting.",
                    remaining,
                    code="email_verify_cooldown",
                )
            if send_verification_email(user):
                record_verification_sent(user.id)
            else:
                return Response(
                    {
                        "detail": "Tasdiqlash xatini yuborib bo'lmadi. Keyinroq qayta urinib ko'ring.",
                        "code": "email_send_failed",
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

        return Response(
            {
                "detail": (
                    "Agar bu email ro'yxatdan o'tgan va tasdiqlanmagan bo'lsa, "
                    "tasdiqlash xati yuborildi."
                )
            }
        )


class EmailVerifyStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        verified = is_email_verified(request.user)
        remaining = 0 if verified else verification_resend_cooldown_remaining(request.user.id)
        return Response(
            {
                "email": request.user.email,
                "email_verified": verified,
                "resend_cooldown_seconds": remaining,
            }
        )
