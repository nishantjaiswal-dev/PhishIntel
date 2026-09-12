import asyncio
from typing import List, Callable

class EventBus:
    def __init__(self):
        self.subscribers: List[Callable] = []

    def subscribe(self, callback: Callable):
        self.subscribers.append(callback)

    async def publish(self, event_type: str, data: dict):
        for sub in self.subscribers:
            try:
                if asyncio.iscoroutinefunction(sub):
                    await sub(event_type, data)
                else:
                    sub(event_type, data)
            except Exception as e:
                print(f"[EventBus] Error notifying subscriber: {e}")

event_bus = EventBus()
