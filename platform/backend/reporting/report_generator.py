import os
from datetime import datetime

class ReportGenerator:
    @staticmethod
    def generate_summary(incidents: list) -> dict:
        total = len(incidents)
        critical = sum(1 for i in incidents if i.get("severity") == "CRITICAL")
        clones = list(set(i.get("suspected_clone") for i in incidents if i.get("suspected_clone")))
        return {
            "report_id": f"REP-{int(datetime.utcnow().timestamp())}",
            "generated_at": datetime.utcnow().isoformat(),
            "total_incidents": total,
            "critical_count": critical,
            "active_clones": clones,
        }
