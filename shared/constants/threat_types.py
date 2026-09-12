from enum import Enum

class ThreatType(str, Enum):
    BAIT_HIT = "bait_hit"
    PHISHING_URL = "phishing_url"
    TYPOSQUATTING = "typosquatting"
    BRAND_IMPERSONATION = "brand_impersonation"
    SUSPICIOUS_REDIRECT = "suspicious_redirect"
