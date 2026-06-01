from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .chat_community_utils import popular_tags_for_university
from .chat_permissions import user_is_university_member
from .models import UserBlock, UserMute

User = get_user_model()


class UserBlockView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        if request.user.id == user_id:
            return Response(
                {"detail": "O'zingizni bloklab bo'lmaydi."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        blocked_user = get_object_or_404(User, pk=user_id)
        UserBlock.objects.get_or_create(blocker=request.user, blocked=blocked_user)
        UserMute.objects.filter(
            muter=request.user,
            muted_user=blocked_user,
        ).delete()
        return Response({"blocked": True, "user_id": blocked_user.id})

    def delete(self, request, user_id):
        deleted, _ = UserBlock.objects.filter(
            blocker=request.user, blocked_id=user_id
        ).delete()
        if not deleted:
            return Response(
                {"detail": "Bu foydalanuvchi bloklangan emas."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response({"blocked": False, "user_id": user_id})


class UserMuteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        if request.user.id == user_id:
            return Response(
                {"detail": "O'zingizni mute qilib bo'lmaydi."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        muted_user = get_object_or_404(User, pk=user_id)
        university_id = request.data.get("university_id")
        university = None
        if university_id is not None:
            from .models import University

            university = get_object_or_404(University, pk=university_id)
            if not user_is_university_member(request.user, university.id):
                return Response(
                    {"detail": "Avval universitet chatiga qo'shiling."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        existing = UserMute.objects.filter(
            muter=request.user,
            muted_user=muted_user,
            university=university,
        ).first()
        if not existing:
            UserMute.objects.create(
                muter=request.user,
                muted_user=muted_user,
                university=university,
            )
        return Response(
            {
                "muted": True,
                "user_id": muted_user.id,
                "university_id": university.id if university else None,
            }
        )

    def delete(self, request, user_id):
        university_id = request.data.get("university_id")
        qs = UserMute.objects.filter(muter=request.user, muted_user_id=user_id)
        if university_id is None:
            qs = qs.filter(university_id__isnull=True)
        else:
            qs = qs.filter(university_id=university_id)
        deleted, _ = qs.delete()
        if not deleted:
            return Response(
                {"detail": "Bu foydalanuvchi mute qilingan emas."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response({"muted": False, "user_id": user_id})


class BlockedUsersListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .serializers import display_name_for_user

        blocks = (
            UserBlock.objects.filter(blocker=request.user)
            .select_related("blocked", "blocked__profile")
            .order_by("-created_at")
        )
        payload = [
            {
                "id": block.blocked_id,
                "display_name": display_name_for_user(block.blocked),
                "blocked_at": block.created_at,
            }
            for block in blocks
        ]
        blocked_me = (
            UserBlock.objects.filter(blocked_id=request.user.id)
            .select_related("blocker", "blocker__profile")
            .order_by("-created_at")
        )
        blocked_me_payload = [
            {
                "id": block.blocker_id,
                "display_name": display_name_for_user(block.blocker),
                "blocked_at": block.created_at,
            }
            for block in blocked_me
        ]
        return Response({"blocked_users": payload, "blocked_me_users": blocked_me_payload})


class MutedUsersListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .serializers import display_name_for_user

        mutes = (
            UserMute.objects.filter(muter=request.user)
            .select_related("muted_user", "muted_user__profile")
            .order_by("-created_at")
        )
        payload = [
            {
                "id": mute.muted_user_id,
                "display_name": display_name_for_user(mute.muted_user),
                "university_id": mute.university_id,
                "muted_at": mute.created_at,
            }
            for mute in mutes
        ]
        return Response({"muted_users": payload})


class UniversityChatTagsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, university_id):
        if not user_is_university_member(request.user, university_id):
            return Response(
                {"detail": "Avval universitet chatiga qo'shiling."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return Response({"tags": popular_tags_for_university(university_id)})
