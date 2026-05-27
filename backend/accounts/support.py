import json
import logging
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

logger = logging.getLogger(__name__)


def notify_support_telegram(*, message: str, user_email: str = "", user_name: str = "") -> bool:
    """
    Forward support messages to a Telegram chat when TELEGRAM_BOT_TOKEN and
    TELEGRAM_SUPPORT_CHAT_ID are configured. Returns True if delivered.
    """
    token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    chat_id = os.getenv("TELEGRAM_SUPPORT_CHAT_ID", "").strip()
    if not token or not chat_id:
        return False

    lines = ["MyUni.uz — qo'llab-quvvatlash"]
    if user_name:
        lines.append(f"Ism: {user_name}")
    if user_email:
        lines.append(f"Email: {user_email}")
    lines.append("")
    lines.append(message.strip()[:3500])

    payload = json.dumps(
        {"chat_id": chat_id, "text": "\n".join(lines)},
        ensure_ascii=False,
    ).encode("utf-8")

    request = Request(
        f"https://api.telegram.org/bot{token}/sendMessage",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlopen(request, timeout=8) as response:
            return 200 <= response.status < 300
    except (HTTPError, URLError, TimeoutError) as error:
        logger.warning("Telegram support notify failed: %s", error)
        return False
