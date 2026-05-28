from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .chat_permissions import user_is_university_member
from .models import ChatMessage, DirectMessage
from .serializers import ChatMessageCreateSerializer, ChatMessageSerializer, DirectMessageSerializer


class UniversityMessageEditView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, message_id):
        message = get_object_or_404(
            ChatMessage.objects.select_related("university", "user", "user__profile").prefetch_related(
                "reactions"
            ),
            pk=message_id,
        )
        if message.user_id != request.user.id:
            raise PermissionDenied("Faqat o'z xabaringizni tahrirlay olasiz.")
        if message.is_deleted:
            raise PermissionDenied("O'chirilgan xabarni tahrirlab bo'lmaydi.")
        if not user_is_university_member(request.user, message.university_id):
            return Response(
                {"detail": "Avval universitet chatiga qo'shiling."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ChatMessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message.text = serializer.validated_data["text"]
        message.updated_at = timezone.now()
        message.save(update_fields=["text", "updated_at"])

        return Response(ChatMessageSerializer(message, context={"request": request}).data)


class DirectMessageEditView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, message_id):
        message = get_object_or_404(
            DirectMessage.objects.select_related("thread", "sender", "sender__profile").prefetch_related(
                "reactions"
            ),
            pk=message_id,
        )
        if message.sender_id != request.user.id:
            raise PermissionDenied("Faqat o'z xabaringizni tahrirlay olasiz.")
        if message.is_deleted:
            raise PermissionDenied("O'chirilgan xabarni tahrirlab bo'lmaydi.")

        thread = message.thread
        if request.user.id not in (thread.user_one_id, thread.user_two_id):
            raise PermissionDenied("Bu suhbatga kira olmaysiz.")

        serializer = ChatMessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message.text = serializer.validated_data["text"]
        message.updated_at = timezone.now()
        message.save(update_fields=["text", "updated_at"])

        return Response(DirectMessageSerializer(message, context={"request": request}).data)
