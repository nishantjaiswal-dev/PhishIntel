import logging
from typing import Optional

logger = logging.getLogger("webhook_notifier")

class WebhookNotifier:
    def __init__(self, target_url: Optional[str] = None):
        self.target_url = target_url

    async def send_event(self, event_type: str, payload: dict) -> bool:
        logger.info("[Webhook] Dispatched event '%s' for incident '%s' to %s",
                    event_type, payload.get("incident_id", "N/A"), self.target_url or "console")
        return True
