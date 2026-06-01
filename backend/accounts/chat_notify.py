from django.contrib.auth import get_user_model

from .models import Notification
from .notifications_service import create_notification
from .push_service import send_web_push_to_user

User = get_user_model()


def _dashboard_path_for_user(user):
    role = getattr(getattr(user, "profile", None), "role", "applicant")
    return "/student/dashboard" if role == "student" else "/applicant/dashboard"


def notify_group_chat_message(message):
    from universities.chat_community_utils import should_notify_viewer_about_sender
    from universities.models import ChatMembership
    from universities.serializers import display_name_for_user

    university = message.university
    sender = message.user
    sender_name = display_name_for_user(sender)
    uni_label = university.short_name or university.name
    preview = (message.text or "").strip()
    if len(preview) > 120:
        preview = f"{preview[:119].rstrip()}…"

    memberships = (
        ChatMembership.objects.filter(university_id=university.id)
        .exclude(user_id=sender.id)
        .select_related("user", "user__profile")
    )

    for membership in memberships:
        recipient = membership.user
        if not should_notify_viewer_about_sender(
            recipient.id, sender.id, university_id=university.id
        ):
            continue

        dashboard_path = _dashboard_path_for_user(recipient)
        link = f"{dashboard_path}?section=chats&university_id={university.id}"
        title = f"{uni_label} chatida yangi xabar"
        body = f"{sender_name}: {preview or 'Yangi xabar'}"

        create_notification(
            user=recipient,
            kind=Notification.Kind.CHAT_UNREAD,
            title=title,
            body=body,
            link=link,
            metadata={
                "university_id": university.id,
                "message_id": message.id,
                "sender_id": sender.id,
            },
        )
        send_web_push_to_user(
            recipient,
            {
                "title": title,
                "body": body,
                "url": link,
                "tag": f"chat-uni-{university.id}",
            },
        )


def notify_direct_chat_message(message):
    from universities.serializers import display_name_for_user

    thread = message.thread
    sender = message.sender
    sender_name = display_name_for_user(sender)
    preview = (message.text or "").strip()
    if len(preview) > 120:
        preview = f"{preview[:119].rstrip()}…"

    recipient_id = (
        thread.user_two_id if thread.user_one_id == sender.id else thread.user_one_id
    )
    recipient = User.objects.filter(pk=recipient_id).select_related("profile").first()
    if not recipient:
        return

    from universities.chat_community_utils import should_notify_viewer_about_sender

    if not should_notify_viewer_about_sender(recipient.id, sender.id):
        return

    dashboard_path = _dashboard_path_for_user(recipient)
    link = f"{dashboard_path}?section=chats&chat_panel=private&thread_id={thread.id}"
    title = f"{sender_name} dan shaxsiy xabar"
    body = preview or "Yangi shaxsiy xabar"

    create_notification(
        user=recipient,
        kind=Notification.Kind.CHAT_UNREAD,
        title=title,
        body=body,
        link=link,
        metadata={
            "thread_id": thread.id,
            "message_id": message.id,
            "sender_id": sender.id,
        },
    )
    send_web_push_to_user(
        recipient,
        {
            "title": title,
            "body": body,
            "url": link,
            "tag": f"chat-dm-{thread.id}",
        },
    )
