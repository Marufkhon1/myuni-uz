"""
Sharh + chat moderatsiyasi — qoida, UX matnlari va qamrov.

Step 8: reviews va chat bir xil filter (ACTIVE_PROFANITY_SCOPES).
"""

# Qamrov bayroqlari
PROFANITY_SCOPE_REVIEWS = "reviews"
PROFANITY_SCOPE_CHAT = "chat"
ACTIVE_PROFANITY_SCOPES = frozenset({PROFANITY_SCOPE_REVIEWS, PROFANITY_SCOPE_CHAT})

# Foydalanuvchiga ko'rinadigan asosiy xabar (API + UI).
PROFANITY_REJECTION_MESSAGE = (
    "Sizniki moderatsiyadan o'tmadi. Iltimos, odobli til bilan qayta yozing."
)

# Forma ostidagi qisqa eslatma.
REVIEW_MODERATION_FOOTER_NOTE = (
    "Haqorat va so'kinish taqiqlangan — bunday matn darhol rad etiladi. "
    "Odobli sharhlar tez tasdiqlanadi. Shaxsiy ma'lumot yozmang."
)

# Forma ichidagi qisqa qoidalar (3 qator).
REVIEW_MODERATION_SHORT_RULES = (
    "Haqorat, so'kinish va kamsituvchi so'zlar taqiqlangan (buzib yozilgan shakllar ham).",
    "Shaxsiy ma'lumot (telefon, manzil) yozmang.",
    "Toza, odobli sharhlar avtomatik tasdiqlanadi va saytda ko'rinadi.",
)

REVIEW_GUIDELINES_PATH = "/sharh-qoidalari"
REVIEW_MODERATION_SCOPE_NOTE = "Sharhlar va chat xabarlari bir xil filterdan o'tadi."

# Moderatsiya note (admin/log).
PROFANITY_REJECTION_NOTE = "auto:profanity"
PROFANITY_CLEAR_NOTE = "auto:profanity_clear"

# Step 8 — fuzzy / toxicity (settings override qiladi)
FUZZY_STRATEGY = "fuzzy_1"
FUZZY_MIN_STEM_LEN = 5
# high: faqat uzun stem (8+) — bezori/retard/fucker (6–7) medium → toxicity shart
FUZZY_HIGH_STEM_LEN = 8
FUZZY_MAX_DISTANCE = 1
