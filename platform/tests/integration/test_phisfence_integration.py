import pytest, requests

def test_phisfence_adapter_payload():
    from adapters.phisfence.adapter import PhisFenceAdapter
    adapter = PhisFenceAdapter()
    res = adapter.process({"referer": "http://evil-clone.com", "domainClaim": "evil-clone.com"})
    assert res["source"] == "phisfence"
    assert res["event_type"] == "bait_hit"
