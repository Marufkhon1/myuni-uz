from universities.chat_permissions import user_is_university_member
from universities.models import ChatMessage, DirectThread

from .avatar_access import has_private_message_history


def has_direct_thread(viewer, target_user) -> bool:
    first_id, second_id = sorted([viewer.id, target_user.id])
    return DirectThread.objects.filter(user_one_id=first_id, user_two_id=second_id).exists()


def target_posted_in_university_chat(target_user, university_id) -> bool:
    return ChatMessage.objects.filter(university_id=university_id, user=target_user).exists()


def can_view_chat_profile(viewer, target_user, university_id=None) -> bool:
    """
    Profil faqat chat kontekstida:
    - o'zingiz
    - shaxsiy chat (thread) bo'lsa
    - shaxsiy xabar tarixi bo'lsa
    - guruh chatda shu universitetda kamida bitta xabar yozgan bo'lsa (ko'ruvchi a'zo)
    """
    if not viewer or not getattr(viewer, "is_authenticated", False):
        return False

    if viewer.id == target_user.id:
        return True

    if has_direct_thread(viewer, target_user) or has_private_message_history(viewer, target_user):
        return True

    if university_id is None:
        return False

    if not user_is_university_member(viewer, university_id):
        return False

    return target_posted_in_university_chat(target_user, university_id)
