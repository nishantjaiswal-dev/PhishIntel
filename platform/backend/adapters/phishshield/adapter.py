from .mapper import map_phishshield_event

class PhishShieldAdapter:
    def process(self, raw_payload: dict) -> dict:
        return map_phishshield_event(raw_payload)
