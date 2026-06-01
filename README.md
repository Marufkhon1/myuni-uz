# MyUni.uz

O'zbekiston universitetlari uchun talaba sharhlari, reyting va chat platformasi.

## Imkoniyatlar

- Landing sahifa (API dan top universitetlar va sharhlar)
- Ro'yxatdan o'tish / kirish (email + Google OAuth)
- Student va Abituriyent rollari
- Universitet guruh chatlari va shaxsiy xabarlar
- Sharhlar, like, mashhur sharhlar
- Profil rasmi va ko'rinish sozlamalari
- Abituriyent: sevimli universitetlar, taqqoslash
- Parolni tiklash (email)
- Xabarni tahrirlash / o'chirish, yozmoqda indikatori, SSE yangilanish

## Ishga tushirish

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
.\manage.ps1 runserver 127.0.0.1:8000
```

Windows da `python manage.py` o'rniga `.\manage.ps1` ishlatish tavsiya etiladi — u avtomatik `.venv` dan foydalanadi.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Brauzer: `http://127.0.0.1:5173` (Vite `/api` va `/media` ni backendga proxy qiladi).

## Muhit o'zgaruvchilari

`backend/.env`:

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `DJANGO_SECRET_KEY` | Production uchun majburiy |
| `FRONTEND_URL` | OAuth qaytish URL (masalan `http://127.0.0.1:5173`) |
| `FRONTEND_ORIGIN` | CORS (vergul bilan) |
| `GOOGLE_CLIENT_ID` | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `GOOGLE_REDIRECT_URI` | `http://127.0.0.1:8000/api/auth/google/callback/` |
| `EMAIL_HOST` | Parol tiklash (SMTP; bo'sh = terminalga yoziladi) |
| `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` | Gmail App Password yoki SMTP login |
| `EMAIL_USE_FILE` | `True` — dev: xatlar `backend/sent_emails/` ga |

Google OAuth sozlanmagan bo'lsa, API `503` va `code: google_oauth_not_configured` qaytaradi.

## API

- `GET /api/public/universities/top/` — landing (ochiq)
- `GET /api/public/reviews/recent/` — landing (ochiq)
- `POST /api/auth/password-reset/` — parol tiklash so'rovi
- `POST /api/auth/password-reset/confirm/` — yangi parol
- `GET /api/universities/{id}/messages/stream/` — SSE (token query param)

Batafsil endpointlar Django admin va `universities/urls.py`, `accounts/urls.py` da.

## Production

Batafsil: [docs/DEPLOY.md](docs/DEPLOY.md) (myuni.uz, nginx, HTTPS, SMTP, Google OAuth, Telegram qo'llab-quvvatlash).

- PostgreSQL: `DATABASE_URL`
- `DJANGO_SECRET_KEY` — kamida **32 belgi**, `DEBUG=False`
- `DJANGO_ALLOWED_HOSTS`, HTTPS (`deploy/nginx-myuni.conf`)
- Media fayllar uchun doimiy disk
- Frontend: `frontend/.env.production.example`

## CI

GitHub Actions: `.github/workflows/ci.yml` — backend test, frontend lint/test/build.
