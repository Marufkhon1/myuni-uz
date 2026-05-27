from django.urls import path

from .password_reset import (
    PasswordResetConfirmView,
    PasswordResetRequestView,
    PasswordResetStatusView,
)
from .support_views import SupportMessageView
from .views import (
    GoogleAuthCallbackView,
    GoogleAuthStartView,
    LoginView,
    MeView,
    ProfileAvatarView,
    RegisterView,
    UserPublicView,
    UserSearchView,
)

urlpatterns = [
    path("support/message/", SupportMessageView.as_view(), name="support-message"),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path("password-reset/status/", PasswordResetStatusView.as_view(), name="password-reset-status"),
    path(
        "password-reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="password-reset-confirm",
    ),
    path("me/", MeView.as_view(), name="me"),
    path("me/avatar/", ProfileAvatarView.as_view(), name="profile-avatar"),
    path("users/search/", UserSearchView.as_view(), name="user-search"),
    path("users/<int:user_id>/", UserPublicView.as_view(), name="user-public"),
    path("google/start/", GoogleAuthStartView.as_view(), name="google-auth-start"),
    path("google/callback/", GoogleAuthCallbackView.as_view(), name="google-auth-callback"),
]
