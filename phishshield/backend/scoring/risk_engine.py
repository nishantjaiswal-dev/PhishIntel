def calculate_risk(
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
    indicator_data
):

    score = 0

    # AI Prediction

    label = prediction.get("label", "").lower()
    confidence = prediction.get("confidence", 0)

    if label in ["phishing", "malicious"]:
        score += int(confidence * 0.5)

    # Domain Age

    age = whois_data.get("domain_age_days")

    if age is not None:

        if age < 30:
            score += 20

        elif age < 180:
            score += 10

    # SSL

    if not ssl_data.get("ssl_valid", False):
        score += 15

    # Redirects

    if redirect_data.get("redirect_count", 0) > 3:
        score += 10

    # Content Analysis

    if content_data.get("password_fields", 0) > 0:
        score += 10

    score += min(
        15,
        content_data.get("suspicious_words", 0) * 2
    )

    # Threat Intelligence

    if openphish_data.get("listed", False):
        score += 35

    if phishtank_data.get("listed", False):
        score += 35

    # URL Shortener

    if shortened_data.get("is_shortened", False):
        score += 10

    # Brand Impersonation

    if brand_data.get("impersonation", False):
        score += 50

    # Typosquatting

    if typo_data.get(
        "possible_typosquatting",
        False
    ):
        score += 50

    # Indicators

    if indicator_data.get("contains_ip", False):
        score += 20

    if indicator_data.get(
        "too_many_hyphens",
        False
    ):
        score += 10

    if indicator_data.get(
        "too_many_dots",
        False
    ):
        score += 10

    if indicator_data.get(
        "long_url",
        False
    ):
        score += 5

    if indicator_data.get(
        "contains_at",
        False
    ):
        score += 20

    if indicator_data.get(
        "contains_hex",
        False
    ):
        score += 10

    score = min(score, 100)

    if score <= 20:
        verdict = "SAFE"

    elif score <= 40:
        verdict = "LOW RISK"

    elif score <= 60:
        verdict = "SUSPICIOUS"

    elif score <= 80:
        verdict = "HIGH RISK"

    else:
        verdict = "DANGEROUS"

    return {
        "risk_score": score,
        "verdict": verdict
    }