"""
Turon Cloud / ISPmanager — myuni.uz Python handler entry (Путь к серверу: server.py).

Sayt papkasiga qo'ying (odatda www/myuni.uz/):
  server.py
  backend/
  frontend/

Panel: Python 3.12, «Веб-сервер Python», socket file.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

SITE_ROOT = Path(__file__).resolve().parent
BACKEND_DIR = SITE_ROOT / "backend"
VENV_DIR = BACKEND_DIR / ".venv"

if not BACKEND_DIR.is_dir():
    raise RuntimeError(f"backend papka topilmadi: {BACKEND_DIR}")

# Turon panel Python odatda tizim interpreteridan ishlaydi — venv paketlarini ulaymiz.
if VENV_DIR.is_dir():
    for site_packages in sorted((VENV_DIR / "lib").glob("python*/site-packages"), reverse=True):
        if site_packages.is_dir():
            sys.path.insert(0, str(site_packages))
            break

env_file = BACKEND_DIR / ".env"
if env_file.is_file():
    try:
        from dotenv import load_dotenv

        load_dotenv(env_file)
    except ImportError:
        pass

sys.path.insert(0, str(BACKEND_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myuni.settings")

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
