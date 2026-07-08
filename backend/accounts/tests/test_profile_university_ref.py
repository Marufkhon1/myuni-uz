from django.core.exceptions import ImproperlyConfigured
from django.core.management import call_command
from django.test import SimpleTestCase, TestCase
from io import StringIO
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import Profile
from accounts.university_resolution import apply_university_to_profile, resolve_university_by_text
from django.contrib.auth import get_user_model
from myuni.cache_config import configure_caches_and_channels
from universities.models import University
from universities.review_trust_utils import is_verified_student_user

User = get_user_model()


class CacheConfigTests(SimpleTestCase):
    def test_prod_requires_redis_url(self):
        with self.assertRaises(ImproperlyConfigured):
            configure_caches_and_channels(
                debug=False,
                redis_url="",
                enable_channels=True,
            )

    def test_dev_allows_locmem_without_redis(self):
        caches, channels = configure_caches_and_channels(
            debug=True,
            redis_url="",
            enable_channels=True,
        )
        self.assertIn("locmem", caches["default"]["BACKEND"].lower())
        self.assertIn("InMemory", channels["default"]["BACKEND"])

    def test_prod_redis_does_not_ignore_exceptions_by_default(self):
        caches, channels = configure_caches_and_channels(
            debug=False,
            redis_url="redis://127.0.0.1:6379/15",
            enable_channels=True,
        )
        self.assertFalse(caches["default"]["OPTIONS"]["IGNORE_EXCEPTIONS"])
        self.assertIn("RedisChannelLayer", channels["default"]["BACKEND"])


class ProfileUniversityRefTests(TestCase):
    def setUp(self):
        self.university = University.objects.create(
            name="FK Prep University",
            short_name="FKPU",
            location="Toshkent",
            founded_year=2001,
        )
        self.client = APIClient()

    def test_register_with_university_id_sets_fk(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "FK Talaba",
                "username": "fk_student",
                "email": "fk.student@uni.test",
                "password": "SecurePass123!",
                "role": "student",
                "university": self.university.name,
                "university_id": self.university.id,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.data)
        user = User.objects.get(username="fk_student")
        self.assertEqual(user.profile.university_ref_id, self.university.id)
        self.assertEqual(user.profile.university, self.university.name)
        self.assertEqual(response.data["user"]["profile"]["university_id"], self.university.id)

    def test_register_rejects_bad_university_id(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "Bad Id",
                "username": "bad_uni_id",
                "email": "bad.uni@uni.test",
                "password": "SecurePass123!",
                "role": "applicant",
                "university": self.university.name,
                "university_id": 999999,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("university_id", response.data)

    def test_me_patch_dual_write_university_id(self):
        user = User.objects.create_user(
            username="patch_uni",
            email="patch.uni@uni.test",
            password="SecurePass123!",
        )
        Profile.objects.create(user=user, full_name="Patch Uni", role=Profile.Role.STUDENT)
        token = str(RefreshToken.for_user(user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.patch(
            "/api/auth/me/",
            {"university_id": self.university.id},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.data)
        user.profile.refresh_from_db()
        self.assertEqual(user.profile.university_ref_id, self.university.id)
        self.assertEqual(user.profile.university, self.university.name)

    def test_backfill_command_links_exact_name(self):
        user = User.objects.create_user(
            username="backfill_u",
            email="backfill@uni.test",
            password="SecurePass123!",
        )
        profile = Profile.objects.create(
            user=user,
            full_name="Backfill",
            role=Profile.Role.STUDENT,
            university=self.university.name,
        )
        out = StringIO()
        call_command("backfill_profile_university_ref", stdout=out)
        profile.refresh_from_db()
        self.assertEqual(profile.university_ref_id, self.university.id)
        self.assertIn("matched=1", out.getvalue())

    def test_resolve_exact_short_name(self):
        self.assertEqual(
            resolve_university_by_text("FKPU").id,
            self.university.id,
        )

    def test_verified_student_prefers_fk(self):
        user = User.objects.create_user(
            username="trust_fk",
            email="trust.fk@uni.test",
            password="SecurePass123!",
        )
        profile = Profile.objects.create(
            user=user,
            full_name="Trust FK",
            role=Profile.Role.STUDENT,
            university="Noto'g'ri matn",
            university_ref=self.university,
        )
        self.assertTrue(is_verified_student_user(user, self.university.id))
        other = University.objects.create(
            name="Other FK Uni",
            short_name="OFU",
            location="Samarqand",
            founded_year=1999,
        )
        self.assertFalse(is_verified_student_user(user, other.id))
        # Legacy text path when FK is null
        profile.university_ref = None
        profile.university = self.university.name
        profile.save(update_fields=["university_ref", "university"])
        self.assertTrue(is_verified_student_user(user, self.university.id))

    def test_apply_clears_when_empty_text(self):
        user = User.objects.create_user(
            username="clear_uni",
            email="clear.uni@uni.test",
            password="SecurePass123!",
        )
        profile = Profile.objects.create(
            user=user,
            full_name="Clear",
            role=Profile.Role.APPLICANT,
            university=self.university.name,
            university_ref=self.university,
        )
        apply_university_to_profile(profile, university_text="")
        self.assertEqual(profile.university, "")
        self.assertIsNone(profile.university_ref)
