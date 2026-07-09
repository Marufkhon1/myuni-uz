#!/bin/bash
# Turon Master — serverda bir marta ishga tushiring (SSH):
#   cd /www/myuni.uz && bash deploy/turon/bootstrap-server.sh

set -euo pipefail
cd "$(dirname "$0")/../.."

echo "==> server.py"
cp -f deploy/turon/server.py ./server.py

echo "==> backend/.env (agar mavjud bo'lmasa)"
if [[ ! -f backend/.env ]]; then
  cp deploy/turon/production.env.example backend/.env
  echo "    backend/.env yaratildi — GOOGLE va EMAIL kalitlarini to'ldiring!"
else
  echo "    backend/.env allaqachon bor, o'zgartirilmadi."
fi

echo "==> frontend/.env.production"
cp -f deploy/turon/frontend.env.production frontend/.env.production

echo "==> venv + pip"
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "==> migrate + collectstatic"
python manage.py migrate --noinput
python manage.py collectstatic --noinput

echo ""
echo "Tayyor. Keyin: python manage.py createsuperuser"
echo "Frontend: cd ../frontend && npm ci --legacy-peer-deps && npm run build"
echo "Panel: Перезапустить (Python)"
