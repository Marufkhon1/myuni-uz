#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export DJANGO_SECRET_KEY="${DJANGO_SECRET_KEY:-ci-test-secret-key-at-least-32-characters-long}"
export DJANGO_DEBUG="${DJANGO_DEBUG:-True}"
python manage.py migrate --noinput
exec python manage.py runserver 127.0.0.1:8000
