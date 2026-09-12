def map_phishshield_event(raw: dict) -> dict:
    domain = raw.get("domain", "")
    if not domain and "url" in raw:
        try:
            from urllib.parse import urlparse
            domain = urlparse(raw["url"]).netloc
        except: pass
    return {
        "source": "phishshield",
        "event_type": "phishshield_scan",
        "suspected_clone": domain or "unknown",
        "timestamp": raw.get("timestamp"),
        "evidence": raw,
        "risk_score": raw.get("risk_score", 0),
        "classification": raw.get("classification", "BENIGN"),
        "confidence": raw.get("confidence", 0.9),
    }
