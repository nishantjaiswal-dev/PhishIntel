from enum import Enum

class EventType(str, Enum):
    PHISFENCE_BAIT_HIT = "phisfence_bait_hit"
    PHISHSHIELD_SCAN = "phishshield_scan"
    INCIDENT_CREATED = "incident_created"
    INCIDENT_UPDATED = "incident_updated"
    BLACKLIST_UPDATED = "blacklist_updated"
