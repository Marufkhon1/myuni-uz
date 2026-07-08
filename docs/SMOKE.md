# MyUni — STEP 9 final smoke checklist

Bugungi ship gate. Hammasi yashil bo‘lsa — “tugadi”.

## 1. Unit / API (server kerak emas)

```bash
cd backend
python manage.py test accounts.tests.test_login accounts.tests.test_register accounts.tests.test_cookie_csrf accounts.tests.test_campus_and_google_limits universities.tests.test_compare universities.tests.test_compare_share universities.tests.test_review_quality universities.tests.test_public_cache_throttle universities.tests.test_tuition_honesty universities.tests.test_published_tuition
```

```bash
cd frontend
npm test
```

## 2. Live API smoke (`:8000` + `:5173`)

```bash
cd backend
python scripts/site_integration_check.py
```

Majburiy PASS: `2.1-register-*`, `2.3-login-ok`, `2.3-me-cookie`, `3.13-create-review`, `1.9-public-compare`, `3.14-compare`, `3.15-compare-share`.

## 3. Playwright e2e

```bash
cd frontend
npm run smoke:e2e
```

Majburiy: **M2** signup UI, **M3** login, **M9** compare 2 OTM, **M10** review, **K6** applicant, **K7** guest compare, **M5** bottom nav 5.

## 4. Bir buyruq

```bash
cd frontend
npm run smoke
```

(API smoke + e2e; serverlar oldindan ishlayotgan bo‘lishi mumkin.)
