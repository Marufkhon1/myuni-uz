from rest_framework import serializers

from .reaction_utils import ALLOWED_REACTIONS


class MessageReactionSerializer(serializers.Serializer):
    emoji = serializers.ChoiceField(choices=ALLOWED_REACTIONS)
