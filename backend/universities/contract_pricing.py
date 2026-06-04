"""2025/2026 contract pricing helpers (national base rates + institution estimates)."""
from __future__ import annotations

ACADEMIC_YEAR = "2025/2026"
CURRENCY = "UZS"

# Davlat komissiyasi bazaviy to'lov-kontrakt (bakalavriat, stipendiyasiz) — goldenpages/abt.uz
FIELD_CLUSTER_KUNDUZGI: dict[str, int] = {
    "pedagogika": 7_400_000,
    "gumanitar": 7_400_000,
    "filologiya": 8_150_000,
    "siyosat": 11_250_000,
    "tabiiy_fanlar": 7_400_000,
    "sotsiologiya": 7_400_000,
    "jurnalistika": 7_400_000,
    "iqtisod": 10_500_000,
    "xalqaro_iqtisod": 11_250_000,
    "huquq": 11_250_000,
    "muhandislik": 7_400_000,
    "it": 8_150_000,
    "akt_menejment": 10_500_000,
    "qurilish": 8_150_000,
    "arxitektura": 8_950_000,
    "qishloq": 7_400_000,
    "tibbiyot": 10_500_000,
    "ijtimoiy": 7_400_000,
    "xizmat": 8_150_000,
    "sport": 7_400_000,
    "transport": 7_400_000,
    "sanat": 8_950_000,
    "konchilik": 7_400_000,
    "general": 8_150_000,
}

# Sirtqi, kechki, masofaviy — rasmiy nisbiy koeffitsient (~16,5% yuqori, yo'nalishga qarab)
FORM_MULTIPLIER: dict[str, float] = {
    "kunduzgi": 1.0,
    "kechki": 1.165,
    "sirtqi": 1.165,
    "masofaviy": 1.166,
}

FORM_LABELS: dict[str, str] = {
    "kunduzgi": "Kunduzgi",
    "kechki": "Kechki",
    "sirtqi": "Sirtqi",
    "masofaviy": "Masofaviy",
}

# Moliyaviy mustaqillik / maxsus narx siyosati (yuqoriroq)
PREMIUM_STATE_NAMES = {
    "Yangi O'zbekiston universiteti",
    "Jahon iqtisodiyoti va diplomatiya universiteti",
    "O'zbekiston milliy universiteti",
    "Toshkent axborot texnologiyalari universiteti",
    "Toshkent davlat iqtisodiyot universiteti",
}

PRIVATE_MULTIPLIER = 1.45
INTERNATIONAL_MULTIPLIER = 1.85
PREMIUM_STATE_MULTIPLIER = 1.15
FILIAL_FORM_CODES = ("kunduzgi", "kechki")


def _normalize(text: str) -> str:
    return (text or "").lower().replace("ʻ", "'").replace("’", "'")


def detect_field_clusters(name: str, ownership_type: str) -> list[str]:
    n = _normalize(name)
    clusters: list[str] = []

    def add(*keys: str):
        for key in keys:
            if key not in clusters:
                clusters.append(key)

    if any(k in n for k in ("tibbiyot", "meditsina", "stomatolog", "farmatsevt", "salomatlik")):
        add("tibbiyot")
    if any(k in n for k in ("pedagog", "pedagogika")):
        add("pedagogika")
    if any(k in n for k in ("huquq", "yuridik", "advokat")):
        add("huquq")
    if any(k in n for k in ("iqtisodiyot", "iqtisod", "moliya", "buxgalter", "servis", "biznes")):
        add("iqtisod")
    if "xalqaro iqtisod" in n or ("xalqaro" in n and "iqtisod" in n):
        add("xalqaro_iqtisod")
    if any(k in n for k in ("axborot texnolog", "dasturiy", "kiber", "it park", "digital")):
        add("it")
    if any(k in n for k in ("texnika", "muhandislik", "politex", "energetika")):
        add("muhandislik")
    if any(k in n for k in ("arxitektura", "qurilish")):
        add("qurilish", "arxitektura")
    if any(k in n for k in ("transport", "logistika")):
        add("transport")
    if any(k in n for k in ("agrarn", "agro", "qishloq", "veterinar", "konchilik")):
        add("qishloq" if "konchilik" not in n else "konchilik")
    if any(k in n for k in ("jurnalist", "ommaviy kommunikatsiya")):
        add("jurnalistika")
    if any(k in n for k in ("san'at", "konservator", "musiqa", "rassomlik", "xoreograf", "estrada")):
        add("sanat")
    if any(k in n for k in ("sport", "jismoniy tarbiya")):
        add("sport")
    if any(k in n for k in ("chet till", "filolog", "tillar", "tarjima", "sharqshunos")):
        add("filologiya")
    if any(k in n for k in ("servis", "turizm", "mehmonxona", "restoran", "ovqatlanish")):
        add("xizmat")
    if any(k in n for k in ("psixolog", "sotsiolog")):
        add("sotsiologiya")

    if ownership_type == "international":
        add("xalqaro_iqtisod", "it")

    if not clusters:
        if ownership_type == "private":
            add("akt_menejment", "it")
        else:
            add("general")

    return clusters


def detect_study_forms(name: str, ownership_type: str, short_name: str = "") -> list[str]:
    n = _normalize(name)

    if ownership_type == "international":
        return ["kunduzgi"]

    is_filial = any(k in n for k in ("filiali", "filial", "fakulteti"))

    if ownership_type == "private":
        forms = ["kunduzgi", "kechki"]
        if any(k in n for k in ("masofaviy", "sirtqi")) or "TIUE" in short_name:
            forms.extend(["sirtqi", "masofaviy"])
        return _unique_forms(forms)

    if is_filial:
        return ["kunduzgi", "kechki"]

    # Davlat asosiy kampus / institut — SamISI kabi 4 shakl
    return ["kunduzgi", "kechki", "sirtqi", "masofaviy"]


def _unique_forms(forms: list[str]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    for code in forms:
        if code not in seen:
            seen.add(code)
            ordered.append(code)
    return ordered


def _ownership_multiplier(name: str, ownership_type: str) -> float:
    if ownership_type == "private":
        return PRIVATE_MULTIPLIER
    if ownership_type == "international":
        return INTERNATIONAL_MULTIPLIER
    if name in PREMIUM_STATE_NAMES:
        return PREMIUM_STATE_MULTIPLIER
    return 1.0


def _round_uzs(value: float) -> int:
    return int(round(value, -4))  # 10 minglikka yaxlitlash


def build_contract_pricing(
    name: str,
    ownership_type: str,
    short_name: str = "",
) -> dict:
    clusters = detect_field_clusters(name, ownership_type)
    base_kunduzgi_values = [FIELD_CLUSTER_KUNDUZGI[c] for c in clusters]
    base_kunduzgi = sum(base_kunduzgi_values) / len(base_kunduzgi_values)
    ownership_mult = _ownership_multiplier(name, ownership_type)

    forms_codes = detect_study_forms(name, ownership_type, short_name)
    forms = []
    for code in forms_codes:
        mult = FORM_MULTIPLIER[code]
        per_cluster = [
            _round_uzs(FIELD_CLUSTER_KUNDUZGI[c] * mult * ownership_mult) for c in clusters
        ]
        average = _round_uzs(sum(per_cluster) / len(per_cluster))
        forms.append(
            {
                "code": code,
                "label": FORM_LABELS[code],
                "average_uzs": average,
                "min_uzs": min(per_cluster),
                "max_uzs": max(per_cluster),
            }
        )

    if ownership_type == "state":
        source = "national_base_2025_2026"
        note = (
            "O'rtacha narx davlat komissiyasining 2025/2026 yilgi bazaviy to'lov-kontrakt "
            "tariflari va muassasa ixtisoslashuvi bo'yicha hisoblangan (stipendiyasiz, bakalavriat)."
        )
    elif ownership_type == "private":
        source = "estimated_private"
        note = (
            "Nodavlat OTM — davlat bazaviy tarifiga nisbatan taxminiy koeffitsient asosida. "
            "Aniq narx kontrakt.edu.uz yoki muassasa saytidan tekshiriladi."
        )
    else:
        source = "estimated_international"
        note = (
            "Xorijiy filial — davlat bazaviy tarifiga nisbatan yuqoriroq taxminiy diapazon. "
            "Aniq narx muassasa shartnomasida ko'rsatiladi."
        )

    return {
        "academic_year": ACADEMIC_YEAR,
        "currency": CURRENCY,
        "source": source,
        "field_clusters": clusters,
        "forms": forms,
        "note": note,
    }
