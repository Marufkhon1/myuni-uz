from django.http import Http404

from .chat_community_utils import filter_direct_messages_for_viewer, filter_university_messages_for_viewer
from .chat_permissions import get_user_direct_thread, user_is_university_member
from .models import ChatMessage, DirectMessage
from .serializers import ChatMessageSerializer, DirectMessageSerializer


def _build_request(user):
    class _Request:
        pass

    request = _Request()
    request.user = user
    return request


def fetch_university_stream_messages(user, university_id, since_id=0):
    if not user_is_university_member(user, university_id):
        raise Http404

    request = _build_request(user)
    queryset = (
        ChatMessage.objects.filter(university_id=university_id, id__gt=since_id, is_deleted=False)
        .select_related("user", "user__profile")
        .prefetch_related("reactions")
        .order_by("id")[:50]
    )
    visible = filter_university_messages_for_viewer(queryset, user, university_id)
    return ChatMessageSerializer(visible, many=True, context={"request": request}).data


def fetch_direct_stream_messages(user, thread_id, since_id=0):
    thread = get_user_direct_thread(user, thread_id)
    request = _build_request(user)
    queryset = (
        DirectMessage.objects.filter(thread=thread, id__gt=since_id, is_deleted=False)
        .select_related("sender", "sender__profile")
        .prefetch_related("reactions")
        .order_by("id")[:50]
    )
    visible = filter_direct_messages_for_viewer(queryset, user)
    return DirectMessageSerializer(visible, many=True, context={"request": request}).data
