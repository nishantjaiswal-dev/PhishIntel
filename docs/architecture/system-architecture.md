# System Architecture

The **Phishing Defense Platform** is an enterprise-grade threat management system that correlates active deception signals from **PhisFence** with machine-learning threat assessments from **PhishShield**.

```mermaid
graph TD
    subgraph Active Defense Layer
        Client[Target Website / Protect-Lib] -->|Bait Hits & Telemetry| FenceAPI[PhisFence Monitor API :5000]
        FenceAPI -->|SSE Blacklist Push| Client
    end

    subgraph Integration & Correlation Layer
        FenceAPI -->|POST /event/phisfence| PlatformBackend[Platform Backend :8001]
        ShieldAPI -->|POST /event/phishshield| PlatformBackend
        PlatformBackend -->|Read/Write| DB[(SQLite Database)]
        PlatformBackend -->|SSE Stream /incidents/stream| Dashboard[Platform SOC Dashboard :5173]
    end

    subgraph Threat Intelligence Layer
        User[Security Analyst] -->|URL Scan Request| ShieldAPI[PhishShield Backend :8000]
        ShieldAPI -->|Parallel Analyzers| Analyzers[WHOIS, SSL, AI ML, Brand Impersonation]
    end
```
