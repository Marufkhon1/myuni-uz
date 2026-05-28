from django.shortcuts import get_object_or_404

from .models import ChatMessage, DirectMessage, DirectThread, PinnedDirectMessage, PinnedUniversityMessage


def serialize_pinned_chat_message(message, request):
    from .serializers import ChatMessageSerializer

    return ChatMessageSerializer(message, context={"request": request}).data


def serialize_pinned_direct_message(message, request):
    from .serializers import DirectMessageSerializer

    return DirectMessageSerializer(message, context={"request": request}).data


def get_pinned_university_message(university_id, request):
    try:
        pin = PinnedUniversityMessage.objects.select_related(
            "message", "message__user", "message__user__profile"
        ).get(university_id=university_id)
    except PinnedUniversityMessage.DoesNotExist:
        return None
    if pin.message.is_deleted:
        pin.delete()
        return None
    return serialize_pinned_chat_message(pin.message, request)


def get_pinned_direct_message(thread_id, request):
    try:
        pin = PinnedDirectMessage.objects.select_related(
            "message", "message__sender", "message__sender__profile"
        ).get(thread_id=thread_id)
    except PinnedDirectMessage.DoesNotExist:
        return None
    if pin.message.is_deleted:
        pin.delete()
        return None
    return serialize_pinned_direct_message(pin.message, request)


def pin_university_message(request, university_id, message_id):
    message = get_object_or_404(
        ChatMessage.objects.select_related("university"),
        pk=message_id,
        university_id=university_id,
        is_deleted=False,
    )
    pin, _ = PinnedUniversityMessage.objects.update_or_create(
        university_id=university_id,
        defaults={
            "message": message,
            "pinned_by": request.user,
        },
    )
    return serialize_pinned_chat_message(pin.message, request)


def unpin_university_message(university_id):
    PinnedUniversityMessage.objects.filter(university_id=university_id).delete()


def pin_direct_message(request, thread_id, message_id):
    thread = get_object_or_404(DirectThread, pk=thread_id)
    message = get_object_or_404(
        DirectMessage.objects.select_related("thread"),
        pk=message_id,
        thread=thread,
        is_deleted=False,
    )
    pin, _ = PinnedDirectMessage.objects.update_or_create(
        thread=thread,
        defaults={
            "message": message,
            "pinned_by": request.user,
        },
    )
    return serialize_pinned_direct_message(pin.message, request)


def unpin_direct_message(thread_id):
    PinnedDirectMessage.objects.filter(thread_id=thread_id).delete()
