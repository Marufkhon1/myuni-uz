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

if not BACKEND_DIR.is_dir():
    raise RuntimeError(f"backend papka topilmadi: {BACKEND_DIR}")

sys.path.insert(0, str(BACKEND_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myuni.settings")

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
