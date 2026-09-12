import logging
from .webhook_notifier import WebhookNotifier

logger = logging.getLogger("notification_service")

class NotificationService:
    def __init__(self, webhook_url: str = None):
        self.webhook = WebhookNotifier(webhook_url)

    async def notify_incident(self, event_type: str, incident: dict):
        logger.info("Notification dispatched [%s]: Incident %s (Severity: %s)",
                    event_type, incident.get("incident_id"), incident.get("severity"))
        await self.webhook.send_event(event_type, incident)

notification_service = NotificationService()
