from datetime import datetime
from .report_generator import ReportGenerator

class ReportService:
    @staticmethod
    def create_report_for_incident(incident: dict) -> dict:
        now = datetime.utcnow().isoformat()
        report_id = f"REP-{incident.get('incident_id', 'UNKNOWN')}"
        
        summary = ReportGenerator.generate_summary([incident])
        summary["report_id"] = report_id
        summary["incident_details"] = incident
        summary["target_victim_site"] = incident.get("protected_site", "UNKNOWN")
        summary["recommendation"] = "Immediate domain takedown request recommended." if incident.get("severity") in ["CRITICAL", "HIGH"] else "Monitor site for further activity."
        return summary

report_service = ReportService()
