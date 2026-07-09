#!/bin/bash
# Turon Master — bitta buyruq (SSH):
#   cd ~/www/myuni.uz && bash deploy/turon/install.sh
#
# Oldin: backend/.env tayyor bo'lishi kerak
#   cp deploy/turon/production.env backend/.env

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "==> server.py"
cp -f deploy/turon/server.py ./server.py

if [[ ! -f backend/.env ]]; then
  if [[ -f deploy/turon/production.env ]]; then
    cp deploy/turon/production.env backend/.env
  else
    echo "XATO: backend/.env yo'q. production.env ni serverga yuklang:"
    echo "  cp deploy/turon/production.env backend/.env"
    exit 1
  fi
fi

echo "==> frontend .env.production"
cp -f deploy/turon/frontend.env.production frontend/.env.production

echo "==> backend venv + pip"
cd backend

PYTHON=""
for candidate in python3.12 python3.11 python3; do
  if command -v "$candidate" >/dev/null 2>&1; then
    PYTHON="$candidate"
    break
  fi
done
if [[ -z "$PYTHON" ]]; then
  echo "XATO: python3 topilmadi"
  exit 1
fi
echo "    Python: $($PYTHON --version)"

create_venv() {
  rm -rf .venv
  if "$PYTHON" -m venv .venv 2>/dev/null; then
    return 0
  fi
  echo "    ensurepip yo'q — --without-pip + get-pip.py"
  if "$PYTHON" -m venv --without-pip .venv; then
    # shellcheck disable=SC1091
    source .venv/bin/activate
    curl -fsSL https://bootstrap.pypa.io/get-pip.py | python
    deactivate
    return 0
  fi
  echo "    virtualenv (--user) sinab ko'rilmoqda"
  "$PYTHON" -m pip install --user virtualenv
  export PATH="${HOME}/.local/bin:${PATH}"
  virtualenv -p "$PYTHON" .venv
}

if [[ ! -x .venv/bin/python ]]; then
  create_venv
fi

# shellcheck disable=SC1091
source .venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q

echo "==> migrate + collectstatic"
python manage.py migrate --noinput
python manage.py collectstatic --noinput

echo "==> frontend build"
cd ../frontend
npm ci --legacy-peer-deps
npm run build

echo ""
echo "TAYYOR. Keyin:"
echo "  cd ~/www/myuni.uz/backend && source .venv/bin/activate && python manage.py createsuperuser"
echo "  Panel: Перезапустить (Python)"
