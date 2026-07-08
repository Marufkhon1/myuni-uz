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
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")

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
    "drf_spectacular",
    "accounts",
    "universities",
]

_enable_channels = os.getenv("ENABLE_CHANNELS", "True") == "True"
if _enable_channels:
    INSTALLED_APPS.insert(0, "daphne")
    INSTALLED_APPS.append("channels")

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
ASGI_APPLICATION = "myuni.asgi.application"

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
            # Persistent connections cut handshake cost under gunicorn workers.
            "CONN_MAX_AGE": int(os.getenv("DB_CONN_MAX_AGE", "60")),
            "CONN_HEALTH_CHECKS": True,
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

# Auth throttle (login / register)
AUTH_LOGIN_WINDOW_SECONDS = int(os.getenv("AUTH_LOGIN_WINDOW_SECONDS", "3600"))
AUTH_LOGIN_MAX_PER_IP_HOUR = int(os.getenv("AUTH_LOGIN_MAX_PER_IP_HOUR", "40"))
AUTH_LOGIN_MAX_PER_KEY_HOUR = int(os.getenv("AUTH_LOGIN_MAX_PER_KEY_HOUR", "12"))
AUTH_LOGIN_FAILURE_THRESHOLD = int(os.getenv("AUTH_LOGIN_FAILURE_THRESHOLD", "5"))
AUTH_LOGIN_FAILURE_COOLDOWN = int(os.getenv("AUTH_LOGIN_FAILURE_COOLDOWN", "120"))
AUTH_REGISTER_MAX_PER_IP_HOUR = int(os.getenv("AUTH_REGISTER_MAX_PER_IP_HOUR", "15"))
AUTH_GOOGLE_START_MAX_PER_IP_HOUR = int(os.getenv("AUTH_GOOGLE_START_MAX_PER_IP_HOUR", "30"))
AUTH_GOOGLE_CALLBACK_MAX_PER_IP_HOUR = int(os.getenv("AUTH_GOOGLE_CALLBACK_MAX_PER_IP_HOUR", "20"))

# JWT in JSON body: on in DEBUG by default (Postman/tests), off in production.
_AUTH_TOKENS_BODY_DEFAULT = "True" if DEBUG else "False"
AUTH_RETURN_TOKENS_IN_BODY = (
    os.getenv("AUTH_RETURN_TOKENS_IN_BODY", _AUTH_TOKENS_BODY_DEFAULT) == "True"
)
AUTH_EXCHANGE_CODE_TTL_SECONDS = int(os.getenv("AUTH_EXCHANGE_CODE_TTL_SECONDS", "120"))

REVIEW_SUBMIT_WINDOW_SECONDS = int(os.getenv("REVIEW_SUBMIT_WINDOW_SECONDS", "3600"))
REVIEW_SUBMIT_FREE_ATTEMPTS = int(os.getenv("REVIEW_SUBMIT_FREE_ATTEMPTS", "3"))
REVIEW_SUBMIT_COOLDOWN = int(os.getenv("REVIEW_SUBMIT_COOLDOWN", "300"))
REVIEW_SUBMIT_MIN_INTERVAL = int(os.getenv("REVIEW_SUBMIT_MIN_INTERVAL", "45"))
REVIEW_SUBMIT_MAX_PER_USER_HOUR = int(os.getenv("REVIEW_SUBMIT_MAX_PER_USER_HOUR", "8"))
REVIEW_SUBMIT_MAX_PER_IP_HOUR = int(os.getenv("REVIEW_SUBMIT_MAX_PER_IP_HOUR", "15"))
REVIEW_SUBMIT_MAX_PER_SESSION_HOUR = int(os.getenv("REVIEW_SUBMIT_MAX_PER_SESSION_HOUR", "6"))
REVIEW_SUBMIT_SESSION_KEY = "review_submit_attempts"

# Production defaults ON (fail-closed). Local DEBUG stays OFF unless explicitly enabled.
_REVIEW_MODERATION_DEFAULT = "False" if DEBUG else "True"
REVIEW_MODERATION_ENABLED = (
    os.getenv("REVIEW_MODERATION_ENABLED", _REVIEW_MODERATION_DEFAULT) == "True"
)
REVIEW_MODERATOR_EMAILS = os.getenv("REVIEW_MODERATOR_EMAILS", "")

SUPPORT_MAX_PER_IP_HOUR = int(os.getenv("SUPPORT_MAX_PER_IP_HOUR", "10"))
SUPPORT_MAX_PER_SESSION_HOUR = int(os.getenv("SUPPORT_MAX_PER_SESSION_HOUR", "5"))
SUPPORT_WINDOW_SECONDS = int(os.getenv("SUPPORT_WINDOW_SECONDS", "3600"))
SUPPORT_SESSION_KEY = "support_attempts"

STREAM_TOKEN_TTL_SECONDS = int(os.getenv("STREAM_TOKEN_TTL_SECONDS", "300"))
JWT_ACCESS_COOKIE_MAX_AGE = int(os.getenv("JWT_ACCESS_COOKIE_MAX_AGE", "3600"))
JWT_REFRESH_COOKIE_MAX_AGE = int(os.getenv("JWT_REFRESH_COOKIE_MAX_AGE", "604800"))

WEB_PUSH_VAPID_PUBLIC_KEY = os.getenv("WEB_PUSH_VAPID_PUBLIC_KEY", "")
WEB_PUSH_VAPID_PRIVATE_KEY = os.getenv("WEB_PUSH_VAPID_PRIVATE_KEY", "")
WEB_PUSH_VAPID_CLAIMS = {
    "sub": os.getenv("WEB_PUSH_VAPID_SUBJECT", "mailto:hello@myuni.uz"),
}

from myuni.cache_config import configure_caches_and_channels, verify_redis_connectivity

_redis_url = os.getenv("REDIS_URL", "").strip()
_redis_ignore_exceptions_env = os.getenv("REDIS_IGNORE_EXCEPTIONS", "").strip()
_redis_ignore_exceptions = (
    _redis_ignore_exceptions_env == "True"
    if _redis_ignore_exceptions_env
    else None
)

CACHES, _channel_layers = configure_caches_and_channels(
    debug=DEBUG,
    redis_url=_redis_url,
    enable_channels=_enable_channels,
    ignore_exceptions=_redis_ignore_exceptions,
)
if _channel_layers is not None:
    CHANNEL_LAYERS = _channel_layers

# Production boot check — bad Redis URL must fail closed (not LocMem fallback).
if not DEBUG and _redis_url and os.getenv("REDIS_SKIP_PING", "False") != "True":
    verify_redis_connectivity(_redis_url)

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "accounts.authentication.CookieJWTAuthentication",
        "accounts.authentication.PresenceJWTAuthentication",
    ],
    "DEFAULT_THROTTLE_RATES": {
        # /api/public/* — scrape / DDoS budget (override via env below)
        "public": os.getenv("PUBLIC_THROTTLE_RATE", "300/hour"),
        "public_heavy": os.getenv("PUBLIC_HEAVY_THROTTLE_RATE", "120/hour"),
        "public_stats": os.getenv("PUBLIC_STATS_THROTTLE_RATE", "60/hour"),
    },
}

# Public response cache (Redis in prod / LocMem in DEBUG without REDIS_URL).
PUBLIC_API_CACHE_ENABLED = os.getenv("PUBLIC_API_CACHE_ENABLED", "True") == "True"
PUBLIC_CACHE_TTL_STATS = int(os.getenv("PUBLIC_CACHE_TTL_STATS", "300"))
PUBLIC_CACHE_TTL_LANDING = int(os.getenv("PUBLIC_CACHE_TTL_LANDING", "120"))
PUBLIC_CACHE_TTL_TOP = int(os.getenv("PUBLIC_CACHE_TTL_TOP", "300"))
PUBLIC_CACHE_TTL_FEATURED = int(os.getenv("PUBLIC_CACHE_TTL_FEATURED", "300"))
PUBLIC_CACHE_TTL_FILTERS = int(os.getenv("PUBLIC_CACHE_TTL_FILTERS", "600"))
PUBLIC_CACHE_TTL_CATALOG = int(os.getenv("PUBLIC_CACHE_TTL_CATALOG", "180"))
PUBLIC_CACHE_TTL_DETAIL = int(os.getenv("PUBLIC_CACHE_TTL_DETAIL", "180"))
PUBLIC_CACHE_TTL_ARTICLES = int(os.getenv("PUBLIC_CACHE_TTL_ARTICLES", "600"))
PUBLIC_CACHE_TTL_FAQ = int(os.getenv("PUBLIC_CACHE_TTL_FAQ", "600"))
PUBLIC_CACHE_TTL_RECENT = int(os.getenv("PUBLIC_CACHE_TTL_RECENT", "90"))
PUBLIC_CACHE_TTL_COMPARE = int(os.getenv("PUBLIC_CACHE_TTL_COMPARE", "300"))
PUBLIC_CACHE_TTL_COMPARE_SHARE = int(os.getenv("PUBLIC_CACHE_TTL_COMPARE_SHARE", "60"))
PUBLIC_CACHE_TTL_SITEMAP = int(os.getenv("PUBLIC_CACHE_TTL_SITEMAP", "3600"))
PUBLIC_CACHE_TTL_SHARE_PREVIEW = int(os.getenv("PUBLIC_CACHE_TTL_SHARE_PREVIEW", "300"))
PUBLIC_CACHE_BROWSER_MAX_AGE = int(os.getenv("PUBLIC_CACHE_BROWSER_MAX_AGE", "60"))

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

# SPA cookie-JWT CSRF (Origin/Referer checks on unsafe methods).
CSRF_TRUSTED_ORIGINS = list(
    dict.fromkeys(
        [
            *[origin for origin in CORS_ALLOWED_ORIGINS if origin.startswith("http")],
            *[
                origin.strip()
                for origin in os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",")
                if origin.strip()
            ],
            FRONTEND_URL,
        ]
    )
)
# Readable by JS for X-CSRFToken double-submit (must stay False).
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = "Lax"

# Mahalliy tarmoq (telefon, boshqa kompyuter): DEBUG + DJANGO_ALLOW_LAN=True
if DEBUG and os.getenv("DJANGO_ALLOW_LAN", "False") == "True":
    ALLOWED_HOSTS = ["*"]
    CORS_ALLOWED_ORIGIN_REGEXES = [
        r"^https?://127\.0\.0\.1(:\d+)?$",
        r"^https?://localhost(:\d+)?$",
        r"^https?://192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$",
        r"^https?://10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$",
    ]

ENABLE_API_DOCS = os.getenv("ENABLE_API_DOCS", "False") == "True"

SPECTACULAR_SETTINGS = {
    "TITLE": "MyUni.uz API",
    "DESCRIPTION": "Universitetlar, sharhlar, chat va autentifikatsiya REST API.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
    "SCHEMA_PATH_PREFIX": r"/api/",
    "AUTHENTICATION_WHITELIST": ["accounts.authentication.CookieJWTAuthentication"],
    "TAGS": [
        {"name": "auth", "description": "Ro'yxatdan o'tish, login, profil"},
        {"name": "universities", "description": "Universitetlar va sharhlar"},
        {"name": "chat", "description": "Guruh va shaxsiy chat"},
        {"name": "public", "description": "Ochiq (authsiz) endpointlar"},
    ],
}

from myuni.observability import init_sentry

init_sentry(debug=DEBUG)
