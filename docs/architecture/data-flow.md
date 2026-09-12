# Data Flow Specification

## 1. PhisFence Detection Flow
1. An attacker clones an authorized protected site containing `protect-lib`.
2. The cloned page attempts to load embedded bait assets from PhisFence (`/bait.png`).
3. PhisFence `Monitor API` captures the referer domain, origin header, IP address, and user-agent.
4. `Monitor API` fires an HTTP POST payload to `Platform Backend` (`/event/phisfence`).
5. `Platform Backend` correlates the event with existing domain incidents and updates the status to `CRITICAL`.

## 2. PhishShield Analysis Flow
1. An analyst or automated trigger sends a URL to `PhishShield` (`/scan`).
2. `PhishShield` runs parallel check modules (`WHOIS`, `SSL`, `Typosquatting`, `OpenPhish`, `AI ML`).
3. Aggregate risk score ($0 - 100$) is computed.
4. Result payload is automatically forwarded to `Platform Backend` (`/event/phishshield`).
5. Platform backend links scan evidence with active domain incidents.
