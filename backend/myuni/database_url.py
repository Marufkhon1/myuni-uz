"""Parse DATABASE_URL for PostgreSQL or MySQL (Turon shared hosting)."""

from __future__ import annotations

from urllib.parse import urlparse

ENGINE_BY_SCHEME = {
    "postgresql": "django.db.backends.postgresql",
    "postgres": "django.db.backends.postgresql",
    "mysql": "django.db.backends.mysql",
    "mariadb": "django.db.backends.mysql",
}

DEFAULT_PORT = {
    "django.db.backends.postgresql": 5432,
    "django.db.backends.mysql": 3306,
}


def database_config_from_url(database_url: str) -> dict:
    parsed = urlparse(database_url)
    scheme = (parsed.scheme or "").split("+", 1)[0].lower()
    engine = ENGINE_BY_SCHEME.get(scheme)
    if not engine:
        raise ValueError(
            f"Unsupported DATABASE_URL scheme '{scheme}'. "
            "Use postgresql:// or mysql:// (Turon Master → MySQL)."
        )

    if engine == "django.db.backends.mysql":
        try:
            import pymysql

            pymysql.install_as_MySQLdb()
        except ImportError as exc:
            raise ImportError(
                "MySQL requires PyMySQL. pip install PyMySQL"
            ) from exc

    config = {
        "ENGINE": engine,
        "NAME": parsed.path.lstrip("/"),
        "USER": parsed.username or "",
        "PASSWORD": parsed.password or "",
        "HOST": parsed.hostname or "localhost",
        "PORT": parsed.port or DEFAULT_PORT[engine],
        "CONN_MAX_AGE": int(__import__("os").getenv("DB_CONN_MAX_AGE", "60")),
        "CONN_HEALTH_CHECKS": True,
    }
    if engine == "django.db.backends.mysql":
        config["OPTIONS"] = {
            "charset": "utf8mb4",
            "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
        }
    return config
