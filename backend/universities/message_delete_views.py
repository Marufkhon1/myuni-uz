from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .chat_permissions import user_is_university_member
from .models import ChatMessage, DirectMessage


class UniversityMessageDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, message_id):
        message = get_object_or_404(ChatMessage, pk=message_id)
        if message.user_id != request.user.id:
            raise PermissionDenied("Faqat o'z xabaringizni o'chira olasiz.")
        if message.is_deleted:
            return Response(status=status.HTTP_204_NO_CONTENT)
        if not user_is_university_member(request.user, message.university_id):
            return Response(
                {"detail": "Avval universitet chatiga qo'shiling."},
                status=status.HTTP_403_FORBIDDEN,
            )

        message.is_deleted = True
        message.updated_at = timezone.now()
        message.save(update_fields=["is_deleted", "updated_at"])
        from .ws_broadcast import broadcast_university_message_deletes

        broadcast_university_message_deletes(message.university_id, [message.id])
        return Response(status=status.HTTP_204_NO_CONTENT)


class DirectMessageDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, message_id):
        message = get_object_or_404(DirectMessage.objects.select_related("thread"), pk=message_id)
        if message.sender_id != request.user.id:
            raise PermissionDenied("Faqat o'z xabaringizni o'chira olasiz.")
        if message.is_deleted:
            return Response(status=status.HTTP_204_NO_CONTENT)

        thread = message.thread
        if request.user.id not in (thread.user_one_id, thread.user_two_id):
            raise PermissionDenied("Bu suhbatga kira olmaysiz.")

        message.is_deleted = True
        message.updated_at = timezone.now()
        message.save(update_fields=["is_deleted", "updated_at"])
        from .ws_broadcast import broadcast_direct_message_deletes

        broadcast_direct_message_deletes(thread.id, [message.id])
        return Response(status=status.HTTP_204_NO_CONTENT)
