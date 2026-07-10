"""
Moderation matn normalizatsiyasi — 7 qadamli pipeline.

Maqsad: ahmoq / axmoq / ahmoqq / a-h-m-o-q / ahm0q / аҳмоқ → bir xil kanonik shakl.
Lug'atga minglab variant yozilmaydi; faqat kanonik ildizlar solishtiriladi.
"""

from __future__ import annotations

import re
import unicodedata

# --- Step 3: Homoglyph / kirill → lotin (+ o'zbek maxsus) ---
_CYRILLIC_TO_LATIN = str.maketrans(
    {
        "а": "a",
        "ә": "a",
        "б": "b",
        "в": "v",
        "г": "g",
        "ғ": "g",
        "д": "d",
        "е": "e",
        "ё": "e",
        "ж": "j",
        "з": "z",
        "и": "i",
        "й": "y",
        "к": "k",
        "қ": "q",
        "л": "l",
        "м": "m",
        "н": "n",
        "ң": "n",
        "о": "o",
        "ө": "o",
        "п": "p",
        "р": "r",
        "с": "s",
        "т": "t",
        "у": "u",
        "ү": "u",
        "ў": "o",
        "ф": "f",
        "х": "h",  # ахмоқ → ahmoq
        "ҳ": "h",
        "ц": "s",
        "ч": "ch",
        "ш": "sh",
        "щ": "sh",
        "ъ": "",
        "ы": "i",
        "ь": "",
        "э": "e",
        "ю": "yu",
        "я": "ya",
        # Grek confusable (kam uchraydigan bypass)
        "α": "a",
        "ο": "o",
        "ρ": "p",
        "ι": "i",
        "ν": "n",
        "τ": "t",
        "κ": "k",
        "χ": "h",
    }
)

# Step 3 (davomi): leet / raqam-belgi → harf
_LEET_MAP = str.maketrans(
    {
        "@": "a",
        "4": "a",
        "0": "o",
        "1": "i",
        "!": "i",
        "3": "e",
        "$": "s",
        "5": "s",
        "7": "t",
        "+": "t",
    }
)

# Step 2: zero-width / format / soft hyphen
_ZERO_WIDTH_RE = re.compile(
    r"["
    r"\u200b\u200c\u200d\u2060\ufeff"  # ZWSP, ZWNJ, ZWJ, WJ, BOM
    r"\u00ad\u180e"  # soft hyphen, MONGolian separator
    r"\u200e\u200f\u202a-\u202e"  # LTR/RTL marks & embeddings
    r"\u2066-\u2069"  # isolate marks
    r"]"
)

# Step 4: o'zbek apostrof / tutuq belgilari
_APOSTROPHE_RE = re.compile(
    r"["
    r"'ʻʼʹˈ′`´"
    r"\u2018\u2019\u201b\u02bb\u02bc\u02b9\uff07"
    r"]"
)

# Step 5: noise (ajratuvchilar) — harflarni birlashtirish
_NON_ALNUM_RE = re.compile(r"[^a-z0-9]+")

# Step 6: stretch — 3+ takror → 2 (ahmoqqq → ahmoqq)
_STRETCH_RE = re.compile(r"(.)\1{2,}")

NORMALIZATION_STEP_COUNT = 7
NORMALIZATION_STEPS = (
    "casefold",
    "nfkc_zero_width",
    "homoglyph_leet",
    "uzbek_spelling",
    "strip_noise",
    "stretch_squash",
    "continuous_form",
)


def _step1_casefold(value: str) -> str:
    """1. Lowercase / casefold — AhMoq → ahmoq."""
    return value.casefold()


def _step2_nfkc_and_zero_width(value: str) -> str:
    """2. Unicode NFKC + yashirin/format belgilarini olib tashlash."""
    value = unicodedata.normalize("NFKC", value)
    return _ZERO_WIDTH_RE.sub("", value)


def _step3_homoglyph_and_leet(value: str) -> str:
    """3. Homoglyph (kirill/grek→lotin) + leet (@→a, 0→o, …)."""
    value = value.translate(_CYRILLIC_TO_LATIN)
    return value.translate(_LEET_MAP)


def _step4_uzbek_spelling(value: str) -> str:
    """4. O'zbek imlo: x→h (axmoq→ahmoq), apostroflarni bir xillashtirish/olib tashlash."""
    value = value.replace("x", "h")
    return _APOSTROPHE_RE.sub("", value)


def _step5_strip_noise(value: str) -> str:
    """5. Noise: . - _ * bo'shliq va boshqa ajratuvchilarni olib tashlash."""
    return _NON_ALNUM_RE.sub("", value)


def _step6_stretch_squash(value: str) -> str:
    """6. Stretch squash: ahmoqqq → ahmoqq (max 2 takror)."""
    return _STRETCH_RE.sub(r"\1\1", value)


def _step7_continuous_form(value: str) -> str:
    """
    7. Continuous canonical string.
    Ajratuvchilar allaqachon ketgan; bu qadam yakuniy tozalash (bo'sh qoldiqlar).
    Token-bosqichli match filter modulida qilinadi.
    """
    return value.strip()


def normalize_for_moderation(text: str | None) -> str:
    """
    7 qadamli kanonik normalizatsiya (moderatsiya / so'kinish filtri).

    1) casefold
    2) NFKC + zero-width
    3) homoglyph + leet
    4) o'zbek imlo (x→h, apostrof)
    5) noise strip (a-h-m-o-q → ahmoq)
    6) stretch squash (ahmoqqq → ahmoqq)
    7) continuous form
    """
    if text is None:
        return ""
    value = str(text)
    if not value:
        return ""

    value = _step1_casefold(value)
    value = _step2_nfkc_and_zero_width(value)
    value = _step3_homoglyph_and_leet(value)
    value = _step4_uzbek_spelling(value)
    value = _step5_strip_noise(value)
    value = _step6_stretch_squash(value)
    value = _step7_continuous_form(value)
    return value


def normalize_steps(text: str | None) -> dict[str, str]:
    """Debug/ops: har bir qadamdan keyingi natija (test va audit uchun)."""
    if text is None:
        raw = ""
    else:
        raw = str(text)

    steps: dict[str, str] = {"input": raw}
    if not raw:
        for name in NORMALIZATION_STEPS:
            steps[name] = ""
        steps["output"] = ""
        return steps

    value = _step1_casefold(raw)
    steps["casefold"] = value
    value = _step2_nfkc_and_zero_width(value)
    steps["nfkc_zero_width"] = value
    value = _step3_homoglyph_and_leet(value)
    steps["homoglyph_leet"] = value
    value = _step4_uzbek_spelling(value)
    steps["uzbek_spelling"] = value
    value = _step5_strip_noise(value)
    steps["strip_noise"] = value
    value = _step6_stretch_squash(value)
    steps["stretch_squash"] = value
    value = _step7_continuous_form(value)
    steps["continuous_form"] = value
    steps["output"] = value
    return steps


# Orqaga moslik
normalize_for_profanity = normalize_for_moderation
normalize_token = normalize_for_moderation
