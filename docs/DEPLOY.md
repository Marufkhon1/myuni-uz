# MyUni.uz — production (myuni.uz)

## 1. Backend `.env`

`backend/.env` (`.env.example` dan nusxa oling):

```env
DJANGO_SECRET_KEY=<kamida-50-tasodifiy-belgi>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=myuni.uz,www.myuni.uz
SERVE_MEDIA=True
SECURE_SSL_REDIRECT=True
DATABASE_URL=postgresql://USER:PASS@localhost:5432/myuni
REDIS_URL=redis://127.0.0.1:6379/0
FRONTEND_ORIGIN=https://myuni.uz,https://www.myuni.uz
FRONTEND_URL=https://myuni.uz
# Optional extra CSRF origins (FRONTEND_ORIGIN + FRONTEND_URL already trusted)
# CSRF_TRUSTED_ORIGINS=https://myuni.uz,https://www.myuni.uz
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://myuni.uz/api/auth/google/callback/

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_HOST_USER=...
EMAIL_HOST_PASSWORD=...
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=noreply@myuni.uz

# Chat-bot → operator (ixtiyoriy)
TELEGRAM_BOT_TOKEN=
TELEGRAM_SUPPORT_CHAT_ID=
```

`DJANGO_SECRET_KEY` **kamida 32 belgi** bo‘lishi shart (`DEBUG=False` da tekshiriladi).

`REDIS_URL` **production da majburiy**. Bo‘lmasa Django boot `ImproperlyConfigured` bilan to‘xtaydi. Redis ishlatiladi:

- umumiy cache (rate limit, SSE stream token, auth exchange, **public API response cache**)
- Channels layer (WebSocket / chat — ko‘p worker bilan)

Lokal: `DJANGO_DEBUG=True` va `REDIS_URL` bo‘sh → LocMem + InMemory Channels (1-process OK).

**Public API (P0-2):** `/api/public/*` anon IP throttle (`public` 300/h, `public_heavy` 120/h, `public_stats` 60/h) + Redis/LocMem payload cache. Javoblarda `Cache-Control: public, max-age=…, s-maxage=…` va `X-MyUni-Cache: HIT|MISS`. Env: `PUBLIC_THROTTLE_*`, `PUBLIC_CACHE_TTL_*` (`.env.example`).

**Auth / trust (P1):** Google OAuth start/callback IP throttle (`AUTH_GOOGLE_START_MAX_PER_IP_HOUR=30`, `AUTH_GOOGLE_CALLBACK_MAX_PER_IP_HOUR=20`). Sharh badge: `campus_affiliated` (+ deprecated `is_verified_student` alias) → UI «Kampus ovozi».

**Tuition honesty (Outcomes MVP slice):** public/auth detail + catalog cards expose `tuition_honesty` (`disclaimer_kind`, badge, note, forms, `source_url` for curated HEIs). Top 20 flagship HEIs use `published_catalog` overlay (`universities/data/published_tuition_catalog.json` + migration `0041`). UI strip on university public page; compare row «Kontrakt (taxmin)». Methodology §7.

## 2. Frontend build `.env`

`frontend/.env.production`:

```env
VITE_API_BASE_URL=/api
VITE_GOOGLE_CLIENT_ID=<google-client-id>
VITE_SUPPORT_EMAIL=hello@myuni.uz
VITE_SUPPORT_PHONE=+998901234567
VITE_SUPPORT_PHONE_DISPLAY=+998 90 123 45 67
```

```bash
cd frontend && npm ci && npm run build
```

## 3. Server

```bash
# Redis (systemd yoki docker) ishlayotganini tekshiring
redis-cli ping   # PONG

cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt gunicorn
python manage.py migrate
# Profil OTM FK backfill (legacy CharField → university_ref)
python manage.py backfill_profile_university_ref
python manage.py collectstatic --noinput

# HTTP API (WSGI)
gunicorn myuni.wsgi:application -b 127.0.0.1:8000 --workers 3

# Real-time chat (ASGI + Channels). ENABLE_CHANNELS=True (default).
# Daphne yoki uvicorn — REDIS_URL orqali channel layer ulanadi.
# daphne -b 127.0.0.1 -p 8001 myuni.asgi:application
```

**Scale asoslari**

| Komponent | Production | Izoh |
|-----------|------------|------|
| PostgreSQL | `DATABASE_URL` + `CONN_MAX_AGE` | Workerlar orasida persistent DB connection |
| Redis | `REDIS_URL` majburiy | Cache + Channels + public API payload cache — LocMem multi-worker da ishlamaydi |
| Sessions | DB (default) | Cookie JWT asosiy; `csrftoken` + `X-CSRFToken` double-submit |
| Gunicorn workers | ≥2 | Redis bo‘lmasa rate-limit/SSE tokenlar jarayon ichida |
| ASGI | Daphne/uvicorn | WebSocket; InMemory channel layer multi-worker da xabar yetkazmaydi |

Media: `MEDIA_ROOT` uchun doimiy disk (`/var/www/myuni/media/`).

Nginx: `deploy/nginx-myuni.conf` ni `/etc/nginx/sites-available/myuni` ga moslashtiring, `certbot` bilan HTTPS.

## 4. Google OAuth

Google Cloud Console → Authorized redirect URI:

- `https://myuni.uz/api/auth/google/callback/`

Frontend origin: `https://myuni.uz`

## 5. Tekshiruv (STEP 9 — final smoke)

| Flow | Unit/API | Live API smoke | Playwright e2e |
|------|----------|----------------|----------------|
| Login | `accounts.tests.test_login` | `2.3-login-ok`, `2.3-me-cookie` | M3, K6 |
| Register | `accounts.tests.test_register` | `2.1-register-*` + `university_id` | M2 (UI), K6 |
| Review | `test_review_*` | `3.13-create-review` | M10 |
| Compare | `test_compare*` | `1.9` / `3.14–3.16` | M9, K7 |

```bash
# 1) Self-contained (server kerak emas)
cd backend && python manage.py test accounts.tests.test_login accounts.tests.test_register universities.tests.test_compare universities.tests.test_compare_share

# 2) Live API smoke — backend :8000 + frontend :5173 ishlashi shart
cd backend && python scripts/site_integration_check.py
# yoki: cd frontend && npm run smoke:api

# 3) Brauzer e2e (lokalda serverlar ochiq bo'lsa reuse qiladi)
cd frontend && npm run smoke:e2e
# yoki to'liq: npm run smoke
```

CI: `frontend` job (lint/unit/build) + `e2e` job (Playwright) + API smoke step.
## 6. Mobil

Telefonda `https://myuni.uz` ochib: Chatlar, Sharhlar, Taqqoslash, Profil, qo‘llab-quvvatlash modali.

## Keyinroq (biznes)

- Sharh moderatsiyasi (Django admin)
- Email/push bildirishnomalar
- Universitet admin paneli
- Analytics (ko‘rishlar statistikasi)
