from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from universities.models import ChatMembership, ChatMessage, University
from universities.unread_utils import group_unread_message_count, group_unread_sender_count

User = get_user_model()


class GroupUnreadTests(TestCase):
    def setUp(self):
        self.university = University.objects.create(
            name="Unread Test University",
            short_name="UTU",
            location="Toshkent",
        )
        self.member = User.objects.create_user(
            username="member@unread.test",
            email="member@unread.test",
            password="test-pass-123",
        )
        self.sender = User.objects.create_user(
            username="sender@unread.test",
            email="sender@unread.test",
            password="test-pass-123",
        )
        ChatMembership.objects.create(user=self.member, university=self.university)

    def test_five_messages_from_one_sender(self):
        for index in range(5):
            ChatMessage.objects.create(
                university=self.university,
                user=self.sender,
                text=f"Xabar {index}",
            )

        self.assertEqual(group_unread_message_count(self.member, self.university.id), 5)
        self.assertEqual(group_unread_sender_count(self.member, self.university.id), 1)

    def test_read_messages_excluded(self):
        ChatMessage.objects.create(
            university=self.university,
            user=self.sender,
            text="O'qilgan xabar",
        )
        membership = ChatMembership.objects.filter(
            user=self.member, university=self.university
        ).first()
        membership.last_read_at = timezone.now()
        membership.save(update_fields=["last_read_at"])

        self.assertEqual(group_unread_message_count(self.member, self.university.id), 0)
        self.assertEqual(group_unread_sender_count(self.member, self.university.id), 0)
