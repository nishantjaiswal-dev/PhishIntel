class DecisionEngine:
    @staticmethod
    def evaluate(incident: dict) -> dict:
        severity = incident.get("severity", "LOW")
        pf = incident.get("phisfence")
        ps = incident.get("phishshield")
        
        actions = []
        if severity == "CRITICAL":
            actions.append("BLOCK_DOMAIN_BLACKLIST")
            actions.append("DISPATCH_CRITICAL_ALERT")
            actions.append("GENERATE_RISK_REPORT")
        elif severity == "HIGH":
            actions.append("DISPATCH_HIGH_ALERT")
            actions.append("GENERATE_RISK_REPORT")
        else:
            actions.append("LOG_FOR_AUDIT")

        return {
            "incident_id": incident.get("incident_id"),
            "severity": severity,
            "corroborated": bool(pf and ps),
            "recommended_actions": actions,
        }
