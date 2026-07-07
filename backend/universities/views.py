from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.db.models import Avg, Count, Exists, OuterRef, Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.notifications_service import notify_review_liked, notify_review_pending
from accounts.rate_limit_utils import rate_limit_response
from accounts.avatar_access import avatar_url_for_viewer
from accounts.chat_colors import resolve_chat_color_key
from accounts.presence import is_user_online, resolve_user_last_seen
from accounts.profile_access import can_view_chat_profile
from accounts.permissions import CanWriteStudentContent

from django.utils import timezone

from .catalog_utils import parse_compare_ids
from .chat_community_utils import (
    extract_hashtags,
    filter_messages_by_tag,
    filter_university_messages_for_viewer,
    user_has_blocked_other,
)
from .compare_utils import build_compare_row, build_compare_rows, build_highlights, build_public_compare_snapshot
from .compare_share_utils import compare_share_expires_at, generate_compare_share_token
from .chat_permissions import require_university_member, user_is_university_member
from .chat_utils import annotate_direct_threads_both_replied, get_or_create_direct_thread
from .unread_utils import mark_direct_thread_read, mark_university_read
from .chat_realtime import (
    direct_typing_cache_key,
    get_typing_users,
    set_typing_user,
    typing_cache_key,
)
from .models import (
    ChatMembership,
    ChatMessage,
    ChatMessageReaction,
    CompareShareLink,
    DirectMessage,
    DirectMessageReaction,
    DirectThread,
    Review,
    ReviewImage,
    ReviewLike,
    StudyDirection,
    University,
    UniversityFavorite,
)
from .review_trust_utils import (
    MAX_REVIEW_IMAGES,
    MAX_REVIEW_IMAGE_BYTES,
    annotate_reviews_with_likes,
    aspect_averages_for_university,
    generate_review_insight_summary,
    university_review_stats_map,
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
            member_count=Count("chat_memberships", distinct=True),
            review_count=Count(
                "reviews",
                filter=Q(reviews__status=Review.Status.APPROVED),
                distinct=True,
            ),
            average_rating=Avg(
                "reviews__rating",
                filter=Q(reviews__status=Review.Status.APPROVED),
            ),
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        joined_university_ids = set(
            ChatMembership.objects.filter(user=request.user).values_list("university_id", flat=True)
        )
        last_by_university = {}

        if joined_university_ids:
            for message in (
                ChatMessage.objects.filter(university_id__in=joined_university_ids)
                .select_related("user", "user__profile")
                .order_by("university_id", "-created_at")
            ):
                if message.university_id not in last_by_university:
                    last_by_university[message.university_id] = message

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
        viewer_is_member = user_is_university_member(request.user, university_id)
        memberships = ChatMembership.objects.filter(university=university).select_related(
            "user", "user__profile"
        )
        members = []
        for membership in memberships:
            profile = getattr(membership.user, "profile", None)
            can_open_profile = can_view_chat_profile(
                request.user, membership.user, university_id=university.id
            )
            last_seen_at = profile.last_seen_at if profile else None
            member_payload = {
                "id": membership.user.id,
                "display_name": display_name_for_user(membership.user),
                "avatar_url": avatar_url_for_viewer(
                    request.user, membership.user, request=request
                ),
                "role_label": profile.get_role_display() if profile else "",
                "university": (profile.university if profile else "") or "",
                "bio": (profile.bio if profile else "") or "",
                "chat_color": resolve_chat_color_key(profile),
                "is_me": membership.user.id == request.user.id,
                "can_open_profile": can_open_profile,
                "has_joined_chat": True,
            }
            if viewer_is_member:
                resolved_last_seen = resolve_user_last_seen(membership.user)
                member_payload["is_online"] = is_user_online(last_seen_at)
                member_payload["last_seen_at"] = (
                    resolved_last_seen.isoformat() if resolved_last_seen else None
                )
            members.append(member_payload)
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
        university_ids, error = parse_compare_ids(ids_param)
        if error:
            return Response({"detail": error}, status=status.HTTP_400_BAD_REQUEST)

        universities = list(University.objects.filter(pk__in=university_ids))
        if len(universities) != len(university_ids):
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

        cache_key = f"compare:v2:{request.user.id}:{ids_param}"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)

        rows = build_compare_rows(universities, joined_ids, favorite_ids)
        payload = {"universities": rows, "highlights": build_highlights(rows)}
        cache.set(cache_key, payload, timeout=300)
        return Response(payload)


class CompareShareCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ids_param = request.data.get("ids", "")
        university_ids, error = parse_compare_ids(ids_param)
        if error:
            return Response({"detail": error}, status=status.HTTP_400_BAD_REQUEST)

        universities = list(University.objects.filter(pk__in=university_ids))
        if len(universities) != len(university_ids):
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

        rows = build_compare_rows(universities, joined_ids, favorite_ids)
        highlights = build_highlights(rows)
        snapshot = build_public_compare_snapshot(rows, highlights)
        expires_at = compare_share_expires_at()

        share = CompareShareLink.objects.create(
            token=generate_compare_share_token(),
            created_by=request.user,
            snapshot=snapshot,
            expires_at=expires_at,
        )

        return Response(
            {
                "token": share.token,
                "expires_at": share.expires_at.isoformat(),
                "university_ids": university_ids,
            },
            status=status.HTTP_201_CREATED,
        )


class UniversityDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, university_id):
        from .catalog_utils import serialize_faculty
        from .compare_utils import rating_distribution

        university = get_object_or_404(University, pk=university_id)
        stats = Review.objects.filter(
            university=university,
            status=Review.Status.APPROVED,
        ).aggregate(
            average_rating=Avg("rating"),
            review_count=Count("id"),
        )
        average = stats["average_rating"]
        member_count = ChatMembership.objects.filter(university=university).count()
        aspects = aspect_averages_for_university(university.id)
        directions = list(
            StudyDirection.objects.filter(faculty__university=university)
            .order_by("sort_order", "name")
            .values("id", "name")
        )
        faculties = [
            serialize_faculty(faculty)
            for faculty in university.faculties.prefetch_related("directions").order_by("sort_order", "name")
        ]
        return Response(
            {
                **UniversitySerializer(university).data,
                "average_rating": round(average, 1) if average is not None else None,
                "review_count": stats["review_count"] or 0,
                "member_count": member_count,
                "rating_distribution": rating_distribution(university.id),
                "aspect_averages": aspects,
                "review_insight_summary": generate_review_insight_summary(university.id),
                "study_directions": directions,
                "faculties": faculties,
            }
        )


def _save_review_images(review, files):
    if not files:
        return
    if len(files) > MAX_REVIEW_IMAGES:
        raise ValidationError(
            {"images": f"Bir sharhga ko'pi bilan {MAX_REVIEW_IMAGES} ta rasm biriktirish mumkin."}
        )
    for index, uploaded in enumerate(files):
        if uploaded.size > MAX_REVIEW_IMAGE_BYTES:
            raise ValidationError(
                {"images": "Har bir rasm hajmi 5 MB dan oshmasligi kerak."}
            )
        ReviewImage.objects.create(
            review=review,
            image=uploaded,
            sort_order=index,
        )


class PopularReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Review.objects.filter(status=Review.Status.APPROVED).select_related(
            "university",
            "user",
            "user__profile",
            "study_direction",
            "official_reply",
            "official_reply__author",
        ).prefetch_related("images")
        return annotate_reviews_with_likes(queryset, self.request.user).order_by(
            "-like_count", "-created_at"
        )[:30]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        # Sliced queryset — distinct() ishlatib bo'lmaydi; ID larni Python orqali yig'amiz.
        university_ids = list(
            {
                university_id
                for university_id in queryset.values_list("university_id", flat=True)
                if university_id is not None
            }
        )
        stats_map = university_review_stats_map(university_ids)
        serializer = self.get_serializer(
            queryset,
            many=True,
            context={**self.get_serializer_context(), "university_stats": stats_map},
        )
        return Response(serializer.data)


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = Review.objects.select_related(
            "university",
            "user",
            "user__profile",
            "study_direction",
            "official_reply",
            "official_reply__author",
        ).prefetch_related("images")
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
            return rate_limit_response(limit_message, retry_after)

        response = super().create(request, *args, **kwargs)
        if response.status_code == status.HTTP_201_CREATED:
            record_review_submit(request, request.user.id)
        return response

    def perform_create(self, serializer):
        status_value = initial_review_status()
        review = serializer.save(status=status_value)
        files = self.request.FILES.getlist("images")
        _save_review_images(review, files)
        if status_value == Review.Status.PENDING:
            notify_moderators_new_review(review)
            notify_review_pending(review)


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReviewSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    lookup_url_kwarg = "review_id"

    def get_queryset(self):
        queryset = Review.objects.select_related(
            "university",
            "user",
            "user__profile",
            "study_direction",
            "official_reply",
            "official_reply__author",
        ).prefetch_related("images")
        return annotate_reviews_with_likes(
            reviews_visible_to_user(queryset, self.request.user),
            self.request.user,
        )

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH"):
            return [IsAuthenticated(), CanWriteStudentContent()]
        if self.request.method == "DELETE":
            return [IsAuthenticated(), CanWriteStudentContent()]
        return [IsAuthenticated()]

    def perform_update(self, serializer):
        review = self.get_object()
        if review.user_id != self.request.user.id:
            raise PermissionDenied("Faqat o'z sharhingizni tahrirlashingiz mumkin.")
        status_value = initial_review_status() if moderation_enabled() else Review.Status.APPROVED
        review = serializer.save(status=status_value)
        files = self.request.FILES.getlist("images")
        if files:
            review.images.all().delete()
            _save_review_images(review, files)
        if status_value == Review.Status.PENDING:
            notify_moderators_new_review(review)
            notify_review_pending(review)

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
            notify_review_liked(review=review, liker=request.user)

        like_count = ReviewLike.objects.filter(review=review).count()
        return Response({"liked": liked, "like_count": like_count})


class JoinedUniversityListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        university_ids = ChatMembership.objects.filter(user=request.user).values_list(
            "university_id", flat=True
        )
        return Response({"university_ids": list(university_ids)})


class JoinedChatsTypingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        university_ids = ChatMembership.objects.filter(user=request.user).values_list(
            "university_id", flat=True
        )
        typing = {}
        for university_id in university_ids:
            users = get_typing_users(
                typing_cache_key(university_id),
                exclude_user_id=request.user.id,
            )
            if users:
                typing[str(university_id)] = users
        return Response({"typing": typing})


class DirectThreadsTypingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        threads = DirectThread.objects.filter(
            Q(user_one=request.user) | Q(user_two=request.user)
        )
        typing = {}
        for thread in threads:
            users = get_typing_users(
                direct_typing_cache_key(thread.id),
                exclude_user_id=request.user.id,
            )
            if users:
                typing[str(thread.id)] = users
        return Response({"typing": typing})


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
        messages = filter_university_messages_for_viewer(
            messages, request.user, university_id
        )
        tag = (request.query_params.get("tag") or "").strip().lstrip("#").lower()
        if tag:
            messages = filter_messages_by_tag(messages, tag)
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
        text = serializer.validated_data["text"]
        message = ChatMessage.objects.create(
            university=university,
            user=request.user,
            text=text,
            tags=extract_hashtags(text),
        )
        from accounts.chat_notify import notify_group_chat_message

        notify_group_chat_message(message)
        payload = ChatMessageSerializer(message, context={"request": request}).data
        from .ws_broadcast import broadcast_university_messages

        broadcast_university_messages(university.id, [payload])
        return Response(
            payload,
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
        from .ws_broadcast import broadcast_university_typing

        users = get_typing_users(typing_cache_key(university_id), exclude_user_id=request.user.id)
        broadcast_university_typing(university_id, users)
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
        from .ws_broadcast import broadcast_direct_typing

        users = get_typing_users(direct_typing_cache_key(thread.id), exclude_user_id=request.user.id)
        broadcast_direct_typing(thread.id, users)
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
        if user_has_blocked_other(request.user.id, other_user.id):
            return Response(
                {"detail": "Bloklangan foydalanuvchi bilan yangi shaxsiy chat ochib bo'lmaydi."},
                status=status.HTTP_403_FORBIDDEN,
            )

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
        from .chat_community_utils import filter_direct_messages_for_viewer
        from .pin_utils import get_pinned_direct_message

        thread = self.get_thread_for_user(request, thread_id)
        messages = filter_direct_messages_for_viewer(
            DirectMessage.objects.filter(thread=thread, is_deleted=False)
            .select_related("sender", "sender__profile")
            .prefetch_related("reactions")
            .order_by("created_at"),
            request.user,
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
        other_user_id = (
            thread.user_two_id
            if thread.user_one_id == request.user.id
            else thread.user_one_id
        )
        if user_has_blocked_other(request.user.id, other_user_id):
            return Response(
                {"detail": "Bloklangan foydalanuvchiga xabar yuborib bo'lmaydi."},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = ChatMessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = DirectMessage.objects.create(
            thread=thread,
            sender=request.user,
            text=serializer.validated_data["text"],
        )
        thread.save(update_fields=["updated_at"])
        from accounts.chat_notify import notify_direct_chat_message

        notify_direct_chat_message(message)
        payload = DirectMessageSerializer(message, context={"request": request}).data
        from .ws_broadcast import broadcast_direct_messages

        broadcast_direct_messages(thread.id, [payload])
        return Response(
            payload,
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
