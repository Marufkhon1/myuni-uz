from universities.models import DirectMessage


def _profile(target_user):
    return getattr(target_user, "profile", None)


def has_private_message_history(viewer, target_user) -> bool:
    """Ikki foydalanuvchi o'rtasida kamida bitta shaxsiy xabar bo'lsa."""
    first_id, second_id = sorted([viewer.id, target_user.id])
    return DirectMessage.objects.filter(
        thread__user_one_id=first_id,
        thread__user_two_id=second_id,
    ).exists()


def can_view_user_avatar(viewer, target_user) -> bool:
    """
    - O'z rasmingiz: doim ko'rinadi.
    - Hammaga ko'rinadi: barcha joyda (sharh, guruh chat, profil).
    - Faqat shaxsiy chat: faqat shaxsiy xabar almashganlarga.
    """
    if not viewer or not getattr(viewer, "is_authenticated", False):
        return False

    if viewer.id == target_user.id:
        return True

    profile = _profile(target_user)
    if not profile or not profile.avatar:
        return False

    from .models import Profile

    if profile.avatar_visibility == Profile.AvatarVisibility.EVERYONE:
        return True

    if profile.avatar_visibility == Profile.AvatarVisibility.PRIVATE_ONLY:
        return has_private_message_history(viewer, target_user)

    return False


def avatar_url_for_viewer(viewer, target_user, request=None):
    profile = _profile(target_user)
    if not profile or not profile.avatar:
        return None
    if not can_view_user_avatar(viewer, target_user):
        return None
    url = profile.avatar.url
    if request:
        return request.build_absolute_uri(url)
    return url


def avatar_url_for_request(request, target_user):
    """
    Sharhlar (ommaviy), profil modal va boshqa API uchun.
    Mehmon: faqat «hammaga ko'rinadi» bo'lsa rasm qaytariladi.
    """
    profile = _profile(target_user)
    if not profile or not profile.avatar or not request:
        return None

    from .models import Profile

    viewer = getattr(request, "user", None)
    if viewer and viewer.is_authenticated:
        return avatar_url_for_viewer(viewer, target_user, request=request)

    if profile.avatar_visibility == Profile.AvatarVisibility.EVERYONE:
        return request.build_absolute_uri(profile.avatar.url)

    return None
