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
FRONTEND_ORIGIN=https://myuni.uz,https://www.myuni.uz
FRONTEND_URL=https://myuni.uz
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
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt gunicorn
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn myuni.wsgi:application -b 127.0.0.1:8000 --workers 3
```

Media: `MEDIA_ROOT` uchun doimiy disk (`/var/www/myuni/media/`).

Nginx: `deploy/nginx-myuni.conf` ni `/etc/nginx/sites-available/myuni` ga moslashtiring, `certbot` bilan HTTPS.

## 4. Google OAuth

Google Cloud Console → Authorized redirect URI:

- `https://myuni.uz/api/auth/google/callback/`

Frontend origin: `https://myuni.uz`

## 5. Tekshiruv

```bash
cd backend && python manage.py test
cd frontend && npm run lint && npm test && npm run build
# Serverlar ishlayotganda:
python backend/scripts/site_integration_check.py
```

## 6. Mobil

Telefonda `https://myuni.uz` ochib: Chatlar, Sharhlar, Taqqoslash, Profil, qo‘llab-quvvatlash modali.

## Keyinroq (biznes)

- Sharh moderatsiyasi (Django admin)
- Email/push bildirishnomalar
- Universitet admin paneli
- Analytics (ko‘rishlar statistikasi)
