from django.db.models import Q
from django.shortcuts import get_object_or_404

from .models import ChatMembership, DirectThread, University


def get_university_or_404(university_id):
    return get_object_or_404(University, pk=university_id)


def user_is_university_member(user, university_id) -> bool:
    return ChatMembership.objects.filter(user=user, university_id=university_id).exists()


def require_university_member(user, university_id):
    get_university_or_404(university_id)
    if not user_is_university_member(user, university_id):
        return False
    return True


def get_user_direct_thread(user, thread_id):
    return get_object_or_404(
        DirectThread.objects.filter(Q(user_one=user) | Q(user_two=user)),
        pk=thread_id,
    )
