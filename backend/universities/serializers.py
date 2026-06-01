from accounts.avatar_access import avatar_url_for_request, avatar_url_for_viewer
from accounts.chat_colors import resolve_chat_color_key
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers

from .models import (
    ChatMessage,
    ChatMembership,
    DirectMessage,
    DirectThread,
    Review,
    ReviewImage,
    ReviewReply,
    ReviewReport,
    StudyDirection,
    University,
)
from .review_validation import validate_aspect_rating, validate_review_text
from .review_trust_utils import MAX_REVIEW_IMAGES, is_verified_student_user
from .reaction_utils import reactions_summary_for_message
from .unread_utils import (
    direct_unread_message_count,
    group_unread_message_count,
    group_unread_sender_count,
)


def display_name_for_user(user):
    profile = getattr(user, "profile", None)
    return getattr(profile, "full_name", None) or user.get_full_name() or user.email


def chat_color_for_user(user):
    return resolve_chat_color_key(getattr(user, "profile", None))


class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = [
            "id",
            "name",
            "short_name",
            "slug",
            "location",
            "city",
            "description",
            "founded_year",
            "institution_type",
            "ownership_type",
            "summary",
            "image_url",
            "gallery_urls",
            "address",
            "phone",
            "email",
            "website",
            "telegram_url",
            "instagram_url",
            "latitude",
            "longitude",
        ]


class UniversityChatSerializer(serializers.ModelSerializer):
    member_count = serializers.IntegerField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    average_rating = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    unread_sender_count = serializers.SerializerMethodField()

    class Meta:
        model = University
        fields = [
            "id",
            "name",
            "short_name",
            "slug",
            "location",
            "city",
            "description",
            "founded_year",
            "institution_type",
            "ownership_type",
            "summary",
            "image_url",
            "member_count",
            "review_count",
            "average_rating",
            "last_message",
            "unread_count",
            "unread_sender_count",
        ]

    def get_average_rating(self, obj):
        value = getattr(obj, "average_rating", None)
        if value is None:
            return None
        return round(float(value), 1)

    def get_unread_count(self, obj):
        request = self.context.get("request")
        if not request:
            return 0
        joined_ids = self.context.get("joined_university_ids", set())
        if obj.id not in joined_ids:
            return 0
        return group_unread_message_count(request.user, obj.id)

    def get_unread_sender_count(self, obj):
        request = self.context.get("request")
        if not request:
            return 0
        joined_ids = self.context.get("joined_university_ids", set())
        if obj.id not in joined_ids:
            return 0
        return group_unread_sender_count(request.user, obj.id)

    def get_last_message(self, obj):
        joined_ids = self.context.get("joined_university_ids", set())
        if obj.id not in joined_ids:
            return None
        last_messages = self.context.get("last_messages", {})
        message = last_messages.get(obj.id)
        if not message:
            return None
        return {
            "text": message.text,
            "author": display_name_for_user(message.user),
            "created_at": message.created_at,
        }


class ChatMemberSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    display_name = serializers.CharField()
    role_label = serializers.CharField()
    university = serializers.CharField(allow_blank=True)


class ReviewSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    author_id = serializers.IntegerField(source="user.id", read_only=True)
    author_avatar_url = serializers.SerializerMethodField()
    author_role = serializers.SerializerMethodField()
    university = UniversitySerializer(read_only=True)
    university_id = serializers.PrimaryKeyRelatedField(
        queryset=University.objects.all(),
        source="university",
        write_only=True,
    )
    study_direction_id = serializers.PrimaryKeyRelatedField(
        queryset=StudyDirection.objects.all(),
        source="study_direction",
        required=False,
        allow_null=True,
    )
    study_direction_name = serializers.SerializerMethodField()
    like_count = serializers.IntegerField(read_only=True, default=0)
    helpful_count = serializers.SerializerMethodField()
    liked_by_me = serializers.BooleanField(read_only=True, default=False)
    is_mine = serializers.SerializerMethodField()
    is_verified_student = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    official_reply = serializers.SerializerMethodField()
    status = serializers.CharField(read_only=True)
    moderation_note = serializers.CharField(read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "author",
            "author_id",
            "author_avatar_url",
            "author_role",
            "university",
            "university_id",
            "study_direction_id",
            "study_direction_name",
            "rating",
            "rating_teachers",
            "rating_dormitory",
            "rating_infrastructure",
            "text",
            "status",
            "moderation_note",
            "created_at",
            "updated_at",
            "like_count",
            "helpful_count",
            "liked_by_me",
            "is_mine",
            "is_verified_student",
            "images",
            "official_reply",
        ]
        read_only_fields = [
            "id",
            "author",
            "author_id",
            "author_avatar_url",
            "author_role",
            "university",
            "study_direction_name",
            "status",
            "moderation_note",
            "created_at",
            "updated_at",
            "like_count",
            "helpful_count",
            "liked_by_me",
            "is_mine",
            "is_verified_student",
            "images",
            "official_reply",
        ]

    def get_study_direction_name(self, obj):
        if obj.study_direction_id:
            return obj.study_direction.name
        return None

    def get_helpful_count(self, obj):
        return getattr(obj, "like_count", None) or obj.likes.count()

    def get_is_verified_student(self, obj):
        return is_verified_student_user(obj.user, obj.university_id)

    def get_images(self, obj):
        request = self.context.get("request")
        items = []
        for image in obj.images.all():
            url = image.image.url
            if request:
                url = request.build_absolute_uri(url)
            items.append(
                {
                    "id": image.id,
                    "url": url,
                    "caption": image.caption,
                }
            )
        return items

    def get_official_reply(self, obj):
        try:
            reply = obj.official_reply
        except ObjectDoesNotExist:
            return None
        author_name = "MyUni jamoasi"
        if reply.author_id:
            author_name = display_name_for_user(reply.author)
        return {
            "text": reply.text,
            "author": author_name,
            "created_at": reply.created_at,
            "updated_at": reply.updated_at,
        }

    def get_author(self, obj):
        profile = getattr(obj.user, "profile", None)
        return getattr(profile, "full_name", None) or obj.user.get_full_name() or obj.user.email

    def get_author_avatar_url(self, obj):
        request = self.context.get("request")
        return avatar_url_for_request(request, obj.user)

    def get_author_role(self, obj):
        profile = getattr(obj.user, "profile", None)
        return getattr(profile, "role", "")

    def get_is_mine(self, obj):
        request = self.context.get("request")
        return bool(request and request.user.is_authenticated and request.user.id == obj.user_id)

    def validate_text(self, value):
        return validate_review_text(value)

    def validate_rating_teachers(self, value):
        if self.instance is None or value is not None:
            return validate_aspect_rating(value, "O'qituvchilar")
        return value

    def validate_rating_dormitory(self, value):
        if self.instance is None or value is not None:
            return validate_aspect_rating(value, "Yotoqxona")
        return value

    def validate_rating_infrastructure(self, value):
        if self.instance is None or value is not None:
            return validate_aspect_rating(value, "Infratuzilma")
        return value

    def validate(self, attrs):
        request = self.context.get("request")
        university = attrs.get("university") or getattr(self.instance, "university", None)
        if self.instance is None and request and university:
            if Review.objects.filter(user=request.user, university=university).exists():
                raise serializers.ValidationError(
                    {"university_id": "Bu universitet uchun allaqachon sharh qoldirgansiz."}
                )
            if attrs.get("study_direction") and attrs["study_direction"].faculty.university_id != university.id:
                raise serializers.ValidationError(
                    {"study_direction_id": "Yo'nalish tanlangan universitetga tegishli emas."}
                )
            for field, label in (
                ("rating_teachers", "O'qituvchilar"),
                ("rating_dormitory", "Yotoqxona"),
                ("rating_infrastructure", "Infratuzilma"),
            ):
                validate_aspect_rating(attrs.get(field), label)
        return attrs

    def create(self, validated_data):
        return Review.objects.create(user=self.context["request"].user, **validated_data)


class ReviewReportSerializer(serializers.Serializer):
    reason = serializers.ChoiceField(choices=ReviewReport.Reason.choices)
    details = serializers.CharField(required=False, allow_blank=True, max_length=500)

    def validate(self, attrs):
        reason = attrs.get("reason")
        details = (attrs.get("details") or "").strip()
        attrs["details"] = details
        if reason == ReviewReport.Reason.OTHER and len(details) < 5:
            raise serializers.ValidationError(
                {"details": "«Boshqa» sabab uchun kamida 5 belgi yozing."}
            )
        return attrs


class MessageReportSerializer(serializers.Serializer):
    reason = serializers.ChoiceField(choices=["insult", "abuse", "other"])
    details = serializers.CharField(required=False, allow_blank=True, max_length=500)

    def validate(self, attrs):
        reason = attrs.get("reason")
        details = (attrs.get("details") or "").strip()
        attrs["details"] = details
        if reason == "other" and len(details) < 5:
            raise serializers.ValidationError(
                {"details": "Boshqa sabab uchun kamida 5 ta belgi yozing."}
            )
        return attrs


class ChatMessageSerializer(serializers.ModelSerializer):
    author_id = serializers.IntegerField(source="user.id", read_only=True)
    author = serializers.SerializerMethodField()
    author_color = serializers.SerializerMethodField()
    university_id = serializers.IntegerField(source="university.id", read_only=True)
    is_mine = serializers.SerializerMethodField()
    is_edited = serializers.SerializerMethodField()
    reactions = serializers.SerializerMethodField()
    my_reaction = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "university_id",
            "author_id",
            "author",
            "author_color",
            "text",
            "tags",
            "created_at",
            "updated_at",
            "is_edited",
            "is_mine",
            "reactions",
            "my_reaction",
        ]
        read_only_fields = fields

    def get_author(self, obj):
        return display_name_for_user(obj.user)

    def get_author_color(self, obj):
        return chat_color_for_user(obj.user)

    def get_is_mine(self, obj):
        request = self.context.get("request")
        return bool(request and request.user.id == obj.user_id)

    def get_is_edited(self, obj):
        return bool(obj.updated_at)

    def _reaction_context(self, obj):
        request = self.context.get("request")
        user = request.user if request else None
        return reactions_summary_for_message(obj, user)

    def get_reactions(self, obj):
        return self._reaction_context(obj)["reactions"]

    def get_my_reaction(self, obj):
        return self._reaction_context(obj)["my_reaction"]


class ChatMessageCreateSerializer(serializers.Serializer):
    text = serializers.CharField(max_length=4000)


class DirectMessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.IntegerField(source="sender.id", read_only=True)
    sender_name = serializers.SerializerMethodField()
    sender_color = serializers.SerializerMethodField()
    is_mine = serializers.SerializerMethodField()
    is_edited = serializers.SerializerMethodField()
    reactions = serializers.SerializerMethodField()
    my_reaction = serializers.SerializerMethodField()

    class Meta:
        model = DirectMessage
        fields = [
            "id",
            "sender_id",
            "sender_name",
            "sender_color",
            "text",
            "created_at",
            "updated_at",
            "is_edited",
            "is_mine",
            "reactions",
            "my_reaction",
        ]
        read_only_fields = fields

    def get_sender_name(self, obj):
        return display_name_for_user(obj.sender)

    def get_sender_color(self, obj):
        return chat_color_for_user(obj.sender)

    def get_is_mine(self, obj):
        request = self.context.get("request")
        return bool(request and request.user.id == obj.sender_id)

    def get_is_edited(self, obj):
        return bool(obj.updated_at)

    def _reaction_context(self, obj):
        request = self.context.get("request")
        user = request.user if request else None
        return reactions_summary_for_message(obj, user)

    def get_reactions(self, obj):
        return self._reaction_context(obj)["reactions"]

    def get_my_reaction(self, obj):
        return self._reaction_context(obj)["my_reaction"]


class DirectThreadSerializer(serializers.ModelSerializer):
    other_user_id = serializers.SerializerMethodField()
    other_user_name = serializers.SerializerMethodField()
    other_user_avatar_url = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    both_replied = serializers.SerializerMethodField()
    other_user_blocked_by_me = serializers.SerializerMethodField()
    has_block_relationship = serializers.SerializerMethodField()

    class Meta:
        model = DirectThread
        fields = [
            "id",
            "other_user_id",
            "other_user_name",
            "other_user_avatar_url",
            "last_message",
            "updated_at",
            "unread_count",
            "both_replied",
            "other_user_blocked_by_me",
            "has_block_relationship",
        ]

    def get_unread_count(self, obj):
        request = self.context.get("request")
        if not request:
            return 0
        return direct_unread_message_count(request.user, obj)

    def get_other_user(self, obj):
        request = self.context.get("request")
        if not request:
            return None
        if obj.user_one_id == request.user.id:
            return obj.user_two
        return obj.user_one

    def get_other_user_id(self, obj):
        other = self.get_other_user(obj)
        return other.id if other else None

    def get_other_user_name(self, obj):
        other = self.get_other_user(obj)
        return display_name_for_user(other) if other else ""

    def get_other_user_avatar_url(self, obj):
        request = self.context.get("request")
        other = self.get_other_user(obj)
        if not request or not other:
            return None
        from .chat_community_utils import should_hide_avatar_due_to_block

        if should_hide_avatar_due_to_block(other.id, request.user.id):
            return None
        return avatar_url_for_viewer(request.user, other, request=request)

    def get_other_user_blocked_by_me(self, obj):
        from .chat_community_utils import user_has_blocked_other

        request = self.context.get("request")
        other = self.get_other_user(obj)
        if not request or not other:
            return False
        return user_has_blocked_other(request.user.id, other.id)

    def get_has_block_relationship(self, obj):
        from .chat_community_utils import users_are_blocked

        request = self.context.get("request")
        other = self.get_other_user(obj)
        if not request or not other:
            return False
        return users_are_blocked(request.user.id, other.id)

    def get_last_message(self, obj):
        from .chat_community_utils import filter_direct_messages_for_viewer

        request = self.context.get("request")
        if not request:
            return None

        last = (
            filter_direct_messages_for_viewer(
                DirectMessage.objects.filter(thread_id=obj.id, is_deleted=False),
                request.user,
            )
            .order_by("-created_at")
            .first()
        )
        if not last:
            return None
        return {
            "text": last.text,
            "created_at": last.created_at,
            "sender_id": last.sender_id,
        }

    def get_both_replied(self, obj):
        from .chat_utils import direct_thread_both_replied

        return direct_thread_both_replied(obj)


class DirectThreadCreateSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
