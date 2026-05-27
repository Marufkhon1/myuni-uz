from django.db.models import Exists, OuterRef

from .models import DirectMessage, DirectThread


def direct_thread_both_replied(thread):
    if getattr(thread, "both_replied", None) is not None:
        return bool(thread.both_replied)

    return (
        thread.messages.filter(sender_id=thread.user_one_id).exists()
        and thread.messages.filter(sender_id=thread.user_two_id).exists()
    )


def annotate_direct_threads_both_replied(queryset):
    messages_from_user_one = DirectMessage.objects.filter(
        thread_id=OuterRef("pk"),
        sender_id=OuterRef("user_one_id"),
    )
    messages_from_user_two = DirectMessage.objects.filter(
        thread_id=OuterRef("pk"),
        sender_id=OuterRef("user_two_id"),
    )
    return queryset.annotate(
        both_replied=Exists(messages_from_user_one) & Exists(messages_from_user_two)
    )


def get_or_create_direct_thread(user_a, user_b):
    if user_a.id == user_b.id:
        raise ValueError("O'zingiz bilan shaxsiy chat ochib bo'lmaydi.")

    first_id, second_id = sorted([user_a.id, user_b.id])
    thread, created = DirectThread.objects.get_or_create(
        user_one_id=first_id,
        user_two_id=second_id,
    )
    return thread, created
