import pytest
from response.decision_engine import DecisionEngine

def test_decision_critical_actions():
    incident = {
        "incident_id": "INC-1234",
        "severity": "CRITICAL",
        "phisfence": {"source": "phisfence"},
        "phishshield": {"source": "phishshield"},
    }
    decision = DecisionEngine.evaluate(incident)
    assert decision["severity"] == "CRITICAL"
    assert decision["corroborated"] is True
    assert "BLOCK_DOMAIN_BLACKLIST" in decision["recommended_actions"]
    assert "GENERATE_RISK_REPORT" in decision["recommended_actions"]
