from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user)[:50]
        unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
        serializer = NotificationSerializer(notifications, many=True)
        return Response({"unread_count": unread_count, "results": serializer.data})


class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        notification_id = request.data.get("id")
        if notification_id:
            updated = Notification.objects.filter(
                user=request.user,
                id=notification_id,
                is_read=False,
            ).update(is_read=True)
            return Response({"updated": updated})

        updated = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"updated": updated})
