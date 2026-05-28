from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .chat_permissions import require_university_member
from .models import ChatMessage, DirectMessage, DirectThread, MessageReport
from .serializers import MessageReportSerializer


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

        serializer = MessageReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        MessageReport.objects.create(
            reporter=request.user,
            chat_message=message,
            reason=serializer.validated_data["reason"],
            details=serializer.validated_data.get("details", ""),
        )
        return Response(
            {"detail": "Shikoyat qabul qilindi. Moderatorlar ko'rib chiqadi."},
            status=status.HTTP_201_CREATED,
        )


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

        serializer = MessageReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        MessageReport.objects.create(
            reporter=request.user,
            direct_message=message,
            reason=serializer.validated_data["reason"],
            details=serializer.validated_data.get("details", ""),
        )
        return Response(
            {"detail": "Shikoyat qabul qilindi. Moderatorlar ko'rib chiqadi."},
            status=status.HTTP_201_CREATED,
        )
