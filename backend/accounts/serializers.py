from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db.models import Q
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .avatar_access import avatar_url_for_viewer
from .chat_colors import resolve_chat_color_key
from .models import Notification, Profile
from .presence import is_user_online, resolve_user_last_seen
from .username_validation import normalize_username, validate_username_format

User = get_user_model()


class ProfileSerializer(serializers.ModelSerializer):
    role_label = serializers.CharField(source="get_role_display", read_only=True)
    avatar_visibility_label = serializers.CharField(source="get_avatar_visibility_display", read_only=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            "role",
            "role_label",
            "full_name",
            "university",
            "study_program",
            "avatar_url",
            "avatar_visibility",
            "avatar_visibility_label",
            "chat_color",
            "bio",
            "is_moderator",
        ]

    def get_avatar_url(self, obj):
        if not obj.avatar:
            return None
        request = self.context.get("request")
        url = obj.avatar.url
        if request:
            return request.build_absolute_uri(url)
        return url

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["chat_color_resolved"] = resolve_chat_color_key(instance)
        data["email_verified"] = bool(instance.email_verified_at)
        return data


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "profile"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        if request and data.get("profile"):
            profile = getattr(instance, "profile", None)
            if profile and profile.avatar:
                data["profile"]["avatar_url"] = request.build_absolute_uri(profile.avatar.url)
        return data


class PublicUserSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    role = serializers.CharField(source="profile.role", read_only=True)
    role_label = serializers.CharField(source="profile.get_role_display", read_only=True)
    university = serializers.CharField(source="profile.university", read_only=True)
    study_program = serializers.CharField(source="profile.study_program", read_only=True)
    bio = serializers.CharField(source="profile.bio", read_only=True)
    chat_color = serializers.SerializerMethodField()
    last_seen_at = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()
    blocked_by_me = serializers.SerializerMethodField()
    has_block_relationship = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "display_name",
            "avatar_url",
            "role",
            "role_label",
            "university",
            "study_program",
            "bio",
            "chat_color",
            "last_seen_at",
            "is_online",
            "blocked_by_me",
            "has_block_relationship",
        ]

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        if not request:
            return None
        from universities.chat_community_utils import should_hide_avatar_due_to_block

        if should_hide_avatar_due_to_block(obj.id, request.user.id):
            return None
        return avatar_url_for_viewer(request.user, obj, request=request)

    def get_last_seen_at(self, obj):
        seen_at = resolve_user_last_seen(obj)
        return seen_at.isoformat() if seen_at else None

    def get_is_online(self, obj):
        profile = getattr(obj, "profile", None)
        if profile and profile.last_seen_at:
            return is_user_online(profile.last_seen_at)
        return False

    def get_blocked_by_me(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        from universities.chat_community_utils import user_has_blocked_other

        return user_has_blocked_other(request.user.id, obj.id)

    def get_has_block_relationship(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        from universities.chat_community_utils import users_are_blocked

        return users_are_blocked(request.user.id, obj.id)

    def get_chat_color(self, obj):
        return resolve_chat_color_key(getattr(obj, "profile", None))

    def get_display_name(self, obj):
        profile = getattr(obj, "profile", None)
        return getattr(profile, "full_name", None) or obj.get_full_name() or obj.email


class RegisterSerializer(serializers.Serializer):
    ROLE_CHOICES = (
        ("applicant", "Abituriyent"),
        ("student", "Talaba"),
    )

    full_name = serializers.CharField(max_length=160)
    username = serializers.CharField(min_length=3, max_length=30)
    email = serializers.EmailField(max_length=254)
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=ROLE_CHOICES)
    university = serializers.CharField(max_length=180, required=True, allow_blank=False)
    study_program = serializers.CharField(max_length=180, required=False, allow_blank=True)

    def validate_username(self, value):
        normalized_username = normalize_username(value)
        validate_username_format(normalized_username)
        if User.objects.filter(username=normalized_username).exists():
            raise serializers.ValidationError("Bu login band.")
        return normalized_username

    def validate_email(self, value):
        normalized_email = str(value).lower().strip()
        try:
            validate_email(normalized_email)
        except ValidationError:
            raise serializers.ValidationError("Email manzili noto'g'ri.") from None
        if User.objects.filter(email=normalized_email).exists():
            raise serializers.ValidationError("Bu email band.")
        return normalized_email

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        full_name = validated_data.pop("full_name")
        role = validated_data.pop("role")
        university = validated_data.pop("university", "")
        study_program = validated_data.pop("study_program", "")
        username = validated_data.pop("username")
        email = validated_data.pop("email")

        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data["password"],
            first_name=full_name,
        )
        Profile.objects.create(
            user=user,
            full_name=full_name,
            role=role,
            university=university,
            study_program=study_program,
            email_verified_at=timezone.now(),
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        error_messages={
            "blank": "Parol kiriting.",
        },
    )

    def validate(self, attrs):
        raw_login = str(attrs.get("username") or attrs.get("email") or "").strip()
        password = attrs.get("password")
        if not raw_login:
            raise serializers.ValidationError({"username": "Login kiriting."})
        if not password:
            raise serializers.ValidationError({"password": "Parol kiriting."})

        normalized_email = raw_login.lower()
        user = User.objects.filter(
            Q(username__iexact=raw_login) | Q(email__iexact=normalized_email)
        ).first()
        if not user:
            raise serializers.ValidationError("Login yoki parol noto'g'ri.")

        authenticated_user = authenticate(username=user.username, password=password)
        if authenticated_user is None:
            raise serializers.ValidationError("Login yoki parol noto'g'ri.")

        refresh = RefreshToken.for_user(authenticated_user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(authenticated_user).data,
        }


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "kind", "title", "body", "link", "is_read", "metadata", "created_at"]
        read_only_fields = fields
