from django.db import IntegrityError

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.rate_limit_utils import rate_limit_response

from .chat_permissions import require_university_member
from .models import ChatMessage, DirectMessage, MessageReport
from .report_limits import check_report_submit_allowed, record_report_submit
from .report_service import notify_moderators_new_report, notify_reporter_report_received, status_label
from .serializers import MessageReportSerializer


def _create_message_report(request, *, chat_message=None, direct_message=None):
    allowed, limit_message, retry_after = check_report_submit_allowed(request, request.user.id)
    if not allowed:
        return rate_limit_response(limit_message, retry_after)

    serializer = MessageReportSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    try:
        report = MessageReport.objects.create(
            reporter=request.user,
            chat_message=chat_message,
            direct_message=direct_message,
            reason=serializer.validated_data["reason"],
            details=serializer.validated_data.get("details", ""),
        )
    except IntegrityError:
        return Response(
            {"detail": "Bu xabar haqida allaqachon shikoyat yuborgansiz."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    record_report_submit(request, request.user.id)
    notify_reporter_report_received(report, target_type="message", target_label="Xabar")
    preview = (chat_message.text if chat_message else direct_message.text or "")[:120]
    notify_moderators_new_report(
        report,
        target_type="xabar",
        summary=f"Sabab: {report.get_reason_display()}\nMatn: {preview}",
    )
    return Response(
        {
            "detail": "Shikoyat qabul qilindi. Holatni profil → Mening shikoyatlarim bo'limidan kuzatishingiz mumkin.",
            "report_id": report.id,
            "status": report.status,
            "status_label": status_label(report.status),
        },
        status=status.HTTP_201_CREATED,
    )


class ChatMessageReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, message_id):
        message = get_object_or_404(
            ChatMessage.objects.select_related("university"),
            pk=message_id,
            is_deleted=False,
        )
        if message.user_id == request.user.id:
            return Response(
                {"detail": "O'z xabaringiz haqida shikoyat yuborib bo'lmaydi."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not require_university_member(request.user, message.university_id):
            return Response(
                {"detail": "Shikoyat uchun avval chatga qo'shilishingiz kerak."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if MessageReport.objects.filter(reporter=request.user, chat_message=message).exists():
            return Response(
                {"detail": "Bu xabar haqida allaqachon shikoyat yuborgansiz."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return _create_message_report(request, chat_message=message)


class DirectMessageReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, message_id):
        message = get_object_or_404(
            DirectMessage.objects.select_related("thread"),
            pk=message_id,
            is_deleted=False,
        )
        if message.sender_id == request.user.id:
            return Response(
                {"detail": "O'z xabaringiz haqida shikoyat yuborib bo'lmaydi."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        thread = message.thread
        if request.user.id not in (thread.user_one_id, thread.user_two_id):
            return Response(
                {"detail": "Bu xabarni shikoyat qilish huquqingiz yo'q."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if MessageReport.objects.filter(reporter=request.user, direct_message=message).exists():
            return Response(
                {"detail": "Bu xabar haqida allaqachon shikoyat yuborgansiz."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return _create_message_report(request, direct_message=message)
