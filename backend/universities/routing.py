from django.urls import path

from .consumers import ChatRealtimeConsumer

websocket_urlpatterns = [
    path("ws/chat/", ChatRealtimeConsumer.as_asgi()),
]
