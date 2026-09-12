# Integration Test Plan

## Test Scenarios

1. **Simulated Bait Hit**:
   - Send mock telemetry to PhisFence Monitor API.
   - Verify event is received at Platform Backend.
   - Verify incident appears on SOC Dashboard via SSE stream.

2. **Parallel URL Scan**:
   - Issue URL scan request to PhishShield Backend.
   - Verify risk score and recommendation generation.
   - Confirm evidence correlation with domain incident.

3. **Full Security Lifecycle**:
   - Run system test script `pytest tests/system/test_full_security_lifecycle.py`.
