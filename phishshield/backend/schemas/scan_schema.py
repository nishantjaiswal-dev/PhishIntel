from pydantic import BaseModel
from typing import List, Dict, Any


class URLRequest(BaseModel):
    url: str


class ScanResponse(BaseModel):

    url: str

    ai_prediction: Dict[str, Any]

    url_features: Dict[str, Any]

    ssl: Dict[str, Any]

    whois: Dict[str, Any]

    redirects: Dict[str, Any]

    content: Dict[str, Any]

    openphish: Dict[str, Any]

    phishtank: Dict[str, Any]

    shortened_url: Dict[str, Any]

    brand_analysis: Dict[str, Any]

    typosquatting: Dict[str, Any]

    risk_indicators: Dict[str, Any]

    risk: Dict[str, Any]

    reasons: List[str]

    recommendations: List[str]