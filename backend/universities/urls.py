from django.urls import path

from .chat_realtime import direct_message_stream, university_message_stream
from .pin_views import DirectMessagePinView, UniversityMessagePinView
from .message_delete_views import DirectMessageDeleteView, UniversityMessageDeleteView
from .message_edit_views import DirectMessageEditView, UniversityMessageEditView
from .report_views import ChatMessageReportView, DirectMessageReportView
from .views import (
    DirectMessageListCreateView,
    DirectMessageReactionView,
    DirectThreadListCreateView,
    DirectThreadMarkReadView,
    DirectTypingView,
    FavoriteUniversityDetailView,
    FavoriteUniversityListView,
    JoinedUniversityListView,
    PopularReviewListView,
    ReviewDetailView,
    ReviewLikeToggleView,
    ReviewListCreateView,
    UniversityCompareView,
    UniversityDetailView,
    UniversityJoinView,
    UniversityMessageReactionView,
    UniversityLeaveView,
    UniversityListView,
    UniversityMarkReadView,
    UniversityMembersView,
    UniversityMessageListCreateView,
    UniversityTypingView,
)

urlpatterns = [
    path("", UniversityListView.as_view(), name="university-list"),
    path("joined/", JoinedUniversityListView.as_view(), name="joined-universities"),
    path("favorites/", FavoriteUniversityListView.as_view(), name="favorite-universities"),
    path(
        "favorites/<int:university_id>/",
        FavoriteUniversityDetailView.as_view(),
        name="favorite-university-detail",
    ),
    path(
        "messages/<int:message_id>/report/",
        ChatMessageReportView.as_view(),
        name="university-message-report",
    ),
    path(
        "messages/<int:message_id>/reactions/",
        UniversityMessageReactionView.as_view(),
        name="university-message-reaction",
    ),
    path(
        "messages/<int:message_id>/edit/",
        UniversityMessageEditView.as_view(),
        name="university-message-edit",
    ),
    path(
        "messages/<int:message_id>/",
        UniversityMessageDeleteView.as_view(),
        name="university-message-delete",
    ),
    path(
        "<int:university_id>/messages/<int:message_id>/pin/",
        UniversityMessagePinView.as_view(),
        name="university-message-pin",
    ),
    path(
        "directs/messages/<int:message_id>/report/",
        DirectMessageReportView.as_view(),
        name="direct-message-report",
    ),
    path(
        "directs/messages/<int:message_id>/reactions/",
        DirectMessageReactionView.as_view(),
        name="direct-message-reaction",
    ),
    path(
        "directs/messages/<int:message_id>/edit/",
        DirectMessageEditView.as_view(),
        name="direct-message-edit",
    ),
    path(
        "directs/messages/<int:message_id>/",
        DirectMessageDeleteView.as_view(),
        name="direct-message-delete",
    ),
    path("reviews/<int:review_id>/like/", ReviewLikeToggleView.as_view(), name="review-like-toggle"),
    path("reviews/<int:review_id>/", ReviewDetailView.as_view(), name="review-detail"),
    path("reviews/popular/", PopularReviewListView.as_view(), name="popular-review-list"),
    path("reviews/", ReviewListCreateView.as_view(), name="review-list-create"),
    path("compare/", UniversityCompareView.as_view(), name="university-compare"),
    path("directs/", DirectThreadListCreateView.as_view(), name="direct-thread-list-create"),
    path(
        "directs/<int:thread_id>/messages/",
        DirectMessageListCreateView.as_view(),
        name="direct-message-list-create",
    ),
    path(
        "directs/<int:thread_id>/messages/<int:message_id>/pin/",
        DirectMessagePinView.as_view(),
        name="direct-message-pin",
    ),
    path(
        "directs/<int:thread_id>/read/",
        DirectThreadMarkReadView.as_view(),
        name="direct-thread-mark-read",
    ),
    path(
        "directs/<int:thread_id>/messages/stream/",
        direct_message_stream,
        name="direct-message-stream",
    ),
    path(
        "directs/<int:thread_id>/typing/",
        DirectTypingView.as_view(),
        name="direct-typing",
    ),
    path("<int:university_id>/", UniversityDetailView.as_view(), name="university-detail"),
    path("<int:university_id>/members/", UniversityMembersView.as_view(), name="university-members"),
    path("<int:university_id>/join/", UniversityJoinView.as_view(), name="university-join"),
    path(
        "<int:university_id>/messages/",
        UniversityMessageListCreateView.as_view(),
        name="university-message-list-create",
    ),
    path(
        "<int:university_id>/messages/stream/",
        university_message_stream,
        name="university-message-stream",
    ),
    path(
        "<int:university_id>/typing/",
        UniversityTypingView.as_view(),
        name="university-typing",
    ),
    path(
        "<int:university_id>/leave/",
        UniversityLeaveView.as_view(),
        name="university-leave",
    ),
    path(
        "<int:university_id>/read/",
        UniversityMarkReadView.as_view(),
        name="university-mark-read",
    ),
]
