def map_phisfence_event(raw: dict) -> dict:
    return {
        "source": "phisfence",
        "event_type": raw.get("event_type", "bait_hit"),
        "protected_site": raw.get("protected_site"),
        "suspected_clone": raw.get("suspected_clone", "unknown"),
        "timestamp": raw.get("timestamp"),
        "evidence": raw.get("evidence", raw),
        "confidence": raw.get("confidence", 0.8),
    }
