import json
import time
from datetime import datetime, timedelta

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.http import Http404, JsonResponse, StreamingHttpResponse
from django.utils import timezone
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

from accounts.stream_tokens import resolve_stream_token

from .chat_community_utils import filter_university_messages_for_viewer
from .chat_permissions import get_user_direct_thread, user_is_university_member
from .models import ChatMessage, DirectMessage
from .serializers import (
    ChatMessageSerializer,
    DirectMessageSerializer,
    chat_color_for_user,
    display_name_for_user,
)

User = get_user_model()
TYPING_TTL_SECONDS = 4


def query_param(request, name, default=""):
    if hasattr(request, "query_params"):
        return request.query_params.get(name, default)
    return request.GET.get(name, default)


def authenticate_stream_user(request):
    stream_token = query_param(request, "stream_token", "").strip()
    if stream_token:
        user_id = resolve_stream_token(stream_token)
        if user_id:
            return User.objects.filter(pk=user_id).first()

    token = query_param(request, "token", "").strip()
    if not token:
        return None
    jwt_auth = JWTAuthentication()
    try:
        validated = jwt_auth.get_validated_token(token)
    except InvalidToken:
        return None
    return jwt_auth.get_user(validated)


def typing_cache_key(university_id):
    return f"chat:typing:uni:{university_id}"


def direct_typing_cache_key(thread_id):
    return f"chat:typing:dm:{thread_id}"


def set_typing_user(cache_key, user):
    payload = cache.get(cache_key) or {}
    profile = getattr(user, "profile", None)
    payload[str(user.id)] = {
        "name": display_name_for_user(user),
        "color": chat_color_for_user(user),
        "at": timezone.now().isoformat(),
    }
    cache.set(cache_key, payload, TYPING_TTL_SECONDS + 2)


def get_typing_users(cache_key, exclude_user_id=None):
    payload = cache.get(cache_key) or {}
    now = timezone.now()
    active = []
    for user_id, item in payload.items():
        if exclude_user_id and int(user_id) == exclude_user_id:
            continue
        try:
            seen = datetime.fromisoformat(item["at"])
            if timezone.is_naive(seen):
                seen = timezone.make_aware(seen)
        except (TypeError, ValueError):
            continue
        if (now - seen).total_seconds() <= TYPING_TTL_SECONDS:
            active.append(
                {
                    "id": int(user_id),
                    "name": item["name"],
                    "color": item.get("color"),
                    "at": item.get("at"),
                }
            )
    return active


def sse_event(event_type, data):
    return f"event: {event_type}\ndata: {json.dumps(data, default=str)}\n\n"


def unauthorized_response():
    return JsonResponse({"detail": "Autentifikatsiya talab qilinadi."}, status=401)


def forbidden_response():
    return JsonResponse({"detail": "Bu chatga ruxsat yo'q."}, status=403)


def _poll_message_updates(request, queryset, since_time):
    model = queryset.model
    if model is ChatMessage:
        queryset = queryset.select_related("user", "user__profile")
    else:
        queryset = queryset.select_related("sender", "sender__profile")
    updated = list(
        queryset.filter(updated_at__gt=since_time)
        .prefetch_related("reactions")
        .order_by("updated_at")[:50]
    )
    if not updated:
        return None, since_time

    serializer_class = (
        ChatMessageSerializer if queryset.model is ChatMessage else DirectMessageSerializer
    )
    payload = serializer_class(updated, many=True, context={"request": request}).data
    return payload, updated[-1].updated_at


def _poll_deleted_ids(queryset, since_time):
    deleted = list(
        queryset.filter(is_deleted=True, updated_at__gt=since_time).values_list("id", flat=True)[:50]
    )
    return deleted


def university_message_stream(request, university_id):
    user = authenticate_stream_user(request)
    if not user:
        return unauthorized_response()
    if not user_is_university_member(user, university_id):
        return forbidden_response()

    request.user = user
    since_id = int(query_param(request, "since_id", 0) or 0)
    change_since = timezone.now() - timedelta(seconds=2)

    def generate():
        nonlocal since_id, change_since
        idle_ticks = 0
        base_qs = ChatMessage.objects.filter(university_id=university_id)
        visible_qs = filter_university_messages_for_viewer(base_qs, user, university_id)

        while idle_ticks < 90:
            had_activity = False

            new_messages = list(
                visible_qs.filter(id__gt=since_id, is_deleted=False)
                .select_related("user", "user__profile")
                .prefetch_related("reactions")
                .order_by("id")[:50]
            )
            if new_messages:
                since_id = new_messages[-1].id
                payload = ChatMessageSerializer(
                    new_messages, many=True, context={"request": request}
                ).data
                yield sse_event("messages", payload)
                had_activity = True

            updated_payload, change_since = _poll_message_updates(
                request,
                visible_qs.filter(is_deleted=False, id__lte=since_id),
                change_since,
            )
            if updated_payload:
                yield sse_event("message_updated", updated_payload)
                had_activity = True

            deleted_ids = _poll_deleted_ids(base_qs, change_since)
            if deleted_ids:
                yield sse_event("message_deleted", {"ids": deleted_ids})
                had_activity = True

            if had_activity:
                idle_ticks = 0
                change_since = timezone.now()
            else:
                idle_ticks += 1

            typing = get_typing_users(typing_cache_key(university_id), exclude_user_id=user.id)
            yield sse_event("typing", {"users": typing})

            time.sleep(0.8)

    response = StreamingHttpResponse(generate(), content_type="text/event-stream")
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"
    return response


def direct_message_stream(request, thread_id):
    from .chat_community_utils import filter_direct_messages_for_viewer

    user = authenticate_stream_user(request)
    if not user:
        return unauthorized_response()
    try:
        get_user_direct_thread(user, thread_id)
    except Http404:
        return forbidden_response()

    request.user = user
    since_id = int(query_param(request, "since_id", 0) or 0)
    change_since = timezone.now() - timedelta(seconds=2)

    def generate():
        nonlocal since_id, change_since
        idle_ticks = 0
        base_qs = DirectMessage.objects.filter(thread_id=thread_id)
        visible_qs = filter_direct_messages_for_viewer(base_qs, user)

        while idle_ticks < 90:
            had_activity = False

            new_messages = list(
                visible_qs.filter(id__gt=since_id, is_deleted=False)
                .select_related("sender", "sender__profile")
                .prefetch_related("reactions")
                .order_by("id")[:50]
            )
            if new_messages:
                since_id = new_messages[-1].id
                payload = DirectMessageSerializer(
                    new_messages, many=True, context={"request": request}
                ).data
                yield sse_event("messages", payload)
                had_activity = True

            updated_payload, change_since = _poll_message_updates(
                request,
                visible_qs.filter(is_deleted=False, id__lte=since_id),
                change_since,
            )
            if updated_payload:
                yield sse_event("message_updated", updated_payload)
                had_activity = True

            deleted_ids = _poll_deleted_ids(base_qs, change_since)
            if deleted_ids:
                yield sse_event("message_deleted", {"ids": deleted_ids})
                had_activity = True

            if had_activity:
                idle_ticks = 0
                change_since = timezone.now()
            else:
                idle_ticks += 1

            typing = get_typing_users(direct_typing_cache_key(thread_id), exclude_user_id=user.id)
            yield sse_event("typing", {"users": typing})

            time.sleep(0.8)

    response = StreamingHttpResponse(generate(), content_type="text/event-stream")
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"
    return response
