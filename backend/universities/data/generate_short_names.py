"""Generate Uzbek HEI short names (207) following abituriyent/OTM conventions."""
from __future__ import annotations

import json
import re
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent / "uz_hei_207.json"

BRANCH_CODE = {
    "Samarqand": "SF",
    "Nurafshon": "NF",
    "Olmaliq": "OF",
    "Chirchiq": "ChF",
    "Urganch": "UF",
    "Termiz": "TF",
    "Zarafshon": "ZF",
    "Yangiyer": "YF",
    "Jizzax": "JF",
    "Kattaqo'rg'on": "KF",
    "Urgut": "UgF",
    "Nukus": "NkF",
    "Andijon": "AF",
    "Farg'ona": "FF",
    "Toshkent": "TF",
}

CITY_PREFIX = {
    "Samarqand": "Sam",
    "Andijon": "And",
    "Buxoro": "Bux",
    "Namangan": "Nam",
    "Farg'ona": "Far",
    "Qarshi": "Qar",
    "Urganch": "Ur",
    "Termiz": "Ter",
    "Guliston": "Gul",
    "Jizzax": "Jiz",
    "Navoiy": "Nav",
    "Nukus": "Nuk",
    "Angren": "Ang",
    "Chirchiq": "Chir",
    "Olmaliq": "Olm",
    "Qo'qon": "Qoq",
    "Marg'ilon": "Mar",
    "Denov": "Den",
    "Shahrisabz": "Shh",
    "Zarafshon": "Zar",
    "Yangiyer": "Yan",
    "Kattaqo'rg'on": "Kat",
    "Urgut": "Urg",
}

MANUAL = {
    "Toshkent davlat iqtisodiyot universiteti": "TDIU",
    "Toshkent axborot texnologiyalari universiteti": "TATU",
    "Toshkent davlat texnika universiteti": "TDTU",
    "Toshkent davlat tibbiyot universiteti": "TDTibbU",
    "Toshkent davlat yuridik universiteti": "TDYU",
    "Toshkent davlat sharqshunoslik universiteti": "TDShU",
    "Toshkent davlat transport universiteti": "TDTrU",
    "Toshkent davlat o'zbek tili va adabiyoti universiteti": "TDOzTAdU",
    "Toshkent arxitektura-qurilish universiteti": "TAQU",
    "Toshkent kimyo-texnologiya instituti": "TKTI",
    "Toshkent farmatsevtika instituti": "TFI",
    "Toshkent to'qimachilik va yengil sanoat instituti": "TTYISI",
    "Toshkent Tech universiteti": "TTechU",
    "O'zbekiston milliy universiteti": "O'zMU",
    "O'zbekiston davlat jahon tillari universiteti": "O'zDJTU",
    "O'zbekiston milliy pedagogika universiteti": "O'zMPU",
    "O'zbekiston jurnalistika va ommaviy kommunikatsiyalar universiteti": "O'zJKU",
    "O'zbekiston davlat konservatoriyasi": "O'zDK",
    "O'zbekiston davlat san'at va madaniyat instituti": "O'zDSMI",
    "O'zbekiston davlat xoreografiya akademiyasi": "O'zDXA",
    "O'zbekiston xalqaro islom akademiyasi": "O'zXIA",
    "O'zbekiston Respublikasi Huquqni muhofaza qilish akademiyasi": "O'zHMA",
    "O'zbekiston davlat jismoniy tarbiya va sport universiteti": "O'zDJTSU",
    "Jahon iqtisodiyoti va diplomatiya universiteti": "JIDU",
    "Yangi O'zbekiston universiteti": "Yang'i O'zU",
    "TIQXMMI milliy tadqiqot universiteti": "TIQXMMI",
    "Toshkent kimyo xalqaro universiteti": "KIUT",
    "Toshkent xalqaro Vestminster universiteti": "WIUT",
    "Toshkent shahridagi Inha universiteti": "Inha",
    "Toshkent shahridagi Amiti universiteti": "Amity",
    "Toshkent shahridagi Puchon universiteti": "Puchon",
    "Toshkent shahridagi Adju universiteti": "Adju",
    "Toshkent shahridagi Yeodju texnika instituti": "Yeodju",
    "Turin politexnika universiteti Toshkent": "TTPU",
    "Turkiyaning iqtisodiyot va texnologiyalar universiteti filiali (TOBB ETU) Toshkent": "TOBB ETU",
    "MGIMO (Moskva davlat xalqaro munosabatlar instituti) Toshkent filiali": "MGIMO",
    "M.V. Lomonosov nomidagi Moskva davlat universiteti Toshkent filiali": "MSU",
    "Sankt-Peterburg davlat universiteti Toshkent filiali": "SPbU",
    "Vebster universitetining ta'lim dasturlari markazi Toshkent": "Webster",
    "Singapur menejmentni rivojlantirish instituti (MDIS) Toshkent": "MDIS",
    "Toshkent davlat agrar universiteti": "TDAU",
    "Markaziy Osiyo atrof-muhit va iqlim o'zgarishini o'rganish universiteti (Green University)": "GreenU",
    "Cyber University": "CyberU",
    "Sharof Rashidov nomidagi Samarqand davlat universiteti": "SamDU",
    "Samarqand davlat tibbiyot universiteti": "SamDTU",
    "Samarqand davlat arxitektura-qurilish universiteti": "SamAQQU",
    "Samarqand iqtisodiyot va servis instituti": "SamISI",
    "Samarqand davlat chet tillari instituti": "SamDChTI",
    "Samarqand agroinnovatsiyalar va tadqiqotlar instituti": "SamAgroII",
    "Samarqand davlat veterinariya meditsinasi, chorvachilik va biotexnologiyalar universiteti": "SamDVMU",
    "Samarqand xalqaro texnologiya universiteti": "SamXTU",
    "Ipak yo'li turizm va madaniy meros xalqaro universiteti": "IpakYo'li TU",
    "Andijon davlat universiteti": "AndDU",
    "Andijon davlat texnika instituti": "AndDTI",
    "Andijon davlat tibbiyot instituti": "AndDTI",
    "Andijon davlat pedagogika instituti": "AndDPI",
    "Andijon davlat chet tillari instituti": "AndDChTI",
    "Andijon qishloq xo'jaligi va agrotexnologiyalar instituti": "AndQXAI",
    "Farg'ona davlat universiteti": "FarDU",
    "Farg'ona davlat texnika universiteti": "FarDTU",
    "Farg'ona jamoat salomatligi tibbiyot instituti": "FarJSTI",
    "Namangan davlat universiteti": "NamDU",
    "Namangan davlat texnika universiteti": "NamDTU",
    "Namangan davlat pedagogika instituti": "NamDPI",
    "Namangan davlat chet tillari instituti": "NamDChTI",
    "Buxoro davlat universiteti": "BuxDU",
    "Buxoro davlat texnika universiteti": "BuxDTU",
    "Buxoro davlat tibbiyot instituti": "BuxDTI",
    "Buxoro davlat pedagogika instituti": "BuxDPI",
    "Qarshi davlat universiteti": "QarDU",
    "Qarshi davlat texnika universiteti": "QarDTU",
    "Shahrisabz davlat pedagogika instituti": "ShhDPI",
    "Urganch davlat universiteti": "UrDU",
    "Urganch davlat tibbiyot instituti": "UrDTI",
    "Urganch davlat pedagogika instituti": "UrDPI",
    "Termiz davlat universiteti": "TerDU",
    "Termiz davlat pedagogika instituti": "TerDPI",
    "Termiz davlat muhandislik va agrotexnologiyalar universiteti": "TerDMAU",
    "Guliston davlat universiteti": "GulDU",
    "Guliston davlat pedagogika instituti": "GulDPI",
    "Jizzax davlat pedagogika universiteti": "JizDPU",
    "Jizzax politexnika instituti": "JizPI",
    "Navoiy davlat universiteti": "NavDU",
    "Navoiy davlat konchilik va texnologiyalar universiteti": "NavDKTU",
    "Berdaq nomidagi Qoraqalpoq davlat universiteti": "QorDU",
    "Nukus davlat texnika universiteti": "NukDTU",
    "Nukus davlat pedagogika instituti": "NukDPI",
    "Qoraqalpog'iston tibbiyot instituti": "QorTI",
    "Qoraqalpog'iston qishloq xo'jaligi va agrotexnologiyalar instituti": "QorQXAI",
    "Chirchiq davlat pedagogika universiteti": "ChirDPU",
    "Qo'qon davlat universiteti": "QoqDU",
    "Denov tadbirkorlik va pedagogika instituti": "DenTPI",
    "Akfa universiteti": "Akfa",
    "Alfraganus universiteti": "Alfraganus",
    "British Management University": "BMU",
    "Central Asian University": "CAU",
    "Digital University": "DigitalU",
    "IT Park University": "IT Park U",
    "PDP University": "PDP",
    "TEAM University": "TEAM",
    "TMC Institute": "TMC",
    "Tashkent International University of Education": "TIUE",
    "Koreya xalqaro universiteti": "KIU",
    "Turkiy davlatlar xalqaro universiteti": "TDXU",
    "Xalqaro Nordik universiteti": "NIU",
    "Zarmed universiteti": "Zarmed",
    "IMPULS BSR": "Impuls BSR",
    "Farmatsevtika texnik universiteti": "FTU",
    "O'zbekiston-Finlyandiya pedagogika instituti": "O'z-Fin PI",
    "Botir Zokirov nomidagi O'zbekiston milliy estrada san'ati instituti": "O'zMESI",
    "Kamoliddin Behzod nomidagi O'zbekiston milliy rassomlik va dizayn instituti": "O'zMRDI",
    "Yunus Rajabiy nomidagi O'zbek milliy musiqa san'ati instituti": "O'zMMSI",
}

PARENT_BASE = {
    "Toshkent davlat iqtisodiyot universiteti": "TDIU",
    "Toshkent axborot texnologiyalari universiteti": "TATU",
    "Toshkent davlat texnika universiteti": "TDTU",
    "Toshkent davlat tibbiyot universiteti": "TDTibbU",
    "Toshkent kimyo-texnologiya instituti": "TKTI",
    "O'zbekiston milliy universiteti": "O'zMU",
    "O'zbekiston davlat konservatoriyasi": "O'zDK",
    "O'zbekiston davlat san'at va madaniyat instituti": "O'zDSMI",
    "O'zbekiston davlat xoreografiya akademiyasi": "O'zDXA",
    "O'zbekiston davlat jismoniy tarbiya va sport universiteti": "O'zDJTSU",
    "Sharof Rashidov nomidagi Samarqand davlat universiteti": "SamDU",
    "Samarqand davlat veterinariya meditsinasi, chorvachilik va biotexnologiyalar universiteti": "SamDVMU",
    "Mirzo Ulug'bek nomidagi O'zbekiston milliy universiteti": "O'zMU",
}


def _normalize(name: str) -> str:
    return re.sub(r"\s+", " ", name.strip())


def _parent_and_branch(name: str, city: str) -> tuple[str | None, str | None]:
    lowered = name.lower()
    if " filiali" in lowered or " filial" in lowered or " fakulteti" in lowered:
        for parent, abbrev in sorted(PARENT_BASE.items(), key=lambda x: -len(x[0])):
            if name.startswith(parent) or parent in name:
                code = BRANCH_CODE.get(city)
                if "fakulteti" in lowered and city == "Zarafshon":
                    return abbrev, "ZF"
                return abbrev, code
        match = re.match(r"^(.+?)\s+(.+?)\s+(filiali|fakulteti)", name, re.I)
        if match:
            parent_part = match.group(1)
            for parent, abbrev in PARENT_BASE.items():
                if parent.startswith(parent_part[:20]) or parent_part in parent:
                    return abbrev, BRANCH_CODE.get(city)
    return None, None


def _regional_institute(name: str, city: str) -> str | None:
    prefix = None
    for city_name, city_abbr in sorted(CITY_PREFIX.items(), key=lambda x: -len(x[0])):
        if name.startswith(city_name) or f"{city_name} " in name:
            prefix = city_abbr
            break
    if not prefix and city in CITY_PREFIX:
        prefix = CITY_PREFIX[city]

    if not prefix:
        return None

    tail = name
    for city_name in CITY_PREFIX:
        if tail.startswith(city_name):
            tail = tail[len(city_name) :].strip()
            break

    tail_lower = tail.lower()
    if "iqtisodiyot va servis instituti" in tail_lower:
        return f"{prefix}ISI"
    if "chet tillari instituti" in tail_lower:
        return f"{prefix}DChTI"
    if "pedagogika instituti" in tail_lower or "pedagogika universiteti" in tail_lower:
        return f"{prefix}DPI" if "instituti" in tail_lower else f"{prefix}DPU"
    if "tibbiyot instituti" in tail_lower or "tibbiyot universiteti" in tail_lower:
        return f"{prefix}DTI" if "instituti" in tail_lower else f"{prefix}DTU"
    if "texnika instituti" in tail_lower or "texnika universiteti" in tail_lower:
        return f"{prefix}DTI" if "instituti" in tail_lower else f"{prefix}DTU"
    if "davlat universiteti" in tail_lower:
        return f"{prefix}DU"
    if "qishloq xo'jaligi" in tail_lower:
        return f"{prefix}QXAI"
    if "agroinnovatsiyalar" in tail_lower:
        return f"{prefix}AgroII"
    if "tadbirkorlik va pedagogika" in tail_lower:
        return f"{prefix}TPI"
    return None


def _english_brand(name: str) -> str | None:
    if re.match(r"^[A-Za-z0-9 .&'-]+$", name):
        words = name.split()
        if len(words) <= 3 and words[0][0].isupper():
            return name.replace(" University", "U").replace(" Institute", "I")[:20]
        acronym = "".join(w[0].upper() for w in words if w.lower() not in {"of", "the", "and", "in"})
        return acronym[:12] if acronym else name[:12]
    return None


def _foreign_branch(name: str) -> str | None:
    patterns = [
        (r"Mendeleev", "RHTU"),
        (r"Plehanov", "REU"),
        (r"Gubkin", "Gubkin"),
        (r"MEI milliy", "MEI"),
        (r"MMFI", "MEPhI"),
        (r"Lomonosov|Moskva davlat universiteti", "MSU"),
        (r"Pirogov", "RNIIMU"),
        (r"Pisa University", "PisaU"),
        (r"Gersen", "RGPU"),
        (r"Bauman", "BMSTU"),
        (r"VGIK|Gerasimov", "VGIK"),
        (r"Astraxan", "AstDTU"),
        (r"MISiS", "MISiS"),
        (r"Auezov", "Auezov"),
        (r"Belarus", "BelATKI"),
        (r"Collegium Humanum", "CHU"),
        (r"Sharda", "Sharda"),
        (r"Latviya", "ISMA"),
        (r"Qozon federal", "KFU"),
        (r"D\.I\. Mendeleev", "RHTU"),
    ]
    for pattern, abbrev in patterns:
        if re.search(pattern, name, re.I):
            city_code = ""
            if "filiali" in name.lower() or "filial" in name.lower():
                for city, code in BRANCH_CODE.items():
                    if city in name or city == "":  # use entry city later
                        pass
            return abbrev
    return None


def generate_short_name(name: str, city: str) -> str:
    name = _normalize(name)
    if name in MANUAL:
        return MANUAL[name]

    parent, branch = _parent_and_branch(name, city)
    if parent and branch:
        return f"{parent} {branch}"

    regional = _regional_institute(name, city)
    if regional:
        return regional

    foreign = _foreign_branch(name)
    if foreign:
        if "filiali" in name.lower() or "filial" in name.lower():
            code = BRANCH_CODE.get(city, "")
            return f"{foreign} {code}".strip() if code else foreign
        return foreign

    english = _english_brand(name)
    if english:
        return english

    if name.startswith("Toshkent ") and "davlat" in name.lower():
        rest = name.replace("Toshkent ", "").replace("davlat ", "")
        words = re.findall(r"[A-Za-zO''o'']+", rest)
        skip = {"va", "universiteti", "instituti", "akademiyasi"}
        letters = [w[0].upper() for w in words if w.lower() not in skip and len(w) > 1]
        return ("TD" + "".join(letters))[:12]

    if "universiteti" in name.lower() and not name.startswith("O'zbekiston"):
        words = re.findall(r"[A-Za-zO''o'']+", name)
        skip = {"universiteti", "instituti", "va", "nomidagi", "davlat", "xalqaro", "milliy"}
        letters = [w[0].upper() for w in words if w.lower() not in skip][:8]
        return "".join(letters) or name[:10]

    return name[:12]


def assign_all(entries: list[dict]) -> list[dict]:
    used: dict[str, int] = {}
    result = []
    for entry in entries:
        name = entry["name"]
        city = entry["city"]
        short = generate_short_name(name, city)
        if short in used:
            used[short] += 1
            short = f"{short}-{used[short]}"
        else:
            used[short] = 1
        result.append({**entry, "short_name": short})
    return result


def main():
    entries = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    enriched = assign_all(entries)
    dupes = [e["short_name"] for e in enriched]
    if len(dupes) != len(set(dupes)):
        from collections import Counter

        c = Counter(dupes)
        print("DUPLICATES:", [k for k, v in c.items() if v > 1])
    DATA_PATH.write_text(json.dumps(enriched, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {len(enriched)} entries with short_name")
    for sample in [
        "Toshkent davlat iqtisodiyot universiteti Samarqand filiali",
        "Samarqand iqtisodiyot va servis instituti",
    ]:
        match = next(e for e in enriched if e["name"] == sample)
        print(f"  {match['name'][:50]}... -> {match['short_name']}")


if __name__ == "__main__":
    main()
