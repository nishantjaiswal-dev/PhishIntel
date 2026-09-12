"""
PhishShield — Scan Router (v2)
================================
All analyzers run concurrently via asyncio.gather + thread pool.
Integration notifications use a circuit-breaker with exponential backoff.
"""

import asyncio
import datetime
import logging
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse

from fastapi import APIRouter, HTTPException

from analyzers.brand_impersonation import check_brand_impersonation
from analyzers.content_checker import scan_content
from analyzers.redirect_checker import check_redirects
from analyzers.risk_indicators import risk_indicators
from analyzers.shortened_url import check_shortened_url
from analyzers.ssl_checker import check_ssl
from analyzers.typosquatting import detect_typosquatting
from analyzers.url_features import analyze_url
from analyzers.validator import validate_url
from analyzers.whois_checker import check_domain_age
from intelligence.openphish import check_openphish
from intelligence.phishtank import check_phishtank
from model.predictor import predict_url
from reporting.explanation_engine import generate_explanation
from reporting.recommendation_engine import generate_recommendations
from schemas.scan_schema import URLRequest
from scoring.risk_engine import calculate_risk

import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", ".env"), override=False)
INTEGRATION_URL = os.getenv("INTEGRATION_URL", "http://localhost:8001") + "/event/phishshield"
API_KEY = os.getenv("API_KEY", "phishdefense-dev-key-change-in-prod")

log = logging.getLogger("phishshield.scan")

# ── Thread pool (shared across requests) ─────────────────────────────────────
_executor = ThreadPoolExecutor(max_workers=16, thread_name_prefix="analyzer")

# ── Circuit breaker state ─────────────────────────────────────────────────────
_cb_lock = threading.Lock()
_cb_failures = 0
_cb_open_until = 0.0
_CB_THRESHOLD = 5
_CB_RESET_SECS = 30


def _cb_call(fn, *args, **kwargs):
    """Execute fn inside circuit breaker. Returns None silently on open circuit."""
    global _cb_failures, _cb_open_until
    with _cb_lock:
        if time.monotonic() < _cb_open_until:
            return None  # circuit open, skip
    try:
        result = fn(*args, **kwargs)
        with _cb_lock:
            _cb_failures = 0
        return result
    except Exception as exc:
        with _cb_lock:
            _cb_failures += 1
            if _cb_failures >= _CB_THRESHOLD:
                _cb_open_until = time.monotonic() + _CB_RESET_SECS
                log.warning(f"Integration circuit OPEN for {_CB_RESET_SECS}s: {exc}")
        return None


def _post_integration(payload: dict):
    """Synchronous POST with exponential-backoff retries (3 attempts)."""
    try:
        import requests as _req
    except ImportError:
        return
    delays = [1, 2, 4]
    for delay in delays:
        try:
            resp = _req.post(
                INTEGRATION_URL,
                json=payload,
                headers={"X-API-Key": API_KEY},
                timeout=4,
            )
            if resp.ok:
                return
        except Exception:
            pass
        time.sleep(delay)


def _notify_integration(payload: dict):
    """Fire-and-forget via daemon thread. Never breaks the scan endpoint."""
    threading.Thread(
        target=lambda: _cb_call(_post_integration, payload),
        daemon=True,
        name="integration-notify",
    ).start()


# ── Router ────────────────────────────────────────────────────────────────────
router = APIRouter()


@router.post("/scan")
async def scan_url(request: URLRequest):
    url = request.url

    if not validate_url(url):
        raise HTTPException(status_code=400, detail="Invalid URL")

    loop = asyncio.get_event_loop()

    def run(fn, *a, **kw):
        return loop.run_in_executor(_executor, lambda: fn(*a, **kw))

    # Run all analyzers concurrently
    (
        prediction,
        url_features,
        ssl_data,
        whois_data,
        redirect_data,
        content_data,
        openphish_data,
        phishtank_data,
        shortened_data,
        brand_data,
        typo_data,
        indicator_data,
    ) = await asyncio.gather(
        run(predict_url, url),
        run(analyze_url, url),
        run(check_ssl, url),
        run(check_domain_age, url),
        run(check_redirects, url),
        run(scan_content, url),
        run(check_openphish, url),
        run(check_phishtank, url),
        run(check_shortened_url, url),
        run(check_brand_impersonation, url),
        run(detect_typosquatting, url),
        run(risk_indicators, url),
    )

    risk = calculate_risk(
        prediction, url_features, ssl_data, whois_data, redirect_data,
        content_data, openphish_data, phishtank_data, shortened_data,
        brand_data, typo_data, indicator_data,
    )

    reasons = generate_explanation(
        prediction, ssl_data, whois_data, redirect_data, content_data,
        openphish_data, phishtank_data, shortened_data, brand_data,
        typo_data, indicator_data,
    )

    recommendations = generate_recommendations(risk["risk_score"])

    result = {
        "url": url,
        "ai_prediction": prediction,
        "url_features": url_features,
        "ssl": ssl_data,
        "whois": whois_data,
        "redirects": redirect_data,
        "content": content_data,
        "openphish": openphish_data,
        "phishtank": phishtank_data,
        "shortened_url": shortened_data,
        "brand_analysis": brand_data,
        "typosquatting": typo_data,
        "risk_indicators": indicator_data,
        "risk": risk,
        "reasons": reasons,
        "recommendations": recommendations,
    }

    # ── Notify integration service (non-blocking, circuit-broken) ─────────────
    domain = urlparse(url).netloc or url
    _notify_integration({
        "url": url,
        "domain": domain,
        "classification": prediction.get("label", "unknown") if isinstance(prediction, dict) else str(prediction),
        "confidence": float(risk.get("risk_score", 0)) / 100.0,
        "risk_score": float(risk.get("risk_score", 0)),
        "evidence": {
            "openphish": openphish_data,
            "phishtank": phishtank_data,
            "brand": brand_data,
            "typo": typo_data,
        },
        "timestamp": datetime.datetime.utcnow().isoformat(),
    })

    return result
