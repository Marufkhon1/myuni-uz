"""Google OAuth account lookup, linking, and provisioning."""

from __future__ import annotations

from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone

from accounts.models import Profile
from accounts.university_resolution import apply_university_to_profile

User = get_user_model()


def find_user_for_google_email(email: str):
    """
    Match an existing account by email or legacy Google username (= email).

    When duplicates exist (password signup + auto-created Google user),
    prefer the password-backed account created first.
    """
    normalized = str(email or "").lower().strip()
    if not normalized:
        return None

    candidates = list(
        User.objects.filter(Q(email__iexact=normalized) | Q(username__iexact=normalized)).select_related(
            "profile"
        )
    )
    if not candidates:
        return None
    if len(candidates) == 1:
        return candidates[0]

    registered = [user for user in candidates if user.has_usable_password()]
    if registered:
        return min(registered, key=lambda user: user.date_joined or timezone.now())

    return min(candidates, key=lambda user: user.date_joined or timezone.now())


def link_google_identity_to_user(*, user, email: str, full_name: str):
    normalized_email = str(email or "").lower().strip()
    user_updates = []

    if normalized_email and not str(user.email or "").strip():
        user.email = normalized_email
        user_updates.append("email")

    if full_name and not str(user.first_name or "").strip():
        user.first_name = full_name
        user_updates.append("first_name")

    if user_updates:
        user.save(update_fields=user_updates)

    profile, _ = Profile.objects.get_or_create(
        user=user,
        defaults={
            "full_name": full_name,
            "role": Profile.Role.APPLICANT,
            "university": "",
            "email_verified_at": timezone.now(),
        },
    )
    profile_updates = []
    if not profile.email_verified_at:
        profile.email_verified_at = timezone.now()
        profile_updates.append("email_verified_at")
    if full_name and not str(profile.full_name or "").strip():
        profile.full_name = full_name
        profile_updates.append("full_name")
    if profile_updates:
        profile_updates.append("updated_at")
        profile.save(update_fields=profile_updates)

    user.refresh_from_db()
    if hasattr(user, "profile"):
        user.profile.refresh_from_db()

    return user


def resolve_or_create_google_user(*, email, full_name, state):
    """
    Google OAuth provisioning.

  * Existing email (password or Google) -> link and sign in to that account.
  * New email on login or signup -> create a Google-only account.
  * Signup + existing account -> same link; caller should surface "account exists" notice.
    """
    flow = state.get("flow", "login")
    user = find_user_for_google_email(email)
    if user:
        link_google_identity_to_user(user=user, email=email, full_name=full_name)
        return user, None, {"linked_existing": True, "flow": flow}

    if flow == "signup":
        university = (state.get("university") or "").strip()
        university_id = state.get("university_id")
        if not university and not university_id:
            return None, (
                "/signup",
                "Google orqali ro'yxatdan o'tish uchun avval universitet tanlang.",
            ), {"linked_existing": False, "flow": flow}
        role = state.get("role", Profile.Role.APPLICANT)
    else:
        role = Profile.Role.APPLICANT
        university = ""
        university_id = None

    normalized_email = str(email or "").lower().strip()
    user = User(username=normalized_email, email=normalized_email, first_name=full_name)
    user.set_unusable_password()
    user.save()
    profile = Profile(
        user=user,
        full_name=full_name,
        role=role,
        email_verified_at=timezone.now(),
    )
    matched, errors = apply_university_to_profile(
        profile,
        university_id=university_id,
        university_text=university if university else None,
    )
    if errors:
        user.delete()
        return None, ("/signup", errors[0]), {"linked_existing": False, "flow": flow}
    if flow == "signup" and matched is None and not str(profile.university or "").strip():
        user.delete()
        return None, (
            "/signup",
            "Google orqali ro'yxatdan o'tish uchun avval universitet tanlang.",
        ), {"linked_existing": False, "flow": flow}
    profile.save()
    return user, None, {"linked_existing": False, "flow": flow}
