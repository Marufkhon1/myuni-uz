#!/bin/bash
# Turon Master — bitta buyruq (SSH):
#   cd ~/www/myuni.uz && bash deploy/turon/install.sh
#
# Oldin: backend/.env tayyor bo'lishi kerak
#   cp deploy/turon/production.env backend/.env

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

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

venv_ready() {
  [[ -f .venv/bin/activate ]] && { [[ -x .venv/bin/python ]] || [[ -x .venv/bin/python3 ]]; }
}

create_venv() {
  rm -rf .venv

  echo "    virtualenv (--user) — Turon shared hosting"
  if ! "$PYTHON" -m pip --version >/dev/null 2>&1; then
    echo "XATO: pip topilmadi ($PYTHON -m pip)"
    exit 1
  fi
  "$PYTHON" -m pip install --user -U virtualenv pip
  export PATH="${HOME}/.local/bin:${PATH}"
  if command -v virtualenv >/dev/null 2>&1; then
    virtualenv -p "$PYTHON" .venv
  else
    "$PYTHON" -m virtualenv -p "$PYTHON" .venv
  fi

  if venv_ready; then
    return 0
  fi
  rm -rf .venv

  echo "    zaxira: venv --without-pip + get-pip.py"
  if "$PYTHON" -m venv --without-pip .venv 2>/dev/null && venv_ready; then
    # shellcheck disable=SC1091
    source .venv/bin/activate
    curl -fsSL https://bootstrap.pypa.io/get-pip.py | python
    deactivate
    return 0
  fi

  echo "XATO: .venv yaratib bo'lmadi"
  exit 1
}

if ! venv_ready; then
  create_venv
fi

if [[ ! -x .venv/bin/python && -x .venv/bin/python3 ]]; then
  ln -sf python3 .venv/bin/python
fi

# shellcheck disable=SC1091
source .venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q

echo "==> migrate + collectstatic"
python manage.py migrate --noinput
python manage.py createcachetable
python manage.py collectstatic --noinput

cd "$ROOT"
echo "==> server.py (venv shebang)"
VENV_PY="${ROOT}/backend/.venv/bin/python"
{
  printf '#!%s\n' "$VENV_PY"
  cat deploy/turon/server.py
} > server.py
chmod +x server.py
mkdir -p tmp
touch tmp/restart.txt

echo "==> frontend build"
cd frontend
if [[ -s "${HOME}/.nvm/nvm.sh" ]]; then
  # shellcheck disable=SC1091
  export NVM_DIR="${HOME}/.nvm"
  source "${NVM_DIR}/nvm.sh"
  nvm use 22 >/dev/null 2>&1 || nvm install 22
fi
npm ci --legacy-peer-deps

# Phase 4 fail-closed: HTML-first SSG required for release.
# Optional escape hatch for emergency: ALLOW_SPA_ONLY=1
if [[ "${ALLOW_SPA_ONLY:-0}" == "1" ]]; then
  echo "OGOHLANTIRISH: ALLOW_SPA_ONLY=1 — SEO ceiling past"
  PRERENDER_SKIP=1 npm run build
else
  echo "==> Phase 4 full SSG (fail-closed)"
  npx playwright install chromium
  PRERENDER_REQUIRE_API=1 CWV_SMOKE=1 npm run build
  node scripts/check-ssg-health.mjs
fi

if [[ ! -f dist/prerender-manifest.json && "${ALLOW_SPA_ONLY:-0}" != "1" ]]; then
  echo "XATO: SSG manifest yo'q"
  exit 1
fi

if [[ -f dist/spa.html ]]; then
  echo "    spa.html CSR fallback OK"
else
  echo "XATO: dist/spa.html yo'q"
  exit 1
fi

echo ""
echo "TAYYOR. Keyin:"
echo "  cd ~/www/myuni.uz/backend && source .venv/bin/activate && python manage.py createsuperuser"
echo "  Panel: Перезапустить (Python)"
echo "  Nginx: deploy/nginx-myuni.conf (Googlebot → static HTML, social → share-preview)"
