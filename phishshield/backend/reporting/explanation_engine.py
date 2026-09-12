def generate_explanation(
    prediction,
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

    reasons = []

    # AI Prediction

    if prediction["confidence"] > 80:

        reasons.append(
            f"AI model confidence: {prediction['confidence']}%"
        )

    # Domain Age

    age = whois_data.get(
        "domain_age_days"
    )

    if age is not None:

        if age < 30:

            reasons.append(
                f"Domain registered only {age} days ago"
            )

        elif age < 180:

            reasons.append(
                f"Relatively new domain ({age} days)"
            )

    # SSL

    if not ssl_data[
        "ssl_valid"
    ]:

        reasons.append(
            "SSL certificate is invalid or unavailable"
        )

    # Redirects

    if redirect_data[
        "redirect_count"
    ] > 3:

        reasons.append(
            f"Multiple redirects detected ({redirect_data['redirect_count']})"
        )

    # Forms

    if content_data[
        "forms"
    ] > 0:

        reasons.append(
            f"Login/input forms detected ({content_data['forms']})"
        )

    # Password Fields

    if content_data[
        "password_fields"
    ] > 0:

        reasons.append(
            "Password field detected"
        )

    # Keywords

    if content_data[
        "suspicious_words"
    ] > 0:

        reasons.append(
            f"Suspicious security keywords found ({content_data['suspicious_words']})"
        )

    # OpenPhish

    if openphish_data[
        "listed"
    ]:

        reasons.append(
            "Listed in OpenPhish database"
        )

    # PhishTank

    if phishtank_data[
        "listed"
    ]:

        reasons.append(
            "Listed in PhishTank database"
        )

    # URL Shortener

    if shortened_data[
        "is_shortened"
    ]:

        reasons.append(
            "URL shortening service detected"
        )

    # Brand Impersonation

    if brand_data[
        "impersonation"
    ]:

        brands = (
            ", ".join(
                brand_data[
                    "brands_detected"
                ]
            )
        )

        reasons.append(
            f"Possible impersonation of: {brands}"
        )

    # Typosquatting

    if typo_data[
        "possible_typosquatting"
    ]:

        targets = (
            ", ".join(
                typo_data[
                    "targets"
                ]
            )
        )

        reasons.append(
            f"Typosquatting detected targeting {targets}"
        )

    # Risk Indicators

    if indicator_data[
        "contains_ip"
    ]:

        reasons.append(
            "URL contains raw IP address"
        )

    if indicator_data[
        "contains_at"
    ]:

        reasons.append(
            "URL contains @ symbol"
        )

    if indicator_data[
        "too_many_hyphens"
    ]:

        reasons.append(
            "Excessive hyphens detected"
        )

    if indicator_data[
        "too_many_dots"
    ]:

        reasons.append(
            "Excessive subdomains detected"
        )

    if indicator_data[
        "long_url"
    ]:

        reasons.append(
            "Unusually long URL"
        )

    if indicator_data[
        "contains_hex"
    ]:

        reasons.append(
            "Encoded characters detected"
        )

    return reasons

