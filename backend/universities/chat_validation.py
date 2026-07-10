"""
Chat / DM matn validatsiyasi — Step 8 (bir xil profanity filter, scope=chat).
"""

from rest_framework import serializers

from .chat_reply_format import extract_chat_moderation_text
from .profanity_filter import check_text_for_scope, log_moderation_hit
from .profanity_policy import PROFANITY_REJECTION_MESSAGE, PROFANITY_SCOPE_CHAT

CHAT_TEXT_MAX_LENGTH = 4000


def validate_chat_text(value):
    text = (value or "").strip()
    if not text:
        raise serializers.ValidationError("Xabar matni bo'sh bo'lmasligi kerak.")
    if len(text) > CHAT_TEXT_MAX_LENGTH:
        raise serializers.ValidationError(
            f"Xabar {CHAT_TEXT_MAX_LENGTH} belgidan oshmasligi kerak."
        )

    # Reply quote ichidagi parent matn filterlanMAYDI — faqat yangi body.
    to_check = extract_chat_moderation_text(text).strip() or text
    match = check_text_for_scope(to_check, PROFANITY_SCOPE_CHAT)
    if match:
        log_moderation_hit(match, scope=PROFANITY_SCOPE_CHAT)
        public = match.to_public_dict()
        raise serializers.ValidationError(public.get("detail") or PROFANITY_REJECTION_MESSAGE)
    return text
