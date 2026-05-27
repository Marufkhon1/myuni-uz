from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .support import notify_support_telegram


class SupportMessageView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        message = (request.data.get("message") or "").strip()
        if not message:
            return Response({"detail": "Xabar bo'sh bo'lmasligi kerak."}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user if request.user.is_authenticated else None
        delivered = notify_support_telegram(
            message=message,
            user_email=getattr(user, "email", "") or request.data.get("email", ""),
            user_name=getattr(user, "full_name", "") or request.data.get("name", ""),
        )

        return Response(
            {
                "accepted": True,
                "operator_notified": delivered,
            },
            status=status.HTTP_202_ACCEPTED,
        )
