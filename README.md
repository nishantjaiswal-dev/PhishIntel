# Phishing Defense Platform (PhisFence + PhishShield Unified SOC)

A modular, enterprise-grade cybersecurity platform combining active website protection (**PhisFence**) and real-time threat intelligence assessment (**PhishShield**).

---

## 🏗️ Architecture

```
Phishing-Defense-Platform/
├── phisfence/           # Active Defense & Deception (Bait assets, monitor-api, protect-lib)
├── phishshield/         # ML Threat Assessment (Parallel URL analysis, risk scoring)
├── platform/            # Correlation & Integration Layer (FastAPI, SQLite, SSE, React SOC Dashboard)
├── shared/              # Shared JSON schemas & constants
├── docs/                # Architecture, API, Deployment, and Testing docs
├── scripts/             # PowerShell & bash deployment/startup scripts
└── tests/               # System and integration tests
```

---

## ⚡ Quickstart

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Configure Environment
```bash
cp .env.example .env
```

### 2. Start All Platform Services
```powershell
.\scripts\start-all.ps1
```

### 3. Access Points
- **Unified SOC Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Integration API Docs**: [http://localhost:8001/docs](http://localhost:8001/docs)
- **PhishShield API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **PhisFence Monitor API**: [http://localhost:5000](http://localhost:5000)

---

## 🛡️ Subsystem Overview

| Component | Role | Technology Stack | Port |
| :--- | :--- | :--- | :--- |
| **PhisFence** | Active Defense / Deception | Node.js, Express, Socket.io, SSE | `5000` |
| **PhishShield** | Detection / Threat Analysis | Python, FastAPI, Async Parallel, ThreadPool | `8000` |
| **Platform Backend** | Correlation & Storage | Python, FastAPI, aiosqlite, SSE | `8001` |
| **SOC Dashboard** | Unified Incident SOC UI | React, Vite, CSS design tokens | `5173` |

---

## 📄 Documentation

- [System Architecture](docs/architecture/system-architecture.md)
- [Data Flow Specification](docs/architecture/data-flow.md)
- [Integration API Docs](docs/api/integration-api.md)
- [Deployment Guide](docs/deployment/deployment-guide.md)
- [Integration Test Plan](docs/testing/integration-test-plan.md)
