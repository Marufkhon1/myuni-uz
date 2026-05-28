CHAT_COLOR_KEYS = (
    "pink",
    "cyan",
    "blue",
    "orange",
    "green",
    "purple",
    "coral",
    "teal",
    "rose",
    "mint",
)

CHAT_COLOR_SET = frozenset(CHAT_COLOR_KEYS)


def default_chat_color_key(user_id: int) -> str:
    return CHAT_COLOR_KEYS[abs(int(user_id)) % len(CHAT_COLOR_KEYS)]


def resolve_chat_color_key(profile) -> str:
    if profile is None:
        return CHAT_COLOR_KEYS[0]
    stored = (getattr(profile, "chat_color", None) or "").strip()
    if stored in CHAT_COLOR_SET:
        return stored
    return default_chat_color_key(profile.user_id)
