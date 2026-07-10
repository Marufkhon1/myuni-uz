import os
from urllib.parse import urlencode

import requests
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.core import signing
from django.shortcuts import redirect
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .bio_validation import normalize_bio, validate_bio
from .chat_colors import CHAT_COLOR_SET
from .models import Profile
from .profile_access import can_view_chat_profile
from .profile_setup import user_needs_profile_setup, username_looks_provisional
from .username_validation import normalize_username, validate_username_format
from .auth_cookies import set_auth_cookies
from .auth_limits import (
    check_google_oauth_callback_allowed,
    check_google_oauth_start_allowed,
    check_login_allowed,
    check_register_allowed,
    record_google_oauth_callback,
    record_google_oauth_start,
    record_login_attempt,
    record_register_attempt,
)
from .auth_exchange import issue_auth_exchange_code
from .auth_response import auth_json_response, strip_tokens_from_mapping
from .presence import touch_user_last_seen
from .rate_limit_utils import rate_limit_response
from .serializers import LoginSerializer, PublicUserSerializer, RegisterSerializer, UserSerializer

User = get_user_model()
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


def frontend_redirect(path, **params):
    from django.conf import settings

    frontend_url = settings.FRONTEND_URL.rstrip("/")
    query = urlencode({key: value for key, value in params.items() if value})
    separator = "&" if "?" in path else "?"
    return redirect(f"{frontend_url}{path}{separator}{query}" if query else f"{frontend_url}{path}")


def dashboard_path_for(user):
    role = getattr(getattr(user, "profile", None), "role", Profile.Role.APPLICANT)
    return "/student/dashboard" if role == Profile.Role.STUDENT else "/applicant/dashboard"


def _google_oauth_error_message(token_response):
    try:
        payload = token_response.json()
    except ValueError:
        return "Google token olishda xatolik."
    detail = payload.get("error_description") or payload.get("error")
    if detail:
        return f"Google token xatosi: {detail}"
    return "Google token olishda xatolik."


from .google_user_resolution import resolve_or_create_google_user
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        allowed, detail, retry_after = check_register_allowed(request)
        if not allowed:
            return rate_limit_response(detail, retry_after, code="register_rate_limited")

        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        record_register_attempt(request)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return auth_json_response(
            refresh,
            status=status.HTTP_201_CREATED,
            user_data=UserSerializer(user, context={"request": request}).data,
            extra={"detail": "Ro'yxatdan o'tdingiz."},
            request=request,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    @staticmethod
    def _normalize_login_payload(request):
        data = request.data
        username = data.get("username") or data.get("email") or data.get("login") or ""
        password = data.get("password")
        if isinstance(username, str):
            username = username.strip()
        if password is None:
            password = ""
        return {
            "username": username,
            "password": str(password),
        }

    def post(self, request):
        payload = self._normalize_login_payload(request)
        login_key = payload["username"]
        allowed, detail, retry_after = check_login_allowed(request, login_key)
        if not allowed:
            return rate_limit_response(detail, retry_after, code="login_rate_limited")

        serializer = LoginSerializer(data=payload)
        if not serializer.is_valid():
            record_login_attempt(request, login_key, success=False)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        record_login_attempt(request, login_key, success=True)
        user_data = data.get("user") or {}
        user_id = user_data.get("id")
        if user_id:
            touch_user_last_seen(User.objects.filter(pk=user_id).first(), force=True)
        refresh = RefreshToken(data["refresh"])
        response = Response(strip_tokens_from_mapping(data))
        set_auth_cookies(response, refresh, request=request)
        return response


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user, context={"request": request}).data)

    def patch(self, request):
        profile, _ = Profile.objects.get_or_create(
            user=request.user,
            defaults={"full_name": request.user.first_name or request.user.email or ""},
        )
        user = request.user
        update_fields = []
        user_update_fields = []
        visibility = request.data.get("avatar_visibility")
        chat_color = request.data.get("chat_color")
        full_name = request.data.get("full_name")
        university = request.data.get("university")
        university_id = request.data.get("university_id")
        bio = request.data.get("bio")
        email = request.data.get("email")

        if email is not None:
            normalized_email = str(email).lower().strip()
            if normalized_email:
                try:
                    validate_email(normalized_email)
                except ValidationError:
                    return Response(
                        {"detail": "Email manzili noto'g'ri."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                if User.objects.filter(email=normalized_email).exclude(pk=user.pk).exists():
                    return Response(
                        {"detail": "Bu email boshqa hisobda ishlatilmoqda."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                user.email = normalized_email
            else:
                user.email = ""
            user_update_fields.append("email")

        if full_name is not None and str(full_name).strip():
            profile.full_name = str(full_name).strip()
            update_fields.append("full_name")
            user.first_name = profile.full_name
            user_update_fields.append("first_name")

        if university is not None or university_id is not None:
            from .university_resolution import apply_university_to_profile

            _, uni_errors = apply_university_to_profile(
                profile,
                university_id=university_id if university_id is not None else None,
                university_text=university if university is not None else None,
            )
            if uni_errors:
                return Response(
                    {"detail": uni_errors[0]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            update_fields.extend(["university", "university_ref"])

        if bio is not None:
            normalized_bio = normalize_bio(bio)
            try:
                profile.bio = validate_bio(normalized_bio)
            except ValueError as exc:
                return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
            update_fields.append("bio")

        if visibility is not None and visibility != "":
            valid = {Profile.AvatarVisibility.EVERYONE, Profile.AvatarVisibility.PRIVATE_ONLY}
            if visibility not in valid:
                return Response(
                    {"detail": "Rasm ko'rinishi noto'g'ri tanlangan."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            profile.avatar_visibility = visibility
            update_fields.append("avatar_visibility")

        if chat_color is not None:
            normalized = str(chat_color).strip()
            if normalized and normalized not in CHAT_COLOR_SET:
                return Response(
                    {"detail": "Chat rangi noto'g'ri tanlangan."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            profile.chat_color = normalized
            update_fields.append("chat_color")

        avatar = request.FILES.get("avatar")
        if avatar:
            if profile.avatar:
                profile.avatar.delete(save=False)
            profile.avatar = avatar
            update_fields.append("avatar")

        if not update_fields and not user_update_fields:
            return Response(
                {"detail": "Yangilanadigan ma'lumot yo'q."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if update_fields:
            update_fields.append("updated_at")
            profile.save(update_fields=update_fields)
        if user_update_fields:
            user.save(update_fields=user_update_fields)
        request.user.profile = profile
        return Response(UserSerializer(request.user, context={"request": request}).data)


class CompleteGoogleProfileView(APIView):
    """
    Post-Google onboarding: role + university + login nickname.

    Allowed while the account still needs setup (provisional email username
    and/or missing university).
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if not user_needs_profile_setup(user):
            return Response(
                {"detail": "Profil allaqachon to'ldirilgan."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile, _ = Profile.objects.get_or_create(
            user=user,
            defaults={"full_name": user.first_name or user.email or ""},
        )

        role = str(request.data.get("role") or "").strip()
        username_raw = request.data.get("username")
        university = request.data.get("university")
        university_id = request.data.get("university_id")

        if role not in {Profile.Role.APPLICANT, Profile.Role.STUDENT}:
            return Response(
                {"detail": "Rolni tanlang: abituriyent yoki talaba."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if username_raw is None or not str(username_raw).strip():
            return Response(
                {"detail": "Login (nickname) kiriting."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            normalized_username = normalize_username(username_raw)
            validate_username_format(normalized_username)
        except Exception as exc:
            from rest_framework.exceptions import ValidationError as DrfValidationError

            if isinstance(exc, DrfValidationError):
                detail = exc.detail
                if isinstance(detail, (list, tuple)):
                    detail = detail[0]
                return Response({"detail": str(detail)}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        if username_looks_provisional(normalized_username):
            return Response(
                {"detail": "Login email bo'lishi mumkin emas. Oddiy nickname tanlang."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username__iexact=normalized_username).exclude(pk=user.pk).exists():
            return Response(
                {"detail": "Bu login band. Boshqa nickname tanlang."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if university is None and university_id is None:
            return Response(
                {"detail": "Universitetni tanlang."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from .university_resolution import apply_university_to_profile

        _, uni_errors = apply_university_to_profile(
            profile,
            university_id=university_id if university_id is not None else None,
            university_text=university if university is not None else None,
        )
        if uni_errors:
            return Response({"detail": uni_errors[0]}, status=status.HTTP_400_BAD_REQUEST)

        if not str(profile.university or "").strip() and not profile.university_ref_id:
            return Response(
                {"detail": "Ro'yxatdan universitetni tanlang."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile.role = role
        profile.save(update_fields=["role", "university", "university_ref", "updated_at"])

        user.username = normalized_username
        user.save(update_fields=["username"])

        user.refresh_from_db()
        profile.refresh_from_db()
        user.profile = profile
        return Response(UserSerializer(user, context={"request": request}).data)


class ProfileAvatarView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        profile = request.user.profile
        if profile.avatar:
            profile.avatar.delete(save=True)
        return Response(UserSerializer(request.user, context={"request": request}).data)


class UserPublicView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = User.objects.select_related("profile").filter(pk=user_id).first()
        if not user:
            return Response({"detail": "Foydalanuvchi topilmadi."}, status=status.HTTP_404_NOT_FOUND)

        university_id = request.query_params.get("university_id")
        parsed_university_id = None
        if university_id:
            try:
                parsed_university_id = int(university_id)
            except (TypeError, ValueError):
                return Response(
                    {"detail": "university_id noto'g'ri."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if not can_view_chat_profile(request.user, user, university_id=parsed_university_id):
            return Response(
                {
                    "detail": "Profil ochib bo'lmadi. Chat kontekstida qayta urinib ko'ring."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(PublicUserSerializer(user, context={"request": request}).data)


class UserSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        if len(query) < 2:
            return Response([])

        users = (
            User.objects.select_related("profile")
            .filter(
                Q(profile__full_name__icontains=query)
                | Q(email__icontains=query)
                | Q(first_name__icontains=query)
            )
            .exclude(pk=request.user.pk)[:20]
        )
        return Response(PublicUserSerializer(users, many=True, context={"request": request}).data)


class GoogleAuthStartView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        allowed, detail, retry_after = check_google_oauth_start_allowed(request)
        if not allowed:
            return rate_limit_response(detail, retry_after, code="google_oauth_rate_limited")

        client_id = os.getenv("GOOGLE_CLIENT_ID", "")
        redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "")

        if not client_id or not redirect_uri:
            return Response(
                {
                    "detail": "Google orqali kirish hozircha yoqilmagan. backend/.env faylida GOOGLE_CLIENT_ID va GOOGLE_REDIRECT_URI ni to'ldiring yoki email/parol bilan kiring.",
                    "code": "google_oauth_not_configured",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        record_google_oauth_start(request)

        state_payload = {
            "flow": request.query_params.get("flow", "login"),
            "role": request.query_params.get("role", Profile.Role.APPLICANT),
            "university": request.query_params.get("university", ""),
            "university_id": request.query_params.get("university_id", "") or None,
        }

        params = urlencode(
            {
                "client_id": client_id,
                "redirect_uri": redirect_uri,
                "response_type": "code",
                "scope": "openid email profile",
                "access_type": "offline",
                "prompt": "select_account",
                "state": signing.dumps(state_payload),
            }
        )
        return Response({"authorization_url": f"{GOOGLE_AUTH_URL}?{params}"})


class GoogleAuthCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        allowed, detail, retry_after = check_google_oauth_callback_allowed(request)
        if not allowed:
            return frontend_redirect(
                "/login",
                google_error=detail or "Google orqali kirish uchun juda ko'p urinish.",
                google_error_code="google_oauth_rate_limited",
                retry_after=str(retry_after or ""),
            )

        code = request.query_params.get("code")
        raw_state = request.query_params.get("state", "")

        if not code:
            return frontend_redirect("/login", google_error="Google code topilmadi.")

        record_google_oauth_callback(request)

        try:
            state = signing.loads(raw_state) if raw_state else {}
        except signing.BadSignature:
            return frontend_redirect("/login", google_error="Google state noto'g'ri.")

        token_response = requests.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": os.getenv("GOOGLE_CLIENT_ID", ""),
                "client_secret": os.getenv("GOOGLE_CLIENT_SECRET", ""),
                "redirect_uri": os.getenv("GOOGLE_REDIRECT_URI", ""),
                "grant_type": "authorization_code",
            },
            timeout=10,
        )

        if token_response.status_code != 200:
            return frontend_redirect("/login", google_error=_google_oauth_error_message(token_response))

        google_tokens = token_response.json()
        userinfo_response = requests.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {google_tokens.get('access_token')}"},
            timeout=10,
        )

        if userinfo_response.status_code != 200:
            return frontend_redirect("/login", google_error="Google profilini olishda xatolik.")

        google_user = userinfo_response.json()
        email = google_user.get("email", "").lower().strip()
        full_name = google_user.get("name") or email
        is_verified = google_user.get("email_verified")

        if not email or not is_verified:
            return frontend_redirect("/login", google_error="Google email tasdiqlanmagan.")

        user, provision_error, oauth_meta = resolve_or_create_google_user(
            email=email,
            full_name=full_name,
            state=state,
        )
        if provision_error:
            redirect_path, error_message = provision_error
            return frontend_redirect(redirect_path, google_error=error_message)

        refresh = RefreshToken.for_user(user)
        from django.conf import settings

        frontend_url = settings.FRONTEND_URL.rstrip("/")
        next_path = dashboard_path_for(user)
        # One-time code (not JWT) — FE exchanges via /api proxy so cookies land on app origin.
        exchange_code = issue_auth_exchange_code(refresh)
        query_params = {"ok": "1", "code": exchange_code, "next": next_path}
        if oauth_meta.get("linked_existing") and oauth_meta.get("flow") == "signup":
            query_params["google_notice"] = "existing_account"
        query = urlencode(query_params)
        return redirect(f"{frontend_url}/oauth/google/callback?{query}")
