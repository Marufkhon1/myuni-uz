from django.utils import timezone

from .models import ChatMembership, ChatMessage, DirectMessage, DirectThread


def _group_unread_messages_queryset(user, university_id):
    membership = ChatMembership.objects.filter(user=user, university_id=university_id).first()
    if not membership:
        return ChatMessage.objects.none()

    messages = ChatMessage.objects.filter(university_id=university_id).exclude(user=user)
    if membership.last_read_at:
        messages = messages.filter(created_at__gt=membership.last_read_at)
    return messages


def group_unread_message_count(user, university_id):
    """O'qilmagan guruh xabarlari (chat qatoridagi qizil raqam)."""
    return _group_unread_messages_queryset(user, university_id).count()


def group_unread_sender_count(user, university_id):
    """O'qilmagan xabar yuborgan alohida foydalanuvchilar («Qo'shilgan» tab yig'indisi)."""
    return _group_unread_messages_queryset(user, university_id).values("user_id").distinct().count()


def direct_unread_message_count(user, thread: DirectThread):
    if thread.user_one_id == user.id:
        last_read = thread.user_one_last_read_at
    else:
        last_read = thread.user_two_last_read_at

    messages = DirectMessage.objects.filter(thread=thread).exclude(sender=user)
    if last_read:
        messages = messages.filter(created_at__gt=last_read)

    return messages.count()


def mark_university_read(user, university_id):
    membership = ChatMembership.objects.filter(user=user, university_id=university_id).first()
    if not membership:
        return False
    membership.last_read_at = timezone.now()
    membership.save(update_fields=["last_read_at"])
    return True


def mark_direct_thread_read(user, thread: DirectThread):
    now = timezone.now()
    if thread.user_one_id == user.id:
        thread.user_one_last_read_at = now
        thread.save(update_fields=["user_one_last_read_at"])
    else:
        thread.user_two_last_read_at = now
        thread.save(update_fields=["user_two_last_read_at"])
