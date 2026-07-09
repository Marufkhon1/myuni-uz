#!/bin/bash
# 502 tuzatish — server.py ga venv shebang qo'shadi
set -euo pipefail
cd "$(dirname "$0")/../.."
VENV_PY="$PWD/backend/.venv/bin/python"
if [[ ! -x "$VENV_PY" ]]; then
  echo "XATO: $VENV_PY topilmadi"
  exit 1
fi
{
  printf '#!%s\n' "$VENV_PY"
  cat deploy/turon/server.py
} > server.py
chmod +x server.py
mkdir -p tmp
touch tmp/restart.txt
echo "Tayyor: server.py -> $VENV_PY"
head -1 server.py
