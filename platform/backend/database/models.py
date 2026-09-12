import aiosqlite, json
from datetime import datetime

INIT_SQL = """
CREATE TABLE IF NOT EXISTS incidents (
    incident_id      TEXT PRIMARY KEY,
    suspected_clone  TEXT NOT NULL,
    protected_site   TEXT,
    severity         TEXT NOT NULL,
    status           TEXT NOT NULL,
    phisfence_data   TEXT,
    phishshield_data TEXT,
    created_at       TEXT NOT NULL,
    updated_at       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_clone ON incidents(suspected_clone);
CREATE INDEX IF NOT EXISTS idx_status ON incidents(status);
"""

async def init_db(db_path: str):
    async with aiosqlite.connect(db_path) as db:
        await db.executescript(INIT_SQL)
        await db.commit()
