import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.http import Http404

from .ws_auth import get_stream_user_from_scope
from .ws_broadcast import direct_chat_group, university_chat_group
from .ws_subscribe import fetch_direct_stream_messages, fetch_university_stream_messages


class ChatRealtimeConsumer(AsyncJsonWebsocketConsumer):
    """WebSocket transport for chat realtime events (SSE remains supported)."""

    async def connect(self):
        user = await database_sync_to_async(get_stream_user_from_scope)(self.scope)
        if not user:
            await self.close(code=4401)
            return

        self.user = user
        self.active_groups = set()
        await self.accept()
        await self.send_json({"type": "connected", "user_id": user.id})

    async def disconnect(self, close_code):
        for group_name in getattr(self, "active_groups", set()):
            await self.channel_layer.group_discard(group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        message_type = content.get("type")
        if message_type == "ping":
            await self.send_json({"type": "pong"})
            return

        if message_type == "subscribe":
            await self._handle_subscribe(content)
            return

        await self.send_json({"type": "error", "detail": "Noma'lum xabar turi."})

    async def _handle_subscribe(self, content):
        channel = content.get("channel")
        target_id = content.get("id")
        since_id = int(content.get("since_id") or 0)

        if channel not in {"university", "direct"} or not target_id:
            await self.send_json({"type": "error", "detail": "Noto'g'ri obuna parametrlari."})
            return

        for group_name in list(self.active_groups):
            await self.channel_layer.group_discard(group_name, self.channel_name)
        self.active_groups.clear()

        group_name = (
            university_chat_group(target_id)
            if channel == "university"
            else direct_chat_group(target_id)
        )

        try:
            messages = await database_sync_to_async(self._fetch_since_messages)(
                channel, target_id, since_id
            )
        except Http404:
            await self.send_json({"type": "error", "detail": "Bu chatga ruxsat yo'q."})
            await self.close(code=4403)
            return

        await self.channel_layer.group_add(group_name, self.channel_name)
        self.active_groups.add(group_name)

        await self.send_json(
            {
                "type": "subscribed",
                "channel": channel,
                "id": target_id,
            }
        )

        if messages:
            await self.send_json({"event": "messages", "data": messages})

    def _fetch_since_messages(self, channel, target_id, since_id):
        if channel == "university":
            return fetch_university_stream_messages(self.user, target_id, since_id)
        return fetch_direct_stream_messages(self.user, target_id, since_id)

    async def chat_stream_event(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "event": event["event"],
                    "data": event["data"],
                },
                default=str,
            )
        )
