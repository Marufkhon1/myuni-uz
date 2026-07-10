"""Helpers for post-Google (or provisional) profile completion."""

from __future__ import annotations


def username_looks_provisional(username: str) -> bool:
    """Google-created accounts use email as username until the user picks a login."""
    return "@" in str(username or "")


def user_needs_profile_setup(user) -> bool:
    """
    True for provisional Google accounts that still use email as username.

    After complete-profile, username becomes a real nickname and this returns False.
    """
    if user is None or not getattr(user, "is_authenticated", False):
        return False
    return username_looks_provisional(getattr(user, "username", ""))
