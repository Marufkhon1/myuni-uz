from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from django.core.files.uploadedfile import SimpleUploadedFile

from accounts.models import Notification, Profile
from universities.models import DirectMessage, DirectThread, UserBlock

User = get_user_model()


class DirectMessageDeliveryTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_a = User.objects.create_user(
            username="alice@test.com",
            email="alice@test.com",
            password="test-pass-123",
        )
        self.user_b = User.objects.create_user(
            username="bob@test.com",
            email="bob@test.com",
            password="test-pass-123",
        )
        self.token_a = str(RefreshToken.for_user(self.user_a).access_token)
        self.token_b = str(RefreshToken.for_user(self.user_b).access_token)

    def test_cross_user_direct_messages_are_visible(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        create_response = self.client.post(
            "/api/universities/directs/",
            {"user_id": self.user_b.id},
            format="json",
        )
        self.assertEqual(create_response.status_code, 201)
        thread_id = create_response.json()["id"]

        send_response = self.client.post(
            f"/api/universities/directs/{thread_id}/messages/",
            {"text": "Salom, Bob!"},
            format="json",
        )
        self.assertEqual(send_response.status_code, 201)
        message_id = send_response.json()["id"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_b}")
        list_response = self.client.get(f"/api/universities/directs/{thread_id}/messages/")
        self.assertEqual(list_response.status_code, 200)
        messages = list_response.json()["messages"]
        self.assertEqual(len(messages), 1)
        self.assertEqual(messages[0]["id"], message_id)
        self.assertEqual(messages[0]["text"], "Salom, Bob!")
        self.assertEqual(messages[0]["sender_id"], self.user_a.id)

        threads_response = self.client.get("/api/universities/directs/")
        self.assertEqual(threads_response.status_code, 200)
        thread_ids = [thread["id"] for thread in threads_response.json()]
        self.assertIn(thread_id, thread_ids)

    def test_direct_sse_delivers_new_message_to_recipient(self):
        first_id, second_id = sorted([self.user_a.id, self.user_b.id])
        thread = DirectThread.objects.create(user_one_id=first_id, user_two_id=second_id)
        DirectMessage.objects.create(thread=thread, sender=self.user_a, text="Real-time test")

        response = self.client.get(
            f"/api/universities/directs/{thread.id}/messages/stream/",
            {"token": self.token_b, "since_id": 0},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("text/event-stream", response["Content-Type"])

    def test_block_hides_only_post_block_messages_and_blocks_notifications(self):
        first_id, second_id = sorted([self.user_a.id, self.user_b.id])
        thread = DirectThread.objects.create(user_one_id=first_id, user_two_id=second_id)
        old_message = DirectMessage.objects.create(
            thread=thread,
            sender=self.user_b,
            text="blokdan oldingi xabar",
        )
        own_message = DirectMessage.objects.create(
            thread=thread,
            sender=self.user_a,
            text="yaxshi",
        )
        past = timezone.now() - timedelta(hours=1)
        DirectMessage.objects.filter(pk=old_message.pk).update(created_at=past)
        DirectMessage.objects.filter(pk=own_message.pk).update(
            created_at=past + timedelta(minutes=30)
        )

        block = UserBlock.objects.create(blocker=self.user_a, blocked=self.user_b)
        blocked_at = timezone.now()
        UserBlock.objects.filter(pk=block.pk).update(created_at=blocked_at)

        post_block_message = DirectMessage.objects.create(
            thread=thread,
            sender=self.user_b,
            text="blokdan keyingi xabar",
        )
        DirectMessage.objects.filter(pk=post_block_message.pk).update(
            created_at=blocked_at + timedelta(seconds=5)
        )

        from universities.unread_utils import mark_direct_thread_read

        mark_direct_thread_read(self.user_a, thread)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        list_response = self.client.get(f"/api/universities/directs/{thread.id}/messages/")
        self.assertEqual(list_response.status_code, 200)
        visible_texts = [item["text"] for item in list_response.json()["messages"]]
        self.assertEqual(visible_texts, [old_message.text, own_message.text])

        threads_response = self.client.get("/api/universities/directs/")
        payload = next(item for item in threads_response.json() if item["id"] == thread.id)
        self.assertEqual(payload["last_message"]["text"], own_message.text)
        self.assertTrue(payload["other_user_blocked_by_me"])
        self.assertEqual(payload["unread_count"], 0)

        send_response = self.client.post(
            f"/api/universities/directs/{thread.id}/messages/",
            {"text": "Yangi xabar"},
            format="json",
        )
        self.assertEqual(send_response.status_code, 403)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_b}")
        blocked_send_response = self.client.post(
            f"/api/universities/directs/{thread.id}/messages/",
            {"text": "Men hali yozaman"},
            format="json",
        )
        self.assertEqual(blocked_send_response.status_code, 201)
        self.assertFalse(
            Notification.objects.filter(
                user=self.user_a,
                kind=Notification.Kind.CHAT_UNREAD,
            ).exists()
        )

        blocked_list_response = self.client.get(f"/api/universities/directs/{thread.id}/messages/")
        blocked_visible_texts = [item["text"] for item in blocked_list_response.json()["messages"]]
        self.assertIn("Men hali yozaman", blocked_visible_texts)
        self.assertIn("blokdan keyingi xabar", blocked_visible_texts)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        after_block_list = self.client.get(f"/api/universities/directs/{thread.id}/messages/")
        still_hidden_texts = [item["text"] for item in after_block_list.json()["messages"]]
        self.assertNotIn("blokdan keyingi xabar", still_hidden_texts)
        self.assertNotIn("Men hali yozaman", still_hidden_texts)

        unblock_response = self.client.delete(
            f"/api/universities/community/users/{self.user_b.id}/block/"
        )
        self.assertEqual(unblock_response.status_code, 200)
        unblocked_list = self.client.get(f"/api/universities/directs/{thread.id}/messages/")
        unblocked_texts = [item["text"] for item in unblocked_list.json()["messages"]]
        self.assertIn("blokdan keyingi xabar", unblocked_texts)
        self.assertIn("Men hali yozaman", unblocked_texts)

    def test_block_hides_profile_avatar_only_for_blocked_viewer(self):
        avatar_file = SimpleUploadedFile("bob.jpg", b"avatar-bytes", content_type="image/jpeg")
        alice_avatar = SimpleUploadedFile("alice.jpg", b"alice-bytes", content_type="image/jpeg")
        Profile.objects.create(
            user=self.user_a,
            full_name="Alice",
            role=Profile.Role.STUDENT,
            avatar=alice_avatar,
            avatar_visibility=Profile.AvatarVisibility.EVERYONE,
        )
        profile_b = Profile.objects.create(
            user=self.user_b,
            full_name="Bob",
            role=Profile.Role.STUDENT,
            bio="Bob bio",
            avatar=avatar_file,
            avatar_visibility=Profile.AvatarVisibility.EVERYONE,
        )
        first_id, second_id = sorted([self.user_a.id, self.user_b.id])
        thread = DirectThread.objects.create(user_one_id=first_id, user_two_id=second_id)
        DirectMessage.objects.create(
            thread=thread,
            sender=self.user_a,
            text="Profil test",
        )

        UserBlock.objects.create(blocker=self.user_a, blocked=self.user_b)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        blocker_view = self.client.get(f"/api/auth/users/{self.user_b.id}/")
        self.assertEqual(blocker_view.status_code, 200)
        blocker_payload = blocker_view.json()
        self.assertTrue(blocker_payload["blocked_by_me"])
        self.assertTrue(blocker_payload["has_block_relationship"])
        self.assertIsNotNone(blocker_payload["avatar_url"])
        self.assertEqual(blocker_payload["bio"], profile_b.bio)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_b}")
        blocked_view = self.client.get(f"/api/auth/users/{self.user_a.id}/")
        self.assertEqual(blocked_view.status_code, 200)
        blocked_payload = blocked_view.json()
        self.assertFalse(blocked_payload["blocked_by_me"])
        self.assertTrue(blocked_payload["has_block_relationship"])
        self.assertIsNone(blocked_payload["avatar_url"])

        blocked_list = self.client.get("/api/universities/community/blocked/")
        self.assertEqual(blocked_list.status_code, 200)
        self.assertEqual(blocked_list.json()["blocked_me_users"][0]["id"], self.user_a.id)
