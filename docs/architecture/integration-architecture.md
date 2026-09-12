# Integration Architecture

The Integration Layer (`platform/backend`) operates as an event bus and correlation repository.

## Components

- **Adapters**: Parse incoming raw events into unified `ThreatEvent` schemas.
- **Correlation Engine**: Groups events by `suspected_clone` domain or target `protected_site`.
- **Deduplication Manager**: Merges multiple bait hits from the same clone site into a single incident window.
- **SSE Stream Hub**: Emits continuous Server-Sent Events to connected SOC dashboards.
