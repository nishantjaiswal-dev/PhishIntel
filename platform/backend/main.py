from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from typing import Optional, List
import asyncio, json, uuid
from datetime import datetime

from config.settings import settings
from config.logging import logger
from database.models import init_db
from database.repository import IncidentRepository
from adapters.phisfence.adapter import PhisFenceAdapter
from adapters.phishshield.adapter import PhishShieldAdapter
from intelligence.correlation import CorrelationEngine
from intelligence.entity_matching import EntityMatcher
from notifications.notification_service import notification_service
from reporting.report_service import report_service

app = FastAPI(title="Phishing Defense Platform Integration API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

repo = IncidentRepository(settings.DB_PATH)
pf_adapter = PhisFenceAdapter()
ps_adapter = PhishShieldAdapter()

_subscribers: List[asyncio.Queue] = []
REGISTERED_PROTECTED_SITES = ["https://mycompany.com", "https://demo.local"]

async def broadcast(event_type: str, data: dict):
    msg = json.dumps({"event": event_type, "data": data})
    for q in list(_subscribers):
        try:
            q.put_nowait(msg)
        except asyncio.QueueFull:
            pass

@app.on_event("startup")
async def startup():
    await init_db(settings.DB_PATH)
    logger.info("Platform database initialized at %s", settings.DB_PATH)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "platform-backend", "version": "2.0.0"}

@app.get("/incidents")
async def get_incidents():
    return await repo.get_all()

@app.get("/incidents/stream")
async def incident_stream(request: Request):
    q: asyncio.Queue = asyncio.Queue(maxsize=50)
    _subscribers.append(q)

    async def event_generator():
        try:
            snapshot = await repo.get_all()
            yield {"event": "snapshot", "data": json.dumps(snapshot)}
            while True:
                if await request.is_disconnected():
                    break
                try:
                    msg = await asyncio.wait_for(q.get(), timeout=15.0)
                    item = json.loads(msg)
                    yield {"event": item["event"], "data": json.dumps(item["data"])}
                except asyncio.TimeoutError:
                    yield {"event": "ping", "data": ""}
        finally:
            if q in _subscribers:
                _subscribers.remove(q)

    return EventSourceResponse(event_generator())

@app.post("/event/phisfence")
async def receive_phisfence(payload: dict, x_api_key: Optional[str] = Header(None)):
    event = pf_adapter.process(payload)
    clone = event.get("suspected_clone", "unknown")
    
    if not event.get("protected_site"):
        matched = EntityMatcher.match_victim_site(clone, REGISTERED_PROTECTED_SITES)
        event["protected_site"] = matched or REGISTERED_PROTECTED_SITES[0]
        
    existing = await repo.find_by_clone(clone)
    updated_inc = CorrelationEngine.correlate(existing, event)
    await repo.upsert(updated_inc)
    
    # Auto notifications & risk reporting
    await notification_service.notify_incident("phisfence_hit", updated_inc)
    await broadcast("update", updated_inc)
    
    logger.info("Ingested PhisFence event for clone: %s", clone)
    return {"status": "accepted", "incident_id": updated_inc["incident_id"]}

@app.post("/event/phishshield")
async def receive_phishshield(payload: dict, x_api_key: Optional[str] = Header(None)):
    event = ps_adapter.process(payload)
    clone = event.get("suspected_clone", "unknown")
    
    matched = EntityMatcher.match_victim_site(clone, REGISTERED_PROTECTED_SITES)
    event["protected_site"] = matched or REGISTERED_PROTECTED_SITES[0]
        
    existing = await repo.find_by_clone(clone)
    updated_inc = CorrelationEngine.correlate(existing, event)
    await repo.upsert(updated_inc)
    
    # Auto notifications & risk reporting
    await notification_service.notify_incident("phishshield_scan", updated_inc)
    await broadcast("update", updated_inc)
    
    logger.info("Ingested PhishShield scan for clone: %s", clone)
    return {"status": "accepted", "incident_id": updated_inc["incident_id"]}

@app.get("/reports/{incident_id}")
async def get_report(incident_id: str):
    incidents = await repo.get_all()
    matching = [i for i in incidents if i["incident_id"] == incident_id]
    if not matching:
        raise HTTPException(status_code=404, detail="Incident not found")
    return report_service.create_report_for_incident(matching[0])

@app.patch("/incidents/{incident_id}/status")
async def update_status(incident_id: str, body: dict, x_api_key: Optional[str] = Header(None)):
    new_status = body.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="status required")
    await repo.update_status(incident_id, new_status)
    incidents = await repo.get_all()
    matching = [i for i in incidents if i["incident_id"] == incident_id]
    if matching:
        await broadcast("update", matching[0])
    return {"status": "ok", "incident_id": incident_id, "new_status": new_status}

@app.get("/incidents/stats")
async def get_stats():
    incidents = await repo.get_all()
    total = len(incidents)
    counts = {}
    for i in incidents:
        s = i.get("severity", "LOW")
        counts[s] = counts.get(s, 0) + 1
    return {"total": total, "severity_counts": counts}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.PLATFORM_PORT)
