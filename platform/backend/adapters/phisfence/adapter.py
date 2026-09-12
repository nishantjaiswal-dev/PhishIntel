from .mapper import map_phisfence_event

class PhisFenceAdapter:
    def process(self, raw_payload: dict) -> dict:
        return map_phisfence_event(raw_payload)
