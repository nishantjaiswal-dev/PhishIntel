import pytest
from intelligence.correlation import CorrelationEngine

def test_correlation_both_events():
    pf_event = {"source": "phisfence", "suspected_clone": "clone-test.com", "protected_site": "https://company.com"}
    ps_event = {"source": "phishshield", "suspected_clone": "clone-test.com", "risk_score": 85}
    
    inc = CorrelationEngine.correlate(None, pf_event)
    assert inc["severity"] == "HIGH"
    
    inc_updated = CorrelationEngine.correlate(inc, ps_event)
    assert inc_updated["severity"] == "CRITICAL"
    assert inc_updated["phisfence"] is not None
    assert inc_updated["phishshield"] is not None
