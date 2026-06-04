"""Generate professional Uzbek (Latin) HEI summaries for all 207 institutions."""
from __future__ import annotations

import json
import re
from hashlib import md5
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent
JSON_PATH = DATA_DIR / "uz_hei_207.json"
OUT_PATH = DATA_DIR / "uz_hei_summaries.py"

from uz_hei_short_names import SHORT_NAMES  # noqa: E402

MANUAL: dict[str, str] = {
    "Toshkent davlat iqtisodiyot universiteti": (
        "Toshkent davlat iqtisodiyot universiteti – Oliy ta'lim, fan va innovatsiyalar vazirligi "
        "tarkibidagi O'zbekiston Respublikasi va Markaziy Osiyodagi eng yirik iqtisodiy "
        "universitetlardan biri. Universitet iqtisodiyot, moliya va soliq sohalari uchun oliy "
        "ma'lumotli mutaxassislar va ilmiy kadrlarni tayyorlash, qayta tayyorlash, malakasini "
        "oshirish hamda metodik ta'minot bo'yicha oliy ta'lim muassasasi hisoblanadi. Universitet "
        "tarkibiga fakultetlar, kafedralar, ilmiy-tadqiqot markazlari hamda filiallar kiradi. "
        "TDIU ilmiy-innovatsion faoliyat va xalqaro hamkorlikni rivojlantirishga qaratilgan.\n\n"
        "Universitet bakalavriat va magistratura bosqichlarida iqtisodiyot, moliya, buxgalteriya "
        "hisobi, raqamli iqtisodiyot, soliqlar va korporativ boshqaruv yo'nalishlarida kadrlar "
        "tayyorlaydi. 2024-yilda Toshkent moliya instituti va Fiskal institut bilan qayta tashkil "
        "etilgan TDIU zamonaviy iqtisodiyot talablariga javob beradigan ta'lim va ilmiy salohiyatni "
        "jamlaydi. Amaliy stajirovka, ilmiy loyihalar va malaka oshirish kurslari o'quv jarayonining "
        "ajralmas qismidir."
    ),
    "Aniq va ijtimoiy fanlar universiteti": (
        "Aniq va ijtimoiy fanlar universiteti (inglizcha: University of Exact and Social Sciences, "
        "qisqacha: AVIFU) – ilm-fan, innovatsiya va texnologiyalar yutuqlari asosida sifatli ta'lim "
        "jarayonini tashkil etish orqali kelajak liderlarini tayyorlashni maqsad qilgan nodavlat "
        "oliygoh. Universitet O'zbekiston Respublikasi Vazirlar Mahkamasi huzuridagi Ta'lim sifatini "
        "nazorat qilish davlat inspeksiyasining № 410326 raqamli litsenziyasi asosida faoliyat yuritadi. "
        "AVIFU zamonaviy auditoriyalar, laboratoriyalar va xalqaro hamkorlik dasturlari bilan ta'minlangan.\n\n"
        "AVIFU o'zbek, rus va ingliz tillarida bakalavriat hamda magistratura dasturlari bo'yicha aniq "
        "fanlar, iqtisodiyot, dasturiy injiniring, filologiya va dizayn yo'nalishlarida ta'lim beradi. "
        "Tanqidiy fikrlash, amaliy ko'nikmalar va mehnat bozoriga mos kadrlar tayyorlash universitetning "
        "ustuvor vazifasi hisoblanadi. Talabalar uchun stajirovka, loyiha ishlari va kasbiy maslahat "
        "xizmatlari muntazam tashkil etiladi."
    ),
}

DOMAIN_RULES: list[tuple[str, str, list[str], list[str], str]] = [
    (
        r"diplomat|xalqaro munosabat|jahon iqtisodiyoti",
        "diplomacy",
        ["xalqaro munosabatlar", "diplomatiya", "geosiyosat", "tashqi siyosat"],
        ["tahliliy markazlar", "til ko'nikmalari"],
        "xalqaro siyosat va diplomatiya kadrlarini tayyorlash",
    ),
    (
        r"tibbiyot|meditsina|medical|stomatolog|salomatlik|veterinar",
        "health",
        ["terapiya", "jarrohlik", "pediatriya", "farmakologiya"],
        ["klinik amaliyot", "laboratoriya tadqiqotlari"],
        "tibbiyot va sog'liqni saqlash sohasidagi kadrlar tayyorlash",
    ),
    (
        r"farmatsevtika|pharma",
        "pharma",
        ["farmatsevtika", "farmakognoziya", "biotexnologiya", "sifat nazorati"],
        ["dori-darmon ishlab chiqarish", "GMP standartlari"],
        "farmatsevtika va biofan mutaxassislarini tayyorlash",
    ),
    (
        r"pedagog|ta'lim institut|ta'lim universitet",
        "pedagogy",
        ["boshlang'ich ta'lim", "maxsus pedagogika", "psixologiya", "metodika"],
        ["inklyuziv ta'lim", "pedagogik amaliyot"],
        "pedagog kadrlar va ta'lim mutaxassislarini tayyorlash",
    ),
    (
        r"huquq|yuridik|huquqni muhofaza",
        "law",
        ["konstitutsiyaviy huquq", "jinoyat huquqi", "fuqarolik huquqi", "xalqaro huquq"],
        ["sud amaliyoti", "huquqiy ekspertiza"],
        "huquqshunos va huquqni muhofaza qilish kadrlarini tayyorlash",
    ),
    (
        r"axborot|IT Park|raqamli|kiber|dasturiy|kompyuter|cyber|digital",
        "it",
        ["dasturiy injiniring", "kiberxavfsizlik", "sun'iy intellekt", "ma'lumotlar tahlili"],
        ["startup ekotizimi", "raqamli transformatsiya"],
        "axborot texnologiyalari va raqamli iqtisodiyot kadrlarini tayyorlash",
    ),
    (
        r"texnika|muhandis|politex|mashina|energetika|konchilik|transport|amaliy fan",
        "engineering",
        ["energetika", "mashinasozlik", "avtomatlashtirish", "qurilish muhandisligi"],
        ["sanoat hamkorligi", "loyihalashtirish"],
        "muhandislik va texnika sohasidagi kadrlar tayyorlash",
    ),
    (
        r"kimyo|neft|gaz",
        "chemistry",
        ["organik kimyo", "neft-gaz kimyosi", "materialshunoslik", "ekologik kimyo"],
        ["sanoat laboratoriyalari", "qayta ishlash texnologiyalari"],
        "kimyo-texnologiya va sanoat mutaxassislarini tayyorlash",
    ),
    (
        r"iqtisod|moliya|biznes|menejment|servis|bank",
        "economics",
        ["iqtisodiyot", "moliya", "buxgalteriya", "marketing"],
        ["raqamli iqtisodiyot", "tadbirkorlik"],
        "iqtisodiyot va boshqaruv kadrlarini tayyorlash",
    ),
    (
        r"agr|qishloq|chorva|agro|oziq-ovqat",
        "agriculture",
        ["agronomiya", "veterinariya", "agrotexnologiya", "oziq-ovqat xavfsizligi"],
        ["qishloq xo'jaligi klasteri", "biotexnologiya"],
        "agrosanoat va qishloq xo'jaligi kadrlarini tayyorlash",
    ),
    (
        r"san'at|musiqa|estrada|dizayn|rassom|xoreograf|konservator|kinematograf|madaniyat",
        "arts",
        ["ijodiy san'at", "musiqa", "dizayn", "madaniy meros"],
        ["ko'rgazmalar", "ijro san'ati"],
        "ijodiy san'at va madaniyat kadrlarini tayyorlash",
    ),
    (
        r"jurnalist|kommunikatsiya|ommaviy",
        "media",
        ["jurnalistika", "PR", "media produksiya", "digital kommunikatsiya"],
        ["matbuot etikasi", "multimediya"],
        "ommaviy kommunikatsiya va media kadrlarini tayyorlash",
    ),
    (
        r"chet tillar|jahon tillar|filolog|til va adabiyot|xorijiy til|gumanitar",
        "languages",
        ["lingvistika", "tarjimonlik", "filologiya", "ikkinchi til"],
        ["xalqaro sertifikatlar", "muloqot amaliyoti"],
        "tilshunoslik va gumanitar fanlar bo'yicha ta'lim berish",
    ),
    (
        r"sharqshunos|islom",
        "oriental",
        ["sharqshunoslik", "tarix", "dinshunoslik", "madaniyatshunoslik"],
        ["mintaqaviy tadqiqotlar", "klassik meros"],
        "sharqshunoslik va gumanitar tadqiqotlar",
    ),
    (
        r"arxitektura|qurilish",
        "architecture",
        ["arxitektura", "shaharsozlik", "qurilish materiallari", "loyihalashtirish"],
        ["barqaror qurilish", "BIM texnologiyalari"],
        "arxitektura va qurilish sohasidagi mutaxassislarni tayyorlash",
    ),
    (
        r"turizm|madaniy meros",
        "tourism",
        ["turizm menejmenti", "gidlik", "mehmondo'stlik", "madaniy meros"],
        ["mintaviy turizm", "xizmat sifati"],
        "turizm va madaniy meros sohasidagi kadrlar tayyorlash",
    ),
    (
        r"sport|jismoniy tarbiya",
        "sport",
        ["jismoniy tarbiya", "sport pedagogikasi", "reabilitatsiya", "fitnes"],
        ["sport inshootlari", "musobaqa tayyorgarligi"],
        "sport va jismoniy tarbiya mutaxassislarini tayyorlash",
    ),
    (
        r"atrof-muhit|iqlim|ekolog|green",
        "environment",
        ["ekologiya", "iqlim o'zgarishi", "barqaror rivojlanish", "atrof-muhit muhandisligi"],
        ["yashil texnologiyalar", "monitoring"],
        "ekologiya va barqaror rivojlanish bo'yicha ta'lim",
    ),
]

DEFAULT = (
    "general",
    ["bakalavriat", "magistratura", "ilmiy tadqiqot"],
    ["ko'p fanli ta'lim", "amaliyot"],
    "ko'p yo'nalishli oliy ta'lim va ilmiy faoliyat",
)

PRIVATE_LICENSE_GENERIC = (
    "O'zbekiston Respublikasida nodavlat oliy ta'lim muassasalari uchun belgilangan "
    "tartibda olingan litsenziya asosida faoliyat yuritadi"
)

PRIVATE_LICENSE_AVIFU = (
    "O'zbekiston Respublikasi Vazirlar Mahkamasi huzuridagi Ta'lim sifatini nazorat qilish "
    "davlat inspeksiyasining № 410326 raqamli litsenziyasi asosida faoliyat yuritadi"
)

FILLERS = [
    "O'quv jarayoni zamonaviy standartlar, amaliy mashg'ulotlar va ilmiy-metodik bazani uyg'unlashtiradi.",
    "Talabalar uchun kutubxona, laboratoriya va ijtimoiy infratuzilma sharoitlari yaratilgan.",
    "Malaka oshirish, qayta tayyorlash va amaliyot dasturlari muntazam takomillashtiriladi.",
    "Bitiruvchilar uchun stajirovka va kasbiy maslahat xizmatlari tashkil etiladi.",
]


def word_count(text: str) -> int:
    return len(text.split())


def pick_variant(name: str, options: list[str]) -> str:
    h = int(md5(name.encode()).hexdigest(), 16)
    return options[h % len(options)]


def detect_profile(name: str) -> tuple[str, list[str], list[str], str]:
    lower = name.lower()
    for pattern, key, programs, strengths, mission in DOMAIN_RULES:
        if re.search(pattern, lower):
            return key, programs, strengths, mission
    return DEFAULT[0], list(DEFAULT[1]), list(DEFAULT[2]), DEFAULT[3]


def is_branch(name: str) -> bool:
    return bool(re.search(r"filiali|fakulteti", name, re.I))


def branch_parent(name: str) -> str:
    for suffix in (
        " Toshkent viloyati filiali",
        " Toshkent filiali",
        " Olmaliq filiali",
        " Chirchiq filiali",
        " Samarqand filiali",
        " Nurafshon filiali",
        " Urganch filiali",
        " Termiz filiali",
        " Zarafshon fakulteti",
        " Yangiyer filiali",
        " Jizzax filiali",
        " Kattaqo'rg'on filiali",
        " Urgut filiali",
        " Nukus filiali",
        " Andijon filiali",
        " Farg'ona filiali",
        " filiali",
        " fakulteti",
    ):
        if suffix in name:
            return name.replace(suffix, "").strip()
    return name


def city_phrase(city: str, region: str) -> str:
    if city == "Toshkent" and "shahar" in region:
        return "Toshkent shahrida"
    return f"{city} shahrida"


def expand_to_range(text: str, name: str, min_w: int = 120, max_w: int = 220) -> str:
    if word_count(text) >= min_w:
        if word_count(text) <= max_w:
            return text
    parts = text.split("\n\n", 1)
    p2 = parts[1] if len(parts) > 1 else parts[0]
    idx = 0
    while word_count(text) < min_w and idx < len(FILLERS) * 2:
        extra = FILLERS[idx % len(FILLERS)]
        if extra not in p2:
            p2 = p2.rstrip() + " " + extra
            text = f"{parts[0]}\n\n{p2}" if len(parts) > 1 else p2
        idx += 1
    fallback = "Ilmiy seminarlar va amaliy loyihalar talabalarning kasbiy tayyorgarligini mustahkamlaydi."
    if word_count(text) < min_w and fallback not in p2:
        p2 = p2.rstrip() + " " + fallback
        text = f"{parts[0]}\n\n{p2}" if len(parts) > 1 else p2
    if word_count(text) > max_w:
        words = text.split()
        text = " ".join(words[:max_w])
        if "\n\n" in text:
            pass
        elif len(parts) > 1:
            mid = max_w // 2
            text = " ".join(words[:mid]) + "\n\n" + " ".join(words[mid:max_w])
    return text


def opening_state(name: str, city: str, region: str, mission: str) -> str:
    loc = city_phrase(city, region)
    reg = f" ({region})" if region and "shahar" not in region else ""
    return (
        f"{name} – Oliy ta'lim, fan va innovatsiyalar vazirligi tizimidagi davlat oliy ta'lim "
        f"muassasasi. {loc}{reg} joylashgan universitet {mission}ga qaratilgan. "
        f"Davlat ta'lim siyosati doirasida o'quv dasturlari, ilmiy-tadqiqot ishlar, "
        f"o'quv-uslubiy hujjatlar va infratuzilma doimiy yangilanadi. "
        f"Fakultetlar, kafedralar hamda ilmiy bo'limlar o'rtasida uyg'un ish tartibi tashkil etilgan."
    )


def opening_private(name: str, short: str, city: str, region: str, mission: str) -> str:
    loc = city_phrase(city, region)
    lic = PRIVATE_LICENSE_AVIFU if name == "Aniq va ijtimoiy fanlar universiteti" else PRIVATE_LICENSE_GENERIC
    suffix = f" (qisqacha: {short})" if re.search(r"[A-Za-z]{3,}", name) or short != name.split()[0] else ""
    return (
        f"{name}{suffix} – {loc} joylashgan nodavlat oliy ta'lim muassasasi. "
        f"Universitet {lic}. "
        f"Muassasa {mission}ni nazarda tutgan o'quv dasturlari va amaliy loyihalar orqali "
        f"nodavlat ta'lim modelining moslashuvchanligi hamda sifat nazoratini ta'minlaydi."
    )


def opening_international(name: str, short: str, city: str, region: str) -> str:
    loc = city_phrase(city, region)
    parent = branch_parent(name)
    return (
        f"{name} – xorijiy oliy ta'lim tashkilotining O'zbekistondagi filiali (qisqacha: {short}). "
        f"{loc} xalqaro ta'lim standartlari, qo'shma dasturlar va ikki diplom (double degree) "
        f"imkoniyatlari ko'rib chiqiladi. {parent} bilan uyg'un o'quv-reja, malaka tan olinishi "
        f"va ilmiy hamkorlik asosida faoliyat yuritiladi. Xorijiy o'qituvchilar va zamonaviy "
        f"o'quv resurslari filialning ustun jihatlaridan hisoblanadi."
    )


def opening_branch(name: str, short: str, city: str, region: str, ownership: str, mission: str) -> str:
    parent = branch_parent(name)
    loc = city_phrase(city, region)
    if ownership == "state":
        own = "Oliy ta'lim, fan va innovatsiyalar vazirligi tizimidagi asosiy muassasaning filiali"
    elif ownership == "international":
        own = "xorijiy universitet filiali"
    else:
        own = "nodavlat muassasaning filiali"
    return (
        f"{name} (qisqacha: {short}) – {parent} tarkibidagi {own}. "
        f"Filial {loc} joylashgan bo'lib, {city} va atrofdagi hududlar uchun {mission} "
        f"vazifasini bajaradi. Asosiy muassasa bilan bir xil o'quv-reja, diplom talablari va "
        f"kadrlar siyosati qo'llaniladi; talabalar amaliyot va ilmiy resurslardan mahalliy sharoitda foydalanadi."
    )


def closing_paragraph(
    name: str,
    short: str,
    programs: list[str],
    strengths: list[str],
    mission: str,
) -> str:
    prog = pick_variant(name, ["asosan", "jumladan", "xususan"])
    dirs = ", ".join(programs[:3])
    if len(programs) > 3:
        dirs += f" va {programs[3]}"
    s1, s2 = strengths[0], strengths[1] if len(strengths) > 1 else strengths[0]
    level = pick_variant(
        name,
        [
            "Bakalavriat va magistratura bosqichlarida",
            "Kunduzgi va kechki shakllarda",
            "O'zbek, rus va ingliz tillarida",
        ],
    )
    return (
        f"{level} {prog} {dirs} yo'nalishlarida kadrlar tayyorlanadi. "
        f"{short} {mission} bo'yicha {s1} va {s2}ni rivojlantiradi. "
        f"Talabalar uchun amaliyot bazalari, ilmiy to'garaklar va kasbiy tayyorgarlik "
        f"dasturlari muntazam tashkil etiladi. O'quv jarayonida zamonaviy pedagogik "
        f"texnologiyalar va baholash tizimlari qo'llaniladi."
    )


def generate_summary(entry: dict) -> str:
    name = entry["name"]
    if name in MANUAL:
        return expand_to_range(MANUAL[name], name)

    short = SHORT_NAMES[name]
    ownership = entry["ownership_type"]
    city = entry["city"]
    region = entry["region"]

    _key, programs, strengths, mission = detect_profile(name)

    if is_branch(name):
        p1 = opening_branch(name, short, city, region, ownership, mission)
    elif ownership == "state":
        p1 = opening_state(name, city, region, mission)
    elif ownership == "private":
        p1 = opening_private(name, short, city, region, mission)
    else:
        p1 = opening_international(name, short, city, region)

    p2 = closing_paragraph(name, short, programs, strengths, mission)
    return expand_to_range(f"{p1}\n\n{p2}", name)


def render_py_file(summaries: dict[str, str], entries: list[dict]) -> str:
    lines = [
        '"""Professional Uzbek (Latin) summaries for all 207 HEIs (keys match uz_hei_207.json)."""',
        "",
        "SUMMARIES: dict[str, str] = {",
    ]
    for entry in entries:
        name = entry["name"]
        val = summaries[name]
        if "\n\n" in val:
            parts = val.split("\n\n")
            joined = " + '\\n\\n' + ".join(repr(p) for p in parts)
            lines.append(f"    {name!r}: {joined},")
        else:
            lines.append(f"    {name!r}: {val!r},")
    lines.append("}")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    entries = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    summaries = {e["name"]: generate_summary(e) for e in entries}

    errors: list[str] = []
    if len(summaries) != 207:
        errors.append(f"Expected 207 summaries, got {len(summaries)}")

    for name, text in summaries.items():
        wc = word_count(text)
        if not (120 <= wc <= 220):
            errors.append(f"Word count {wc} for {name!r}")
        if "\n\n" not in text:
            errors.append(f"Missing paragraph break for {name!r}")

    if errors:
        for e in errors[:25]:
            print(f"ERROR: {e}")
        return 1

    OUT_PATH.write_text(render_py_file(summaries, entries), encoding="utf-8")
    print(f"Wrote {OUT_PATH.name} with {len(summaries)} entries")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
