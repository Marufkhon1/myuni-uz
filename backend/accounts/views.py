import os
from urllib.parse import urlencode

import requests
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.core import signing
from django.shortcuts import redirect
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Profile
from .profile_access import can_view_chat_profile
from .serializers import LoginSerializer, PublicUserSerializer, RegisterSerializer, UserSerializer

User = get_user_model()
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


def frontend_redirect(path, **params):
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
    query = urlencode({key: value for key, value in params.items() if value})
    separator = "&" if "?" in path else "?"
    return redirect(f"{frontend_url}{path}{separator}{query}" if query else f"{frontend_url}{path}")


def dashboard_path_for(user):
    role = getattr(getattr(user, "profile", None), "role", Profile.Role.APPLICANT)
    return "/student/dashboard" if role == Profile.Role.STUDENT else "/applicant/dashboard"


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user, context={"request": request}).data)

    def patch(self, request):
        profile = request.user.profile
        user = request.user
        update_fields = []
        user_update_fields = []
        visibility = request.data.get("avatar_visibility")
        full_name = request.data.get("full_name")
        university = request.data.get("university")

        if full_name is not None and str(full_name).strip():
            profile.full_name = str(full_name).strip()
            update_fields.append("full_name")
            user.first_name = profile.full_name
            user_update_fields.append("first_name")

        if university is not None:
            profile.university = str(university).strip()
            update_fields.append("university")

        if visibility is not None and visibility != "":
            valid = {Profile.AvatarVisibility.EVERYONE, Profile.AvatarVisibility.PRIVATE_ONLY}
            if visibility not in valid:
                return Response(
                    {"detail": "Rasm ko'rinishi noto'g'ri tanlangan."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            profile.avatar_visibility = visibility
            update_fields.append("avatar_visibility")

        avatar = request.FILES.get("avatar")
        if avatar:
            if profile.avatar:
                profile.avatar.delete(save=False)
            profile.avatar = avatar
            update_fields.append("avatar")

        if not update_fields:
            return Response(
                {"detail": "Yangilanadigan ma'lumot yo'q."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        update_fields.append("updated_at")
        profile.save(update_fields=update_fields)
        if user_update_fields:
            user.save(update_fields=user_update_fields)
        return Response(UserSerializer(request.user, context={"request": request}).data)


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
                    "detail": "Profil faqat chatda xabar yozgan foydalanuvchilar uchun ochiladi."
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

        state_payload = {
            "flow": request.query_params.get("flow", "login"),
            "role": request.query_params.get("role", Profile.Role.APPLICANT),
            "university": request.query_params.get("university", ""),
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
        code = request.query_params.get("code")
        raw_state = request.query_params.get("state", "")

        if not code:
            return frontend_redirect("/login", google_error="Google code topilmadi.")

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
            return frontend_redirect("/login", google_error="Google token olishda xatolik.")

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

        user = User.objects.filter(email=email).first()
        if not user:
            if state.get("flow") != "signup" or not state.get("university"):
                return frontend_redirect(
                    "/signup",
                    google_error="Avval rol va universitetni tanlang.",
                )

            user = User.objects.create_user(
                username=email,
                email=email,
                password=None,
                first_name=full_name,
            )
            user.set_unusable_password()
            user.save(update_fields=["password"])

        Profile.objects.get_or_create(
            user=user,
            defaults={
                "full_name": full_name,
                "role": state.get("role", Profile.Role.APPLICANT),
                "university": state.get("university", ""),
            },
        )

        refresh = RefreshToken.for_user(user)
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
        fragment = urlencode(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "next": dashboard_path_for(user),
            }
        )
        return redirect(f"{frontend_url}/oauth/google/callback#{fragment}")
