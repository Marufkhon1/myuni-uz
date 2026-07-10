from django.urls import path

from .password_reset import (
    PasswordResetConfirmView,
    PasswordResetRequestView,
    PasswordResetStatusView,
)
from .auth_views import (
    AuthExchangeView,
    AuthSessionView,
    CookieTokenRefreshView,
    CsrfCookieView,
    LogoutView,
    StreamTokenView,
)
from .support_views import SupportMessageView
from .notification_views import NotificationListView, NotificationMarkReadView
from .push_views import PushSubscribeView, PushUnsubscribeView, PushVapidPublicKeyView
from .email_verification_views import (
    EmailVerifyConfirmView,
    EmailVerifyResendView,
    EmailVerifyStatusView,
)
from .moderator_views import (
    ModeratorMessageReportUpdateView,
    ModeratorReportListView,
    ModeratorReviewReportUpdateView,
)
from .trust_views import MyReportsView
from .views import (
    CompleteGoogleProfileView,
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
    path("stream-token/", StreamTokenView.as_view(), name="stream-token"),
    path("session/", AuthSessionView.as_view(), name="auth-session"),
    path("exchange/", AuthExchangeView.as_view(), name="auth-exchange"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("token/refresh/", CookieTokenRefreshView.as_view(), name="cookie-token-refresh"),
    path("csrf/", CsrfCookieView.as_view(), name="csrf-cookie"),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("verify-email/confirm/", EmailVerifyConfirmView.as_view(), name="verify-email-confirm"),
    path("verify-email/resend/", EmailVerifyResendView.as_view(), name="verify-email-resend"),
    path("verify-email/status/", EmailVerifyStatusView.as_view(), name="verify-email-status"),
    path("my-reports/", MyReportsView.as_view(), name="my-reports"),
    path("moderator/reports/", ModeratorReportListView.as_view(), name="moderator-reports"),
    path(
        "moderator/reports/message/<int:report_id>/",
        ModeratorMessageReportUpdateView.as_view(),
        name="moderator-message-report",
    ),
    path(
        "moderator/reports/review/<int:report_id>/",
        ModeratorReviewReportUpdateView.as_view(),
        name="moderator-review-report",
    ),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path("password-reset/status/", PasswordResetStatusView.as_view(), name="password-reset-status"),
    path(
        "password-reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="password-reset-confirm",
    ),
    path("me/", MeView.as_view(), name="me"),
    path("me/complete-profile/", CompleteGoogleProfileView.as_view(), name="complete-google-profile"),
    path("me/avatar/", ProfileAvatarView.as_view(), name="profile-avatar"),
    path("notifications/", NotificationListView.as_view(), name="notifications"),
    path("notifications/mark-read/", NotificationMarkReadView.as_view(), name="notifications-mark-read"),
    path("users/search/", UserSearchView.as_view(), name="user-search"),
    path("users/<int:user_id>/", UserPublicView.as_view(), name="user-public"),
    path("push/vapid/", PushVapidPublicKeyView.as_view(), name="push-vapid"),
    path("push/subscribe/", PushSubscribeView.as_view(), name="push-subscribe"),
    path("push/unsubscribe/", PushUnsubscribeView.as_view(), name="push-unsubscribe"),
    path("google/start/", GoogleAuthStartView.as_view(), name="google-auth-start"),
    path("google/callback/", GoogleAuthCallbackView.as_view(), name="google-auth-callback"),
]
