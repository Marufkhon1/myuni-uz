#!/bin/bash
# Turon: nginx kutadigan unix socket orqali gunicorn ishga tushirish.
# Panel "Перезапустить" ishlamasa ham sayt ishlaydi.
#
#   cd ~/www/myuni.uz && bash deploy/turon/start-socket.sh
#   pm2 start deploy/turon/ecosystem.config.cjs
#   pm2 save

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SOCKET_DIR="/var/www/user372/data/python"
SOCKET="${SOCKET_DIR}/0.sock"
VENV_GUNICORN="${ROOT}/backend/.venv/bin/gunicorn"

if [[ ! -x "$VENV_GUNICORN" ]]; then
  echo "XATO: gunicorn topilmadi. Avval: cd backend && source .venv/bin/activate && pip install -r requirements.txt"
  exit 1
fi

mkdir -p "$SOCKET_DIR"
rm -f "$SOCKET"

cd "${ROOT}/backend"
export DJANGO_SETTINGS_MODULE=myuni.settings

echo "==> gunicorn -> unix:${SOCKET}"
exec "$VENV_GUNICORN" myuni.wsgi:application \
  --bind "unix:${SOCKET}" \
  --workers 2 \
  --timeout 120 \
  --umask 000 \
  --access-logfile - \
  --error-logfile -
