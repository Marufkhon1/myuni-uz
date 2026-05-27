import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils.decorators import method_decorator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.views.decorators.csrf import csrf_exempt
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .password_reset_email import send_password_reset_email
from .password_reset_limits import (
    check_password_reset_allowed,
    record_password_reset_request,
    record_password_reset_sent,
)
from .password_reset_session import (
    clear_reset_session,
    get_reset_seconds_remaining,
    is_reset_session_active,
    reset_session_ttl,
    start_reset_session,
)

User = get_user_model()
logger = logging.getLogger(__name__)

RESET_MINUTES = reset_session_ttl() // 60

GENERIC_OK = {
    "detail": (
        "Agar bu email ro'yxatdan o'tgan bo'lsa, parol tiklash havolasi "
        "shu email manziliga yuborildi."
    ),
    "expires_in_minutes": RESET_MINUTES,
}


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(min_length=8, write_only=True)
    password_confirm = serializers.CharField(min_length=8, write_only=True)

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Parollar mos kelmadi."}
            )
        return attrs


@method_decorator(csrf_exempt, name="dispatch")
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()

        allowed, limit_message, retry_after = check_password_reset_allowed(request, email)
        if not allowed:
            return Response(
                {
                    "detail": limit_message,
                    "retry_after_seconds": retry_after,
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        record_password_reset_request(request)

        user = User.objects.filter(email=email).first()
        if user:
            try:
                token = start_reset_session(user, request)
                send_password_reset_email(user, token)
                record_password_reset_sent(email)
            except Exception as error:
                logger.exception("Password reset email failed for %s: %s", email, error)
                clear_reset_session(user, request)
                detail = (
                    "Email yuborilmadi. SMTP sozlamalarini tekshiring "
                    "(EMAIL_HOST_USER — yuboruvchi Gmail, xat foydalanuvchi emailiga boradi)."
                )
                if settings.DEBUG:
                    detail = f"{detail} ({type(error).__name__}: {error})"
                return Response(
                    {
                        "detail": detail,
                        "code": "email_send_failed",
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

        if not request.session.session_key:
            request.session.create()

        return Response(GENERIC_OK)


@method_decorator(csrf_exempt, name="dispatch")
class PasswordResetStatusView(APIView):
    """Havola hali amal qiladimi (frontend taymer uchun)."""

    permission_classes = [AllowAny]

    def get(self, request):
        uid = request.query_params.get("uid", "")
        token = request.query_params.get("token", "")
        if not uid or not token:
            return Response({"active": False, "seconds_remaining": 0})

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"active": False, "seconds_remaining": 0})

        active = is_reset_session_active(user, token)
        return Response(
            {
                "active": active,
                "seconds_remaining": get_reset_seconds_remaining(user) if active else 0,
                "expires_in_minutes": RESET_MINUTES,
            }
        )


@method_decorator(csrf_exempt, name="dispatch")
class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user_id = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"detail": "Parol tiklash havolasi noto'g'ri yoki muddati o'tgan."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token = serializer.validated_data["token"]
        if not is_reset_session_active(user, token):
            clear_reset_session(user, request)
            return Response(
                {
                    "detail": (
                        f"Parol tiklash sessiyasi tugadi ({RESET_MINUTES} daqiqa). "
                        "Qayta «Parolni unutdingizmi?» orqali yangi havola so'rang."
                    ),
                    "code": "session_expired",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_password = serializer.validated_data["password"]
        if user.check_password(new_password):
            return Response(
                {
                    "detail": "Yangi parol eskisiga o'xshash bo'lmasin.",
                    "code": "same_as_old",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save(update_fields=["password"])
        clear_reset_session(user, request)

        return Response({"detail": "Parol yangilandi. Endi yangi parol bilan kiring."})
