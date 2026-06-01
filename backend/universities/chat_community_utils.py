import re

from django.db.models import Q

HASHTAG_PATTERN = re.compile(
    r"(?:^|[\s])#([\w\u0400-\u04FF\u0100-\u024F\u1E00-\u1EFF-]{2,32})",
    re.UNICODE,
)
MAX_TAGS_PER_MESSAGE = 10


def extract_hashtags(text):
    tags = []
    seen = set()
    for match in HASHTAG_PATTERN.finditer(text or ""):
        tag = match.group(1).lower().strip("-")
        if not tag or tag in seen:
            continue
        seen.add(tag)
        tags.append(tag)
        if len(tags) >= MAX_TAGS_PER_MESSAGE:
            break
    return tags


def blocked_user_ids_for(viewer_id):
    from .models import UserBlock

    blocked_by_me = UserBlock.objects.filter(blocker_id=viewer_id).values_list(
        "blocked_id", flat=True
    )
    blocked_me = UserBlock.objects.filter(blocked_id=viewer_id).values_list(
        "blocker_id", flat=True
    )
    return set(blocked_by_me) | set(blocked_me)


def muted_user_ids_for(viewer_id, university_id=None):
    from .models import UserMute

    qs = UserMute.objects.filter(muter_id=viewer_id)
    if university_id is not None:
        qs = qs.filter(Q(university_id=university_id) | Q(university_id__isnull=True))
    return set(qs.values_list("muted_user_id", flat=True))


def users_are_blocked(user_a_id, user_b_id):
    if not user_a_id or not user_b_id or user_a_id == user_b_id:
        return False
    from .models import UserBlock

    return UserBlock.objects.filter(
        Q(blocker_id=user_a_id, blocked_id=user_b_id)
        | Q(blocker_id=user_b_id, blocked_id=user_a_id)
    ).exists()


def filter_university_messages_for_viewer(queryset, viewer, university_id):
    blocked = blocked_user_ids_for(viewer.id)
    if blocked:
        queryset = queryset.exclude(user_id__in=blocked)
    return queryset


def filter_direct_messages_for_viewer(queryset, viewer):
    blocked = blocked_user_ids_for(viewer.id)
    if blocked:
        queryset = queryset.exclude(sender_id__in=blocked)
    return queryset


def should_notify_viewer_about_sender(viewer_id, sender_id, *, university_id=None):
    if not viewer_id or not sender_id or viewer_id == sender_id:
        return False
    if sender_id in blocked_user_ids_for(viewer_id):
        return False
    if sender_id in muted_user_ids_for(viewer_id, university_id):
        return False
    return True


def filter_messages_by_tag(queryset, tag):
    if not tag:
        return queryset
    from django.db import connection

    if connection.vendor == "postgresql":
        return queryset.filter(tags__contains=[tag])
    return [message for message in queryset if tag in (message.tags or [])]


def popular_tags_for_university(university_id, *, limit=20):
    from .models import ChatMessage

    counts = {}
    messages = (
        ChatMessage.objects.filter(university_id=university_id, is_deleted=False)
        .exclude(tags=[])
        .values_list("tags", flat=True)[:500]
    )
    for tag_list in messages:
        if not isinstance(tag_list, list):
            continue
        for tag in tag_list:
            if not tag:
                continue
            counts[tag] = counts.get(tag, 0) + 1
    ranked = sorted(counts.items(), key=lambda item: (-item[1], item[0]))
    return [{"tag": tag, "count": count} for tag, count in ranked[:limit]]
