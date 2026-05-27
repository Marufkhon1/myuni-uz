# Gmail orqali MyUni parol tiklash (marufkhonmaxsudovich@gmail.com)

## Qisqa tushuncha

- **Yuboruvchi (SMTP):** `marufkhonmaxsudovich@gmail.com` — MyUni shu orqali xat yuboradi
- **Qabul qiluvchi:** har bir user o'z emaili (masalan `alisher88@gmail.com`)

---

## 1-qadam: Google Account ga kiring

1. Brauzerda oching: **https://myaccount.google.com**
2. `marufkhonmaxsudovich@gmail.com` bilan **kirish** qiling

---

## 2-qadam: Ikki bosqichli himoyani yoqing

1. Chap menyu: **Security** (Xavfsizlik)
2. **2-Step Verification** (Ikki bosqichli tasdiqlash) ni toping
3. **Turn on** / **Yoqish** bosing
4. Telefon raqamingizni tasdiqlang (SMS kod)

> App Password faqat 2FA yoqilganda paydo bo'ladi.

---

## 3-qadam: App Password (ilova paroli) oling

1. Yana **Security** sahifasida qoling
2. Qidiring: **App passwords** yoki **Ilova parollari**
   - Ko'rinmasa: https://myaccount.google.com/apppasswords
3. **Select app** → **Mail** (yoki **Other** → nom: `MyUni`)
4. **Select device** → **Windows Computer** (yoki Other)
5. **Generate** bosing
6. Ekranda **16 belgili parol** chiqadi (masalan: `abcd efgh ijkl mnop`)
7. Uni **nusxalab oling** — keyin qayta ko'rsatilmaydi

---

## 4-qadam: `backend/.env` ga yozing

`c:\Users\User\Desktop\DBM\backend\.env` faylini oching:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=marufkhonmaxsudovich@gmail.com
EMAIL_HOST_PASSWORD=abcdefghijklmnop
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=marufkhonmaxsudovich@gmail.com
```

- `EMAIL_HOST_PASSWORD` — 3-qadamdagi 16 belgi (**bo'shliqsiz**, masalan `abcdefghijklmnop`)
- Boshqa qatorlar yuqoridagidek qolsin

---

## 5-qadam: Backendni qayta ishga tushiring

```powershell
cd c:\Users\User\Desktop\DBM\backend
.\.venv\Scripts\Activate.ps1
python manage.py runserver 127.0.0.1:8000
```

---

## 6-qadam: Sinov

1. Frontend: `npm run dev`
2. `/forgot-password` → test user email (ro'yxatdan o'tgan)
3. Gmail (user emaili) — spam ham tekshiring
4. «Parolni tiklash» havolasi

---

## Muammo bo'lsa

| Muammo | Yechim |
|--------|--------|
| App passwords yo'q | 2FA yoqing |
| 535 / Authentication failed | App Password noto'g'ri, bo'shliqsiz yozing |
| Xat kelmaydi | Email ro'yxatdan o'tganmi, spam papkasi |
| Email yuborilmadi (503) | `.env` saqlanganmi, server qayta ishga tushirilganmi |
