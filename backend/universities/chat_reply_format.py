"""
Chat reply envelope (frontend chatReplyFormat.js bilan mos).

Moderatsiya faqat body ni tekshiradi — quoted parent matn FP/FN bermasligi kerun.
"""

from __future__ import annotations

import json

REPLY_START = "⟦myuni-reply⟧"
REPLY_END = "⟦/myuni-reply⟧"


def extract_chat_moderation_text(raw: str | None) -> str:
    """
    Filter uchun matn: reply envelope bo'lsa faqat yangi body.
    Envelope yaroqsiz bo'lsa — butun matn (fail-closed emas: body yo'qolmasin).
    """
    text = str(raw or "")
    if not text.startswith(REPLY_START):
        return text
    end = text.find(REPLY_END)
    if end < 0:
        return text
    body = text[end + len(REPLY_END) :].lstrip("\n")
    # Meta JSON ni tekshirish (ixtiyoriy); buzilgan bo'lsa ham body ni qaytaramiz
    meta_raw = text[len(REPLY_START) : end]
    try:
        json.loads(meta_raw)
    except json.JSONDecodeError:
        return text
    return body if body.strip() else text
