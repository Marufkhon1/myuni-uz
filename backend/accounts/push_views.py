from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PushSubscription
from .push_service import get_vapid_public_key, web_push_enabled


class PushVapidPublicKeyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "enabled": web_push_enabled(),
                "public_key": get_vapid_public_key(),
            }
        )


class PushSubscribeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        endpoint = (request.data.get("endpoint") or "").strip()
        keys = request.data.get("keys") or {}
        p256dh = (keys.get("p256dh") or "").strip()
        auth = (keys.get("auth") or "").strip()

        if not endpoint or not p256dh or not auth:
            return Response(
                {"detail": "Push obuna ma'lumotlari to'liq emas."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_agent = (request.META.get("HTTP_USER_AGENT") or "")[:255]
        subscription, created = PushSubscription.objects.update_or_create(
            user=request.user,
            endpoint=endpoint,
            defaults={
                "p256dh": p256dh,
                "auth": auth,
                "user_agent": user_agent,
                "is_active": True,
            },
        )
        return Response(
            {"subscribed": True, "created": created, "id": subscription.id},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class PushUnsubscribeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        endpoint = (request.data.get("endpoint") or "").strip()
        if not endpoint:
            return Response(
                {"detail": "endpoint kerak."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        deleted, _ = PushSubscription.objects.filter(
            user=request.user, endpoint=endpoint
        ).delete()
        if not deleted:
            return Response(
                {"detail": "Obuna topilmadi."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response({"subscribed": False})
