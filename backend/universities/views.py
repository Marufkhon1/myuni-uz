from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, Exists, OuterRef, Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.avatar_access import avatar_url_for_viewer
from accounts.profile_access import can_view_chat_profile
from accounts.permissions import CanWriteStudentContent

from django.utils import timezone

from .compare_utils import build_compare_row, build_highlights
from .chat_permissions import require_university_member, user_is_university_member
from .chat_utils import annotate_direct_threads_both_replied, get_or_create_direct_thread
from .unread_utils import mark_direct_thread_read, mark_university_read
from .chat_realtime import (
    direct_typing_cache_key,
    set_typing_user,
    typing_cache_key,
)
from .models import (
    ChatMembership,
    ChatMessage,
    ChatMessageReaction,
    DirectMessage,
    DirectMessageReaction,
    DirectThread,
    Review,
    ReviewLike,
    University,
    UniversityFavorite,
)
from .reaction_serializers import MessageReactionSerializer
from .reaction_utils import toggle_message_reaction
from .review_moderation import (
    initial_review_status,
    moderation_enabled,
    notify_moderators_new_review,
    reviews_visible_to_user,
)
from .serializers import (
    ChatMessageCreateSerializer,
    ChatMessageSerializer,
    DirectMessageSerializer,
    DirectThreadCreateSerializer,
    DirectThreadSerializer,
    ReviewSerializer,
    UniversityChatSerializer,
    UniversitySerializer,
    display_name_for_user,
)

User = get_user_model()


class UniversityListView(generics.ListAPIView):
    serializer_class = UniversityChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return University.objects.annotate(
            member_count=Count("chat_memberships", distinct=True)
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        university_ids = list(queryset.values_list("id", flat=True))
        last_by_university = {}

        if university_ids:
            for message in (
                ChatMessage.objects.filter(university_id__in=university_ids)
                .select_related("user", "user__profile")
                .order_by("university_id", "-created_at")
            ):
                if message.university_id not in last_by_university:
                    last_by_university[message.university_id] = message

        joined_university_ids = set(
            ChatMembership.objects.filter(user=request.user).values_list("university_id", flat=True)
        )
        serializer = self.get_serializer(
            queryset,
            many=True,
            context={
                **self.get_serializer_context(),
                "last_messages": last_by_university,
                "joined_university_ids": joined_university_ids,
            },
        )
        return Response(serializer.data)


class UniversityMembersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, university_id):
        university = get_object_or_404(University, pk=university_id)
        memberships = ChatMembership.objects.filter(university=university).select_related(
            "user", "user__profile"
        )
        members = []
        for membership in memberships:
            profile = getattr(membership.user, "profile", None)
            can_open_profile = can_view_chat_profile(
                request.user, membership.user, university_id=university.id
            )
            members.append(
                {
                    "id": membership.user.id,
                    "display_name": display_name_for_user(membership.user),
                    "avatar_url": avatar_url_for_viewer(
                        request.user, membership.user, request=request
                    ),
                    "role_label": profile.get_role_display() if profile else "",
                    "university": (profile.university if profile else "") or "",
                    "bio": (profile.bio if profile else "") or "",
                    "is_me": membership.user.id == request.user.id,
                    "can_open_profile": can_open_profile,
                }
            )
        return Response(
            {
                "university": UniversitySerializer(university).data,
                "member_count": len(members),
                "members": members,
            }
        )


class UniversityCompareView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ids_param = request.query_params.get("ids", "")
        try:
            university_ids = [int(value) for value in ids_param.split(",") if value.strip()]
        except ValueError:
            return Response(
                {"detail": "universities id lari noto'g'ri."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(university_ids) != 2:
            return Response(
                {"detail": "Taqqoslash uchun aynan 2 ta universitet tanlang."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(set(university_ids)) != 2:
            return Response(
                {"detail": "Bir xil universitetni ikki marta tanlab bo'lmaydi."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        universities = list(University.objects.filter(pk__in=university_ids))
        if len(universities) != 2:
            return Response(
                {"detail": "Tanlangan universitetlardan biri topilmadi."},
                status=status.HTTP_404_NOT_FOUND,
            )

        order = {university_id: index for index, university_id in enumerate(university_ids)}
        universities.sort(key=lambda item: order[item.id])

        joined_ids = set(
            ChatMembership.objects.filter(user=request.user).values_list(
                "university_id", flat=True
            )
        )
        favorite_ids = set(
            UniversityFavorite.objects.filter(user=request.user).values_list(
                "university_id", flat=True
            )
        )

        rows = [
            build_compare_row(university, joined_ids, favorite_ids)
            for university in universities
        ]

        return Response({"universities": rows, "highlights": build_highlights(rows)})


class UniversityDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, university_id):
        from .compare_utils import rating_distribution

        university = get_object_or_404(University, pk=university_id)
        stats = Review.objects.filter(university=university).aggregate(
            average_rating=Avg("rating"),
            review_count=Count("id"),
        )
        average = stats["average_rating"]
        member_count = ChatMembership.objects.filter(university=university).count()
        return Response(
            {
                **UniversitySerializer(university).data,
                "average_rating": round(average, 1) if average is not None else None,
                "review_count": stats["review_count"] or 0,
                "member_count": member_count,
                "rating_distribution": rating_distribution(university.id),
            }
        )


def annotate_reviews_with_likes(queryset, user):
    return queryset.annotate(
        like_count=Count("likes", distinct=True),
        liked_by_me=Exists(
            ReviewLike.objects.filter(review_id=OuterRef("pk"), user_id=user.id)
        ),
    )


class PopularReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Review.objects.filter(status=Review.Status.APPROVED).select_related(
            "university", "user", "user__profile"
        )
        return annotate_reviews_with_likes(queryset, self.request.user).order_by(
            "-like_count", "-created_at"
        )[:30]


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        queryset = Review.objects.select_related("university", "user", "user__profile")
        university_id = self.request.query_params.get("university_id")
        if university_id:
            queryset = queryset.filter(university_id=university_id)

        queryset = reviews_visible_to_user(queryset, self.request.user)
        return annotate_reviews_with_likes(queryset, self.request.user)

    def get_permissions(self):
        if self.request.method == "POST":
            return [CanWriteStudentContent()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        from .review_limits import check_review_submit_allowed, record_review_submit

        allowed, limit_message, retry_after = check_review_submit_allowed(
            request, request.user.id
        )
        if not allowed:
            return Response(
                {
                    "detail": limit_message,
                    "retry_after_seconds": retry_after,
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        response = super().create(request, *args, **kwargs)
        if response.status_code == status.HTTP_201_CREATED:
            record_review_submit(request, request.user.id)
        return response

    def perform_create(self, serializer):
        status_value = initial_review_status()
        review = serializer.save(status=status_value)
        if status_value == Review.Status.PENDING:
            notify_moderators_new_review(review)


class ReviewDetailView(generics.DestroyAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated, CanWriteStudentContent]
    lookup_url_kwarg = "review_id"

    def get_queryset(self):
        queryset = Review.objects.select_related("university", "user", "user__profile")
        return reviews_visible_to_user(queryset, self.request.user)

    def perform_destroy(self, instance):
        if instance.user_id != self.request.user.id:
            raise PermissionDenied("Faqat o'z sharhingizni o'chira olasiz.")
        instance.delete()


class ReviewLikeToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, review_id):
        review = get_object_or_404(Review, pk=review_id)
        like = ReviewLike.objects.filter(user=request.user, review=review).first()

        if like:
            like.delete()
            liked = False
        else:
            ReviewLike.objects.create(user=request.user, review=review)
            liked = True

        like_count = ReviewLike.objects.filter(review=review).count()
        return Response({"liked": liked, "like_count": like_count})


class JoinedUniversityListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        university_ids = ChatMembership.objects.filter(user=request.user).values_list(
            "university_id", flat=True
        )
        return Response({"university_ids": list(university_ids)})


class UniversityJoinView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, university_id):
        university = get_object_or_404(University, pk=university_id)
        membership, created = ChatMembership.objects.get_or_create(
            user=request.user,
            university=university,
        )
        if created or not membership.last_read_at:
            membership.last_read_at = timezone.now()
            membership.save(update_fields=["last_read_at"])
        return Response({"joined": True, "university_id": university.id})


class UniversityMessageListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, university_id):
        get_object_or_404(University, pk=university_id)
        from .pin_utils import get_pinned_university_message

        messages = (
            ChatMessage.objects.filter(university_id=university_id, is_deleted=False)
            .select_related("user", "user__profile")
            .prefetch_related("reactions")
            .order_by("created_at")
        )
        return Response(
            {
                "messages": ChatMessageSerializer(
                    messages, many=True, context={"request": request}
                ).data,
                "pinned": get_pinned_university_message(university_id, request),
            }
        )

    def post(self, request, university_id):
        university = get_object_or_404(University, pk=university_id)
        if not ChatMembership.objects.filter(user=request.user, university=university).exists():
            return Response(
                {"detail": "Avval universitet chatiga qo'shiling."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ChatMessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = ChatMessage.objects.create(
            university=university,
            user=request.user,
            text=serializer.validated_data["text"],
        )
        return Response(
            ChatMessageSerializer(message, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class UniversityLeaveView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, university_id):
        deleted, _ = ChatMembership.objects.filter(
            user=request.user, university_id=university_id
        ).delete()
        if not deleted:
            return Response(
                {"detail": "Siz bu chatda a'zo emassiz."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response({"left": True})


class UniversityTypingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, university_id):
        if not require_university_member(request.user, university_id):
            return Response(
                {"detail": "Avval universitet chatiga qo'shiling."},
                status=status.HTTP_403_FORBIDDEN,
            )
        set_typing_user(typing_cache_key(university_id), request.user)
        return Response({"ok": True})


class UniversityMessageReactionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, message_id):
        message = get_object_or_404(
            ChatMessage.objects.select_related("university").prefetch_related("reactions"),
            pk=message_id,
        )
        if not user_is_university_member(request.user, message.university_id):
            return Response(
                {"detail": "Avval universitet chatiga qo'shiling."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = MessageReactionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            toggle_message_reaction(
                ChatMessageReaction,
                message,
                request.user,
                serializer.validated_data["emoji"],
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        message = ChatMessage.objects.prefetch_related("reactions").get(pk=message_id)
        return Response(ChatMessageSerializer(message, context={"request": request}).data)


class DirectTypingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, thread_id):
        thread = get_object_or_404(
            DirectThread.objects.filter(Q(user_one=request.user) | Q(user_two=request.user)),
            pk=thread_id,
        )
        set_typing_user(direct_typing_cache_key(thread.id), request.user)
        return Response({"ok": True})


class DirectMessageReactionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, message_id):
        message = get_object_or_404(
            DirectMessage.objects.select_related("thread").prefetch_related("reactions"),
            pk=message_id,
            thread__in=DirectThread.objects.filter(
                Q(user_one=request.user) | Q(user_two=request.user)
            ),
        )

        serializer = MessageReactionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            toggle_message_reaction(
                DirectMessageReaction,
                message,
                request.user,
                serializer.validated_data["emoji"],
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        message = DirectMessage.objects.prefetch_related("reactions").get(pk=message_id)
        return Response(
            DirectMessageSerializer(message, context={"request": request}).data
        )


class FavoriteUniversityListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        favorites = UniversityFavorite.objects.filter(user=request.user).select_related(
            "university"
        )
        university_ids = [favorite.university_id for favorite in favorites]
        stats = {}
        if university_ids:
            for row in (
                Review.objects.filter(university_id__in=university_ids)
                .values("university_id")
                .annotate(average_rating=Avg("rating"), review_count=Count("id"))
            ):
                stats[row["university_id"]] = row

        payload = []
        for favorite in favorites:
            university = favorite.university
            row = stats.get(university.id, {})
            average = row.get("average_rating")
            payload.append(
                {
                    **UniversitySerializer(university).data,
                    "average_rating": round(average, 1) if average is not None else None,
                    "review_count": row.get("review_count") or 0,
                }
            )
        return Response(payload)

    def post(self, request):
        university_id = request.data.get("university_id")
        if not university_id:
            return Response(
                {"detail": "university_id kerak."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        university = get_object_or_404(University, pk=university_id)
        UniversityFavorite.objects.get_or_create(user=request.user, university=university)
        return Response({"favorited": True, "university_id": university.id})


class FavoriteUniversityDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, university_id):
        deleted, _ = UniversityFavorite.objects.filter(
            user=request.user, university_id=university_id
        ).delete()
        if not deleted:
            return Response(
                {"detail": "Sevimlilar ro'yxatida yo'q."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response({"removed": True})


class DirectThreadListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        threads = annotate_direct_threads_both_replied(
            DirectThread.objects.filter(Q(user_one=request.user) | Q(user_two=request.user))
            .filter(messages__isnull=False)
            .distinct()
            .select_related("user_one", "user_one__profile", "user_two", "user_two__profile")
            .prefetch_related("messages")
        )
        return Response(
            DirectThreadSerializer(threads, many=True, context={"request": request}).data
        )

    def post(self, request):
        serializer = DirectThreadCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        other_user = get_object_or_404(User, pk=serializer.validated_data["user_id"])

        try:
            thread, _ = get_or_create_direct_thread(request.user, other_user)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        thread.save(update_fields=["updated_at"])
        return Response(
            DirectThreadSerializer(thread, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class DirectMessageListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get_thread_for_user(self, request, thread_id):
        return get_object_or_404(
            DirectThread.objects.filter(Q(user_one=request.user) | Q(user_two=request.user)),
            pk=thread_id,
        )

    def get(self, request, thread_id):
        from .pin_utils import get_pinned_direct_message

        thread = self.get_thread_for_user(request, thread_id)
        messages = (
            DirectMessage.objects.filter(thread=thread, is_deleted=False)
            .select_related("sender", "sender__profile")
            .prefetch_related("reactions")
            .order_by("created_at")
        )
        return Response(
            {
                "messages": DirectMessageSerializer(
                    messages, many=True, context={"request": request}
                ).data,
                "pinned": get_pinned_direct_message(thread.id, request),
            }
        )

    def post(self, request, thread_id):
        thread = self.get_thread_for_user(request, thread_id)
        serializer = ChatMessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = DirectMessage.objects.create(
            thread=thread,
            sender=request.user,
            text=serializer.validated_data["text"],
        )
        thread.save(update_fields=["updated_at"])
        return Response(
            DirectMessageSerializer(message, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class UniversityMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, university_id):
        if not mark_university_read(request.user, university_id):
            return Response(
                {"detail": "Avval universitet chatiga qo'shiling."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return Response({"unread_count": 0})


class DirectThreadMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, thread_id):
        thread = get_object_or_404(
            DirectThread.objects.filter(Q(user_one=request.user) | Q(user_two=request.user)),
            pk=thread_id,
        )
        mark_direct_thread_read(request.user, thread)
        return Response({"unread_count": 0})
