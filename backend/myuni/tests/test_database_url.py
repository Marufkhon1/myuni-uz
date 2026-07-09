from django.test import SimpleTestCase

from myuni.database_url import database_config_from_url


class DatabaseUrlTests(SimpleTestCase):
    def test_postgresql_url(self):
        config = database_config_from_url(
            "postgresql://user:pass@dbhost:5432/myuni"
        )
        self.assertEqual(config["ENGINE"], "django.db.backends.postgresql")
        self.assertEqual(config["PORT"], 5432)
        self.assertEqual(config["NAME"], "myuni")

    def test_mysql_url(self):
        config = database_config_from_url("mysql://myuni_user:secret@localhost:3306/myuni")
        self.assertEqual(config["ENGINE"], "django.db.backends.mysql")
        self.assertEqual(config["PORT"], 3306)
        self.assertEqual(config["OPTIONS"]["charset"], "utf8mb4")
