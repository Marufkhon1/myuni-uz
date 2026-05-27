from accounts.avatar_access import avatar_url_for_request, avatar_url_for_viewer
from rest_framework import serializers

from .models import ChatMessage, ChatMembership, DirectMessage, DirectThread, Review, University
from .reaction_utils import reactions_summary_for_message
from .unread_utils import (
    direct_unread_message_count,
    group_unread_message_count,
    group_unread_sender_count,
)


def display_name_for_user(user):
    profile = getattr(user, "profile", None)
    return getattr(profile, "full_name", None) or user.get_full_name() or user.email


class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = [
            "id",
            "name",
            "short_name",
            "location",
            "description",
            "founded_year",
            "institution_type",
            "summary",
            "image_url",
        ]


class UniversityChatSerializer(serializers.ModelSerializer):
    member_count = serializers.IntegerField(read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    unread_sender_count = serializers.SerializerMethodField()

    class Meta:
        model = University
        fields = [
            "id",
            "name",
            "short_name",
            "location",
            "description",
            "founded_year",
            "institution_type",
            "summary",
            "image_url",
            "member_count",
            "last_message",
            "unread_count",
            "unread_sender_count",
        ]

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
    like_count = serializers.IntegerField(read_only=True, default=0)
    liked_by_me = serializers.BooleanField(read_only=True, default=False)

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
            "rating",
            "text",
            "created_at",
            "like_count",
            "liked_by_me",
        ]
        read_only_fields = [
            "id",
            "author",
            "author_id",
            "author_avatar_url",
            "author_role",
            "university",
            "created_at",
            "like_count",
            "liked_by_me",
        ]

    def get_author(self, obj):
        profile = getattr(obj.user, "profile", None)
        return getattr(profile, "full_name", None) or obj.user.get_full_name() or obj.user.email

    def get_author_avatar_url(self, obj):
        request = self.context.get("request")
        return avatar_url_for_request(request, obj.user)

    def get_author_role(self, obj):
        profile = getattr(obj.user, "profile", None)
        return getattr(profile, "role", "")

    def create(self, validated_data):
        return Review.objects.create(user=self.context["request"].user, **validated_data)


class ChatMessageSerializer(serializers.ModelSerializer):
    author_id = serializers.IntegerField(source="user.id", read_only=True)
    author = serializers.SerializerMethodField()
    university_id = serializers.IntegerField(source="university.id", read_only=True)
    is_mine = serializers.SerializerMethodField()
    reactions = serializers.SerializerMethodField()
    my_reaction = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "university_id",
            "author_id",
            "author",
            "text",
            "created_at",
            "is_mine",
            "reactions",
            "my_reaction",
        ]
        read_only_fields = fields

    def get_author(self, obj):
        return display_name_for_user(obj.user)

    def get_is_mine(self, obj):
        request = self.context.get("request")
        return bool(request and request.user.id == obj.user_id)

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
    is_mine = serializers.SerializerMethodField()
    reactions = serializers.SerializerMethodField()
    my_reaction = serializers.SerializerMethodField()

    class Meta:
        model = DirectMessage
        fields = [
            "id",
            "sender_id",
            "sender_name",
            "text",
            "created_at",
            "is_mine",
            "reactions",
            "my_reaction",
        ]
        read_only_fields = fields

    def get_sender_name(self, obj):
        return display_name_for_user(obj.sender)

    def get_is_mine(self, obj):
        request = self.context.get("request")
        return bool(request and request.user.id == obj.sender_id)

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
        return avatar_url_for_viewer(request.user, other, request=request)

    def get_last_message(self, obj):
        last = obj.messages.order_by("-created_at").first()
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
