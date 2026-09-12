import os

class Settings:
    PLATFORM_PORT: int = int(os.getenv("PLATFORM_PORT", "8001"))
    PHISFENCE_PORT: int = int(os.getenv("PHISFENCE_PORT", "5000"))
    PHISHSHIELD_PORT: int = int(os.getenv("PHISHSHIELD_PORT", "8000"))
    API_KEY: str = os.getenv("API_KEY", "phishdefense-dev-key-change-in-prod")
    DB_PATH: str = os.getenv("DB_PATH", "platform.db")

settings = Settings()
