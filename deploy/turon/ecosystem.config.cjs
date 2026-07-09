/** PM2 — Turon socket (panel restart ishlamasa). */
module.exports = {
  apps: [
    {
      name: "myuni-uz",
      cwd: "/var/www/user372/data/www/myuni.uz/backend",
      script: ".venv/bin/gunicorn",
      args: [
        "myuni.wsgi:application",
        "--bind",
        "unix:/var/www/user372/data/python/0.sock",
        "--workers",
        "2",
        "--timeout",
        "120",
        "--umask",
        "000",
      ],
      interpreter: "none",
      autorestart: true,
      max_restarts: 20,
      env: {
        DJANGO_SETTINGS_MODULE: "myuni.settings",
      },
    },
  ],
};
