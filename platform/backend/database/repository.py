import aiosqlite, json
from datetime import datetime

class IncidentRepository:
    def __init__(self, db_path: str):
        self.db_path = db_path

    async def get_all(self):
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM incidents ORDER BY updated_at DESC") as cursor:
                rows = await cursor.fetchall()
                out = []
                for r in rows:
                    out.append({
                        "incident_id": r["incident_id"],
                        "suspected_clone": r["suspected_clone"],
                        "protected_site": r["protected_site"],
                        "severity": r["severity"],
                        "status": r["status"],
                        "phisfence": json.loads(r["phisfence_data"]) if r["phisfence_data"] else None,
                        "phishshield": json.loads(r["phishshield_data"]) if r["phishshield_data"] else None,
                        "created_at": r["created_at"],
                        "updated_at": r["updated_at"],
                    })
                return out

    async def find_by_clone(self, clone_domain: str):
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM incidents WHERE suspected_clone = ? LIMIT 1", (clone_domain,)) as cursor:
                r = await cursor.fetchone()
                if not r: return None
                return {
                    "incident_id": r["incident_id"],
                    "suspected_clone": r["suspected_clone"],
                    "protected_site": r["protected_site"],
                    "severity": r["severity"],
                    "status": r["status"],
                    "phisfence": json.loads(r["phisfence_data"]) if r["phisfence_data"] else None,
                    "phishshield": json.loads(r["phishshield_data"]) if r["phishshield_data"] else None,
                    "created_at": r["created_at"],
                    "updated_at": r["updated_at"],
                }

    async def upsert(self, inc: dict):
        now = datetime.utcnow().isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT INTO incidents (incident_id, suspected_clone, protected_site, severity, status, phisfence_data, phishshield_data, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(incident_id) DO UPDATE SET
                    severity=excluded.severity,
                    status=excluded.status,
                    phisfence_data=COALESCE(excluded.phisfence_data, incidents.phisfence_data),
                    phishshield_data=COALESCE(excluded.phishshield_data, incidents.phishshield_data),
                    updated_at=excluded.updated_at
            """, (
                inc["incident_id"],
                inc["suspected_clone"],
                inc.get("protected_site"),
                inc["severity"],
                inc["status"],
                json.dumps(inc.get("phisfence")) if inc.get("phisfence") else None,
                json.dumps(inc.get("phishshield")) if inc.get("phishshield") else None,
                inc.get("created_at", now),
                now
            ))
            await db.commit()

    async def update_status(self, inc_id: str, new_status: str):
        now = datetime.utcnow().isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("UPDATE incidents SET status=?, updated_at=? WHERE incident_id=?", (new_status, now, inc_id))
            await db.commit()
