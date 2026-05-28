from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .chat_permissions import require_university_member
from .pin_utils import (
    get_pinned_direct_message,
    get_pinned_university_message,
    pin_direct_message,
    pin_university_message,
    unpin_direct_message,
    unpin_university_message,
)
from .views import DirectMessageListCreateView, UniversityMessageListCreateView


class UniversityMessagePinView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, university_id, message_id):
        if not require_university_member(request.user, university_id):
            return Response({"detail": "Ruxsat yo'q."}, status=status.HTTP_403_FORBIDDEN)
        pinned = pin_university_message(request, university_id, message_id)
        return Response({"pinned": pinned})

    def delete(self, request, university_id, message_id):
        if not require_university_member(request.user, university_id):
            return Response({"detail": "Ruxsat yo'q."}, status=status.HTTP_403_FORBIDDEN)
        unpin_university_message(university_id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class DirectMessagePinView(APIView):
    permission_classes = [IsAuthenticated]

    def get_thread(self, request, thread_id):
        return DirectMessageListCreateView().get_thread_for_user(request, thread_id)

    def post(self, request, thread_id, message_id):
        self.get_thread(request, thread_id)
        pinned = pin_direct_message(request, thread_id, message_id)
        return Response({"pinned": pinned})

    def delete(self, request, thread_id, message_id):
        self.get_thread(request, thread_id)
        unpin_direct_message(thread_id)
        return Response(status=status.HTTP_204_NO_CONTENT)
