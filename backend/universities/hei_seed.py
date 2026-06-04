"""Helpers for seeding official Uzbekistan HEI catalog (207 institutions)."""
from __future__ import annotations

import json
import re
from decimal import Decimal
from pathlib import Path

from django.utils.text import slugify

DATA_PATH = Path(__file__).resolve().parent / "data" / "uz_hei_207.json"

CITY_COORDINATES = {
    "Toshkent": (Decimal("41.299500"), Decimal("69.240100")),
    "Samarqand": (Decimal("39.654200"), Decimal("66.959700")),
    "Buxoro": (Decimal("39.774700"), Decimal("64.428600")),
    "Andijon": (Decimal("40.782100"), Decimal("72.344200")),
    "Namangan": (Decimal("40.998300"), Decimal("71.672600")),
    "Farg'ona": (Decimal("40.384200"), Decimal("71.784300")),
    "Nukus": (Decimal("42.461100"), Decimal("59.600300")),
    "Qarshi": (Decimal("38.860600"), Decimal("65.789100")),
    "Urganch": (Decimal("41.550000"), Decimal("60.633300")),
    "Jizzax": (Decimal("40.115800"), Decimal("67.842200")),
    "Termiz": (Decimal("37.224200"), Decimal("67.278300")),
    "Navoiy": (Decimal("40.084400"), Decimal("65.379200")),
    "Guliston": (Decimal("40.489700"), Decimal("68.784200")),
    "Chirchiq": (Decimal("41.468900"), Decimal("69.582200")),
    "Angren": (Decimal("41.016700"), Decimal("70.143600")),
    "Olmaliq": (Decimal("40.844700"), Decimal("69.598300")),
    "Nurafshon": (Decimal("41.016700"), Decimal("69.016700")),
    "Qo'qon": (Decimal("40.528600"), Decimal("70.942800")),
    "Marg'ilon": (Decimal("40.465300"), Decimal("71.724700")),
    "Kattaqo'rg'on": (Decimal("39.898900"), Decimal("66.256100")),
    "Urgut": (Decimal("39.402200"), Decimal("67.243100")),
    "Shahrisabz": (Decimal("39.057800"), Decimal("66.834200")),
    "Denov": (Decimal("38.266700"), Decimal("67.900000")),
    "Yangiyer": (Decimal("40.275000"), Decimal("68.822500")),
    "Zarafshon": (Decimal("41.576900"), Decimal("64.201400")),
}

OWNERSHIP_DESCRIPTIONS = {
    "state": "O'zbekiston Respublikasi davlat oliy ta'lim muassasasi.",
    "private": "Nodavlat (xususiy) oliy ta'lim muassasasi.",
    "international": "Xorijiy universitetning O'zbekistondagi filiali.",
}

KNOWN_SHORT_NAMES = {
    "Toshkent davlat iqtisodiyot universiteti": "TDIU",
    "Toshkent axborot texnologiyalari universiteti": "TATU",
    "Toshkent davlat texnika universiteti": "TDTU",
    "Toshkent davlat tibbiyot universiteti": "TDTibbU",
    "Toshkent davlat yuridik universiteti": "TDYU",
    "Toshkent davlat sharqshunoslik universiteti": "TDShU",
    "Toshkent davlat transport universiteti": "TDTU Transport",
    "Toshkent davlat o'zbek tili va adabiyoti universiteti": "TDO'zTUA",
    "Toshkent arxitektura-qurilish universiteti": "TAQU",
    "Toshkent kimyo-texnologiya instituti": "TKTI",
    "O'zbekiston milliy universiteti": "O'zMU",
    "O'zbekiston davlat jahon tillari universiteti": "O'zDJTU",
    "O'zbekiston milliy pedagogika universiteti": "O'zMPU",
    "O'zbekiston jurnalistika va ommaviy kommunikatsiyalar universiteti": "O'zJKU",
    "Jahon iqtisodiyoti va diplomatiya universiteti": "JIDU",
    "Toshkent Xalqaro Vestminster Universiteti": "WIUT",
    "Toshkent shahridagi Inha Universiteti": "Inha",
    "Toshkent shahridagi Amiti universiteti": "Amity",
    "Toshkent shahridagi Puchon universiteti": "Puchon",
    "Turin politexnika universiteti Toshkent": "TTPU",
    "Andijon davlat universiteti": "AndDU",
    "Farg'ona davlat universiteti": "FarDU",
    "Namangan davlat universiteti": "NamDU",
    "Buxoro davlat universiteti": "BuxDU",
    "Qarshi davlat universiteti": "QarDU",
    "Sharof Rashidov nomidagi Samarqand davlat universiteti": "SamDU",
    "Samarqand davlat tibbiyot universiteti": "SamDTU",
    "Berdaq nomidagi Qoraqalpoq davlat universiteti": "QorDU",
    "Urganch davlat universiteti": "UrDU",
    "Termiz davlat universiteti": "TerDU",
    "Guliston davlat universiteti": "GulDU",
    "Yangi O'zbekiston universiteti": "Yang'i O'zU",
    "Toshkent kimyo xalqaro universiteti": "KIUT",
    "Akfa universiteti": "Akfa",
    "MGIMO (Moskva davlat xalqaro munosabatlar instituti) Toshkent filiali": "MGIMO",
    "M.V. Lomonosov nomidagi Moskva davlat universiteti (Toshkent filiali)": "MSU Toshkent",
    "Toshkent davlat iqtisodiyot universiteti Samarqand filiali": "TDIU Samarqand",
    "Toshkent axborot texnologiyalari universiteti Samarqand filiali": "TATU Samarqand",
    "Toshkent axborot texnologiyalari universiteti Nurafshon filiali": "TATU Nurafshon",
    "Toshkent axborot texnologiyalari universiteti Urganch filiali": "TATU Urganch",
    "Toshkent axborot texnologiyalari universiteti Zarafshon fakulteti": "TATU Zarafshon",
    "Toshkent davlat texnika universiteti Olmaliq filiali": "TDTU Olmaliq",
    "Toshkent davlat tibbiyot universiteti Chirchiq filiali": "TDTU Chirchiq",
    "Toshkent davlat tibbiyot universiteti Termiz filiali": "TDTU Termiz",
    "Toshkent kimyo-texnologiya instituti Yangiyer filiali": "TKTI Yangiyer",
}

SKIP_WORDS = {
    "o'zbekiston",
    "ozbekiston",
    "davlat",
    "nomidagi",
    "respublikasi",
    "universiteti",
    "university",
    "instituti",
    "institute",
    "akademiyasi",
    "filiali",
    "fakulteti",
    "the",
    "of",
    "in",
    "and",
    "ta",
    "va",
    "shahridagi",
    "shahri",
    "viloyati",
    "milliy",
    "milli",
    "xalqaro",
    "international",
}


def load_hei_data() -> list[dict]:
    with DATA_PATH.open(encoding="utf-8") as handle:
        return json.load(handle)


def institution_type_for(name: str, ownership_type: str) -> str:
    lowered = name.lower()
    if "filiali" in lowered or "filial" in lowered or "fakulteti" in lowered:
        return "Filial"
    if "instituti" in lowered or "institute" in lowered:
        return "Institut"
    if "akademiyasi" in lowered:
        return "Akademiya"
    if "konservatoriyasi" in lowered:
        return "Konservatoriya"
    if ownership_type == "international":
        return "Xorijiy filial"
    if ownership_type == "private":
        return "Nodavlat universiteti"
    return "Davlat universiteti"


def _acronym(name: str, max_len: int = 12) -> str:
    words = re.findall(r"[A-Za-z0-9O''o'']+", name)
    letters = []
    for word in words:
        lower = word.lower()
        if lower in SKIP_WORDS or len(word) < 2:
            continue
        if word.isupper() and len(word) <= 6:
            letters.append(word)
        else:
            letters.append(word[0].upper())
    if not letters:
        return slugify(name)[:max_len].upper() or "OTM"
    result = "".join(letters)
    if len(result) > max_len:
        result = result[:max_len]
    return result


def short_name_for(name: str, used: set[str]) -> str:
    if name in KNOWN_SHORT_NAMES:
        candidate = KNOWN_SHORT_NAMES[name][:80]
    elif "filiali" in name.lower() or "fakulteti" in name.lower():
        parent = re.split(r"\s*\(", name)[0].strip()
        branch = ""
        if "(" in name:
            branch = name.split("(", 1)[1].replace(")", "").strip()
            branch = branch.replace(" filiali", "").replace(" fakulteti", "")
        parent_short = KNOWN_SHORT_NAMES.get(parent) or _acronym(parent, 8)
        candidate = f"{parent_short} {branch}".strip()[:80]
    else:
        candidate = _acronym(name, 10)

    base = candidate or "OTM"
    unique = base
    counter = 2
    while unique in used:
        suffix = f"-{counter}"
        unique = f"{base[: 80 - len(suffix)]}{suffix}"
        counter += 1
    used.add(unique)
    return unique


def slug_for_short_name(short_name: str, used: set[str]) -> str:
    base = slugify(short_name, allow_unicode=False) or "universitet"
    base = re.sub(r"[^a-z0-9-]", "", base.lower())[:80] or "universitet"
    candidate = base
    counter = 2
    while candidate in used:
        candidate = f"{base}-{counter}"
        counter += 1
    used.add(candidate)
    return candidate


def coords_for_city(city: str, index: int):
    base = CITY_COORDINATES.get(city)
    if not base:
        return None, None
    offset = Decimal(index % 20 - 10) * Decimal("0.002")
    return base[0] + offset, base[1] + offset * Decimal("0.7")


def gallery_urls(slug: str) -> list[str]:
    return [f"/images/universities/{slug}.jpg"]


def build_university_record(entry: dict, index: int, used_short: set[str], used_slugs: set[str]) -> dict:
    name = entry["name"].strip()
    city = entry["city"].strip()
    ownership = entry["ownership_type"]
    preset = (entry.get("short_name") or "").strip()
    if preset:
        short_name = preset
        if short_name in used_short:
            short_name = short_name_for(name, used_short)
        else:
            used_short.add(short_name)
    else:
        short_name = short_name_for(name, used_short)
    slug = slug_for_short_name(short_name, used_slugs)
    lat, lng = coords_for_city(city, index)
    institution_type = institution_type_for(name, ownership)
    return {
        "name": name,
        "short_name": short_name,
        "slug": slug,
        "location": f"{city}, O'zbekiston",
        "city": city,
        "description": OWNERSHIP_DESCRIPTIONS[ownership],
        "institution_type": institution_type,
        "ownership_type": ownership,
        "summary": entry.get("summary", ""),
        "gallery_urls": gallery_urls(slug),
        "address": f"{city}, O'zbekiston",
        "latitude": lat,
        "longitude": lng,
    }
