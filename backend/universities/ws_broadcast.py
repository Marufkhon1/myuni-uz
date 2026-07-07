import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

logger = logging.getLogger(__name__)


def university_chat_group(university_id):
    return f"chat_uni_{university_id}"


def direct_chat_group(thread_id):
    return f"chat_dm_{thread_id}"


def publish_chat_stream_event(group_name, event_name, data):
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return

    try:
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "chat.stream_event",
                "event": event_name,
                "data": data,
            },
        )
    except Exception:
        logger.exception("Failed to publish chat stream event to %s", group_name)


def broadcast_university_messages(university_id, messages):
    publish_chat_stream_event(university_chat_group(university_id), "messages", messages)


def broadcast_university_message_updates(university_id, messages):
    publish_chat_stream_event(
        university_chat_group(university_id), "message_updated", messages
    )


def broadcast_university_message_deletes(university_id, ids):
    publish_chat_stream_event(
        university_chat_group(university_id), "message_deleted", {"ids": ids}
    )


def broadcast_university_typing(university_id, users):
    publish_chat_stream_event(university_chat_group(university_id), "typing", {"users": users})


def broadcast_direct_messages(thread_id, messages):
    publish_chat_stream_event(direct_chat_group(thread_id), "messages", messages)


def broadcast_direct_message_updates(thread_id, messages):
    publish_chat_stream_event(direct_chat_group(thread_id), "message_updated", messages)


def broadcast_direct_message_deletes(thread_id, ids):
    publish_chat_stream_event(direct_chat_group(thread_id), "message_deleted", {"ids": ids})


def broadcast_direct_typing(thread_id, users):
    publish_chat_stream_event(direct_chat_group(thread_id), "typing", {"users": users})
