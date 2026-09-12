import os
from dotenv import load_dotenv

# Load from workspace root .env if present
_root = os.path.join(os.path.dirname(__file__), "..")
load_dotenv(os.path.join(_root, ".env"), override=False)

INTEGRATION_PORT = int(os.getenv("INTEGRATION_PORT", "8001"))
PHISHSHIELD_URL  = os.getenv("PHISHSHIELD_URL", "http://localhost:8000")
PHISFENCE_URL    = os.getenv("PHISFENCE_URL",   "http://localhost:5000")
INTEGRATION_URL  = os.getenv("INTEGRATION_URL", "http://localhost:8001")
DB_PATH          = os.getenv("DB_PATH", "./phishdefense.db")
API_KEY          = os.getenv("API_KEY", "phishdefense-dev-key-change-in-prod")
