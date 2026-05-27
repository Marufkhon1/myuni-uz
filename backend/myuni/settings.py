import os
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

_DEV_SECRET_KEY = "dev-only-secret-key-min-32-chars-long"
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", _DEV_SECRET_KEY)
DEBUG = os.getenv("DJANGO_DEBUG", "True") == "True"
SERVE_MEDIA = os.getenv("SERVE_MEDIA", "True") == "True"

if not DEBUG:
    if SECRET_KEY in (_DEV_SECRET_KEY, "development-only-secret-key", "change-me"):
        raise ValueError("DJANGO_SECRET_KEY must be set when DJANGO_DEBUG=False")
    if len(SECRET_KEY) < 32:
        raise ValueError("DJANGO_SECRET_KEY must be at least 32 characters in production")
ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
    if host.strip()
]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "accounts",
    "universities",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "myuni.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "myuni.wsgi.application"

database_url = os.getenv("DATABASE_URL")
if database_url:
    parsed_database = urlparse(database_url)
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": parsed_database.path.lstrip("/"),
            "USER": parsed_database.username,
            "PASSWORD": parsed_database.password,
            "HOST": parsed_database.hostname,
            "PORT": parsed_database.port or 5432,
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Tashkent"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

_email_backend = os.getenv("EMAIL_BACKEND", "").strip()
_email_host = os.getenv("EMAIL_HOST", "").strip()
if _email_backend:
    EMAIL_BACKEND = _email_backend
elif os.getenv("EMAIL_USE_FILE", "False") == "True":
    EMAIL_BACKEND = "django.core.mail.backends.filebased.EmailBackend"
    EMAIL_FILE_PATH = BASE_DIR / "sent_emails"
    EMAIL_FILE_PATH.mkdir(parents=True, exist_ok=True)
elif _email_host:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

EMAIL_HOST = _email_host
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True") == "True"
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "noreply@myuni.uz")

PASSWORD_RESET_TIMEOUT = int(os.getenv("PASSWORD_RESET_TIMEOUT", "1800"))
PASSWORD_RESET_EMAIL_COOLDOWN = int(os.getenv("PASSWORD_RESET_EMAIL_COOLDOWN", "1800"))
PASSWORD_RESET_FREE_ATTEMPTS = int(os.getenv("PASSWORD_RESET_FREE_ATTEMPTS", "2"))
PASSWORD_RESET_MAX_PER_EMAIL_HOUR = int(os.getenv("PASSWORD_RESET_MAX_PER_EMAIL_HOUR", "10"))
PASSWORD_RESET_MAX_PER_IP_HOUR = int(os.getenv("PASSWORD_RESET_MAX_PER_IP_HOUR", "10"))
PASSWORD_RESET_MAX_PER_SESSION_HOUR = int(os.getenv("PASSWORD_RESET_MAX_PER_SESSION_HOUR", "5"))
PASSWORD_RESET_WINDOW_SECONDS = int(os.getenv("PASSWORD_RESET_WINDOW_SECONDS", "3600"))
PASSWORD_RESET_SESSION_KEY = "password_reset_attempts"

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "myuni-cache",
    }
}

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
}

if not DEBUG:
    REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = [
        "rest_framework.renderers.JSONRenderer",
    ]
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = os.getenv("SECURE_SSL_REDIRECT", "False") == "True"
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = "DENY"

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGIN",
        "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174",
    ).split(",")
    if origin.strip()
]

# Mahalliy tarmoq (telefon, boshqa kompyuter): DEBUG + DJANGO_ALLOW_LAN=True
if DEBUG and os.getenv("DJANGO_ALLOW_LAN", "False") == "True":
    ALLOWED_HOSTS = ["*"]
    CORS_ALLOWED_ORIGIN_REGEXES = [
        r"^https?://127\.0\.0\.1(:\d+)?$",
        r"^https?://localhost(:\d+)?$",
        r"^https?://192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$",
        r"^https?://10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$",
    ]
