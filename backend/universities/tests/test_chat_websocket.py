from django.contrib.auth import get_user_model
from django.test import TestCase
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import RefreshToken

try:
    from channels.testing import WebsocketCommunicator
except ImportError:  # pragma: no cover - optional until channels is installed
    WebsocketCommunicator = None

User = get_user_model()


class ChatWebSocketTests(TestCase):
    def setUp(self):
        if WebsocketCommunicator is None:
            self.skipTest("channels is not installed")
        self.user = User.objects.create_user(
            username="ws-user@test.com",
            email="ws-user@test.com",
            password="test-pass-123",
        )
        self.access_token = str(RefreshToken.for_user(self.user).access_token)

    async def test_rejects_unauthenticated_connection(self):
        from myuni.asgi import application

        communicator = WebsocketCommunicator(application, "/ws/chat/")
        connected, close_code = await communicator.connect()
        self.assertFalse(connected)
        self.assertEqual(close_code, 4401)
        await communicator.disconnect()

    async def test_accepts_authenticated_connection(self):
        from myuni.asgi import application

        communicator = WebsocketCommunicator(
            application,
            f"/ws/chat/?token={self.access_token}",
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        payload = await communicator.receive_json_from()
        self.assertEqual(payload["type"], "connected")
        self.assertEqual(payload["user_id"], self.user.id)

        await communicator.send_json_to({"type": "ping"})
        pong = await communicator.receive_json_from()
        self.assertEqual(pong["type"], "pong")

        await communicator.disconnect()

    async def test_subscribe_requires_membership(self):
        from myuni.asgi import application
        from universities.models import ChatMembership, University

        university = await database_sync_to_async(University.objects.create)(
            name="WS University",
            short_name="WSU",
            location="Toshkent",
        )
        communicator = WebsocketCommunicator(
            application,
            f"/ws/chat/?token={self.access_token}",
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)
        await communicator.receive_json_from()

        await communicator.send_json_to(
            {
                "type": "subscribe",
                "channel": "university",
                "id": university.id,
                "since_id": 0,
            }
        )
        denied = await communicator.receive_json_from()
        self.assertEqual(denied["type"], "error")
        await communicator.disconnect()

        await database_sync_to_async(ChatMembership.objects.create)(
            user=self.user,
            university=university,
        )

        communicator = WebsocketCommunicator(
            application,
            f"/ws/chat/?token={self.access_token}",
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)
        await communicator.receive_json_from()

        await communicator.send_json_to(
            {
                "type": "subscribe",
                "channel": "university",
                "id": university.id,
                "since_id": 0,
            }
        )
        subscribed = await communicator.receive_json_from()
        self.assertEqual(subscribed["type"], "subscribed")
        await communicator.disconnect()
