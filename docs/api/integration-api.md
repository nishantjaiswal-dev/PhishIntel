# Platform Integration API Reference

Base URL: `http://localhost:8001`

### Endpoints

#### `POST /event/phisfence`
Ingests bait hit telemetry from PhisFence Monitor API.
- **Headers**: `X-API-Key: <key>`
- **Body**:
  ```json
  {
    "source": "phisfence",
    "event_type": "bait_hit",
    "protected_site": "https://company.com",
    "suspected_clone": "phish-site.com",
    "timestamp": "2026-09-12T12:00:00Z",
    "evidence": { "ip": "1.2.3.4", "ua": "..." }
  }
  ```

#### `POST /event/phishshield`
Ingests ML scan results from PhishShield Backend.

#### `GET /incidents`
Returns a list of all correlated incidents.

#### `GET /incidents/stream`
Server-Sent Events (SSE) endpoint pushing live incident snapshots and updates.

#### `PATCH /incidents/{incident_id}/status`
Updates incident lifecycle status (`NEW`, `INVESTIGATING`, `RESOLVED`, `FALSE_POSITIVE`).
