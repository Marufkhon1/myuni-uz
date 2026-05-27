ALLOWED_REACTIONS = ("👍", "❤️", "😂", "😮", "😢")


def reactions_summary_for_message(message, user):
    reactions_qs = message.reactions.all()
    counts = {}
    for reaction in reactions_qs:
        counts[reaction.emoji] = counts.get(reaction.emoji, 0) + 1

    my_reaction = None
    if user and user.is_authenticated:
        mine = next((reaction for reaction in reactions_qs if reaction.user_id == user.id), None)
        my_reaction = mine.emoji if mine else None

    summary = [
        {
            "emoji": emoji,
            "count": counts.get(emoji, 0),
            "reacted_by_me": my_reaction == emoji,
        }
        for emoji in ALLOWED_REACTIONS
        if counts.get(emoji, 0) > 0
    ]
    return {"reactions": summary, "my_reaction": my_reaction}


def toggle_message_reaction(reaction_model, message, user, emoji):
    if emoji not in ALLOWED_REACTIONS:
        raise ValueError("Reaksiya noto'g'ri.")

    existing = reaction_model.objects.filter(message=message, user=user).first()
    if existing:
        if existing.emoji == emoji:
            existing.delete()
        else:
            existing.emoji = emoji
            existing.save(update_fields=["emoji"])
    else:
        reaction_model.objects.create(message=message, user=user, emoji=emoji)
