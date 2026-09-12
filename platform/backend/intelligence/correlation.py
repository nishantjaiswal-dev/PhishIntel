import uuid
from datetime import datetime

class CorrelationEngine:
    @staticmethod
    def compute_severity(pf_data: dict, ps_data: dict) -> str:
        if pf_data and ps_data:
            return "CRITICAL"
        if pf_data:
            return "HIGH"
        if ps_data:
            score = ps_data.get("risk_score", 0)
            if score >= 75: return "HIGH"
            if score >= 50: return "MEDIUM"
        return "LOW"

    @staticmethod
    def correlate(existing_incident: dict, event: dict) -> dict:
        now = datetime.utcnow().isoformat()
        source = event.get("source")
        
        if existing_incident:
            inc = dict(existing_incident)
            if source == "phisfence":
                inc["phisfence"] = event
                if event.get("protected_site"):
                    inc["protected_site"] = event["protected_site"]
            elif source == "phishshield":
                inc["phishshield"] = event
            
            inc["severity"] = CorrelationEngine.compute_severity(inc.get("phisfence"), inc.get("phishshield"))
            inc["updated_at"] = now
            return inc
        else:
            inc_id = f"INC-{uuid.uuid4().hex[:8].upper()}"
            clone = event.get("suspected_clone", "unknown")
            pf = event if source == "phisfence" else None
            ps = event if source == "phishshield" else None
            
            return {
                "incident_id": inc_id,
                "suspected_clone": clone,
                "protected_site": event.get("protected_site"),
                "severity": CorrelationEngine.compute_severity(pf, ps),
                "status": "NEW",
                "phisfence": pf,
                "phishshield": ps,
                "created_at": now,
                "updated_at": now,
            }
