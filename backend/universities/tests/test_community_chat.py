from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import Notification
from universities.models import ChatMembership, ChatMessage, FAQItem, University, UserBlock, UserMute

User = get_user_model()


class CommunityChatTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.university = University.objects.create(
            name="Community University",
            short_name="CU",
            location="Toshkent",
        )
        self.member = User.objects.create_user(
            username="member2@test.com",
            email="member2@test.com",
            password="test-pass-123",
        )
        self.other_member = User.objects.create_user(
            username="member3@test.com",
            email="member3@test.com",
            password="test-pass-123",
        )
        self.outsider = User.objects.create_user(
            username="outsider2@test.com",
            email="outsider2@test.com",
            password="test-pass-123",
        )
        ChatMembership.objects.create(user=self.member, university=self.university)
        ChatMembership.objects.create(user=self.other_member, university=self.university)
        self.member_token = str(RefreshToken.for_user(self.member).access_token)
        self.other_token = str(RefreshToken.for_user(self.other_member).access_token)
        self.outsider_token = str(RefreshToken.for_user(self.outsider).access_token)

    def test_non_member_can_read_messages(self):
        ChatMessage.objects.create(
            university=self.university,
            user=self.member,
            text="Ko'rish uchun ochiq xabar",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.outsider_token}")
        response = self.client.get(f"/api/universities/{self.university.id}/messages/")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(len(payload["messages"]), 1)
        self.assertEqual(payload["messages"][0]["text"], "Ko'rish uchun ochiq xabar")

    def test_non_member_can_view_members(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.outsider_token}")
        response = self.client.get(f"/api/universities/{self.university.id}/members/")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["member_count"], 2)
        self.assertEqual(len(payload["members"]), 2)

    def test_message_extracts_hashtags(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.member_token}")
        response = self.client.post(
            f"/api/universities/{self.university.id}/messages/",
            {"text": "Salom #qabul2026 va #grant"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        payload = response.json()
        self.assertEqual(payload["tags"], ["qabul2026", "grant"])

    def test_filter_messages_by_tag(self):
        ChatMessage.objects.create(
            university=self.university,
            user=self.member,
            text="#qabul2026 haqida",
            tags=["qabul2026"],
        )
        ChatMessage.objects.create(
            university=self.university,
            user=self.member,
            text="Oddiy xabar",
            tags=[],
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.member_token}")
        response = self.client.get(
            f"/api/universities/{self.university.id}/messages/",
            {"tag": "qabul2026"},
        )
        self.assertEqual(response.status_code, 200)
        messages = response.json()["messages"]
        self.assertEqual(len(messages), 1)
        self.assertEqual(messages[0]["tags"], ["qabul2026"])

    def test_block_hides_group_messages_from_blocked_users(self):
        message = ChatMessage.objects.create(
            university=self.university,
            user=self.other_member,
            text="Bloklangan foydalanuvchi xabari",
        )
        UserBlock.objects.create(blocker=self.member, blocked=self.other_member)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.member_token}")
        response = self.client.get(f"/api/universities/{self.university.id}/messages/")
        self.assertEqual(response.status_code, 200)
        ids = [item["id"] for item in response.json()["messages"]]
        self.assertNotIn(message.id, ids)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.other_token}")
        own_message = ChatMessage.objects.create(
            university=self.university,
            user=self.member,
            text="Bloklagan odamning xabari",
        )
        response = self.client.get(f"/api/universities/{self.university.id}/messages/")
        ids = [item["id"] for item in response.json()["messages"]]
        self.assertNotIn(own_message.id, ids)

    def test_mute_keeps_messages_visible_in_university(self):
        message = ChatMessage.objects.create(
            university=self.university,
            user=self.other_member,
            text="Mute xabar",
        )
        UserMute.objects.create(
            muter=self.member,
            muted_user=self.other_member,
            university=self.university,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.member_token}")
        response = self.client.get(f"/api/universities/{self.university.id}/messages/")
        ids = [item["id"] for item in response.json()["messages"]]
        self.assertIn(message.id, ids)

    def test_new_message_creates_chat_notification(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.member_token}")
        response = self.client.post(
            f"/api/universities/{self.university.id}/messages/",
            {"text": "Yangi xabar"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(
            Notification.objects.filter(
                user=self.other_member,
                kind=Notification.Kind.CHAT_UNREAD,
            ).exists()
        )

    def test_mute_skips_chat_notification(self):
        UserMute.objects.create(
            muter=self.other_member,
            muted_user=self.member,
            university=self.university,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.member_token}")
        response = self.client.post(
            f"/api/universities/{self.university.id}/messages/",
            {"text": "Mute qilingan foydalanuvchidan"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertFalse(
            Notification.objects.filter(
                user=self.other_member,
                kind=Notification.Kind.CHAT_UNREAD,
            ).exists()
        )

    def test_mute_keeps_direct_messages_visible(self):
        from universities.models import DirectMessage, DirectThread

        thread = DirectThread.objects.create(user_one=self.member, user_two=self.other_member)
        muted_message = DirectMessage.objects.create(
            thread=thread,
            sender=self.other_member,
            text="Mute shaxsiy xabar",
        )
        DirectMessage.objects.create(
            thread=thread,
            sender=self.member,
            text="O'z xabaringiz",
        )
        UserMute.objects.create(
            muter=self.member,
            muted_user=self.other_member,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.member_token}")
        response = self.client.get(f"/api/universities/directs/{thread.id}/messages/")
        self.assertEqual(response.status_code, 200)
        ids = [item["id"] for item in response.json()["messages"]]
        self.assertIn(muted_message.id, ids)
        self.assertEqual(len(ids), 2)

    def test_public_faq_list(self):
        FAQItem.objects.create(
            question="Test savol?",
            answer="Test javob.",
            slug="test-savol",
            is_published=True,
        )
        response = self.client.get("/api/public/faq/")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertGreaterEqual(payload["count"], 1)
        self.assertTrue(any(item["slug"] == "test-savol" for item in payload["items"]))

    def test_public_faq_detail(self):
        FAQItem.objects.create(
            question="Batafsil savol?",
            answer="Batafsil javob.",
            slug="batafsil-savol",
            is_published=True,
        )
        response = self.client.get("/api/public/faq/batafsil-savol/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["question"], "Batafsil savol?")

    def test_sitemap_includes_faq(self):
        FAQItem.objects.create(
            question="Sitemap savol?",
            answer="Javob.",
            slug="sitemap-savol",
            is_published=True,
        )
        response = self.client.get("/api/public/sitemap.xml")
        self.assertIn("sitemap-savol", response.content.decode())

    def test_joined_chats_typing_lists_other_member(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.other_token}")
        typing_response = self.client.post(f"/api/universities/{self.university.id}/typing/")
        self.assertEqual(typing_response.status_code, 200)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.member_token}")
        response = self.client.get("/api/universities/joined/typing/")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        users = payload["typing"][str(self.university.id)]
        self.assertEqual(len(users), 1)
        self.assertEqual(users[0]["id"], self.other_member.id)
