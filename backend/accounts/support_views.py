from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .rate_limit_utils import rate_limit_response
from .support import notify_support_telegram
from .support_limits import check_support_message_allowed, record_support_message_request


class SupportMessageView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        allowed, detail, retry_after = check_support_message_allowed(request)
        if not allowed:
            return rate_limit_response(detail, retry_after)

        message = (request.data.get("message") or "").strip()
        if not message:
            return Response({"detail": "Xabar bo'sh bo'lmasligi kerak."}, status=status.HTTP_400_BAD_REQUEST)
        if len(message) > 4000:
            return Response(
                {"detail": "Xabar juda uzun (maksimum 4000 belgi)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        record_support_message_request(request)

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
