"""Apply fallback study directions for HEIs missing DTM/infoedu data."""
from __future__ import annotations

from universities.contract_pricing import detect_field_clusters

# Typical licensed directions by cluster (national DIRID-style names)
CLUSTER_DIRECTIONS: dict[str, list[str]] = {
    "pedagogika": [
        "Boshlang'ich ta'lim",
        "Maktabgacha ta'lim",
        "Pedagogika va psixologiya",
        "Boshlang'ich va musiqa ta'limi",
    ],
    "it": [
        "Dasturiy injiniring",
        "Axborot tizimlari va texnologiyalari",
        "Kompyuter injiniringi",
        "Kiberxavfsizlik",
    ],
    "iqtisod": [
        "Iqtisodiyot",
        "Buxgalteriya hisobi",
        "Moliya va moliyaviy texnologiyalar",
        "Menejment",
        "Marketing",
    ],
    "huquq": ["Huquqshunoslik"],
    "tibbiyot": ["Tibbiyot", "Stomatologiya", "Hamshiralik ishi"],
    "muhandislik": [
        "Muhandislik",
        "Energetika muhandisligi",
        "Mexanika muhandisligi",
        "Avtomatlashtirish va boshqarish",
    ],
    "filologiya": [
        "Filologiya va tillarni o'qitish",
        "Chet tili va adabiyoti",
        "Tarjima nazariyasi va amaliyoti",
    ],
    "xizmat": [
        "Mehmonxona xo'jaligi",
        "Turizm va mehmonxona xo'jaligi",
        "Servis",
    ],
    "qurilish": ["Qurilish muhandisligi", "Arxitektura"],
    "sanat": ["Dizayn", "San'atshunoslik"],
    "sport": ["Jismoniy tarbiya va sport"],
    "general": [
        "Biznes boshqaruvi",
        "Axborot tizimlari va texnologiyalari",
        "Psixologiya",
    ],
    "xalqaro_iqtisod": [
        "Xalqaro iqtisodiyot va menejment",
        "Xalqaro munosabatlar",
    ],
    "akt_menejment": ["Biznes boshqaruvi", "Menejment", "Marketing"],
    "transport": ["Transport vositalari muhandisligi", "Logistika"],
    "qishloq": ["Agronomiya", "Qishloq xo'jaligi"],
    "jurnalistika": ["Jurnalistika", "Ommaviy kommunikatsiyalar"],
    "sotsiologiya": ["Psixologiya", "Sotsiologiya"],
}

PRIVATE_EXTRA = [
    "Ingliz tili va adabiyoti",
    "Moliya va kredit",
    "Raqamli iqtisodiyot",
]

INTERNATIONAL_EXTRA = [
    "Xalqaro iqtisodiyot va menejment",
    "Axborot tizimlari va texnologiyalari",
    "Biznes boshqaruvi",
]


def fallback_directions(name: str, ownership_type: str) -> list[dict]:
    clusters = detect_field_clusters(name, ownership_type)
    names: list[str] = []
    for cluster in clusters:
        names.extend(CLUSTER_DIRECTIONS.get(cluster, CLUSTER_DIRECTIONS["general"]))
    if ownership_type == "private":
        names.extend(PRIVATE_EXTRA)
    if ownership_type == "international":
        names.extend(INTERNATIONAL_EXTRA)

    unique: list[str] = []
    seen: set[str] = set()
    for item in names:
        key = item.lower()
        if key in seen:
            continue
        seen.add(key)
        unique.append(item)

    return [
        {
            "dirid": "",
            "name": direction_name,
            "exam_subjects": [],
            "study_forms": ["Kunduzgi"],
            "languages": ["O'zbek"],
        }
        for direction_name in unique
    ]
